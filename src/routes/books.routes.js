import express from 'express'
import { query } from '../config/database.js'
import multer from 'multer'
import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { extractTextFromFile } from '../utils/extractor.js'
import { extractFormsFromText } from '../utils/formExtractor.js'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Get configuration
router.get('/config', async (req, res) => {
  try {
    res.json({
      booksPath: process.env.BOOKS_PATH || './books', 
      scanInterval: process.env.BOOKS_SCAN_INTERVAL || 3600
    })
  } catch (error) {
    console.error('Error fetching config:', error)
    res.status(500).json({ error: 'Error fetching config' })
  }
})

// Update configuration
router.put('/config', async (req, res) => {
  try {
    const { booksPath, scanInterval } = req.body
    console.log('Updating config:', { booksPath, scanInterval })
    
    // For now we just echo back success as we are using env vars primarily
    res.json({
      success: true,
      message: 'Configuration updated (Session only)',
      booksPath,
      scanInterval
    })
  } catch (error) {
    console.error('Error updating config:', error)
    res.status(500).json({ error: 'Error updating config' })
  }
})

// Get all books with real-time sync
router.get('/', async (req, res) => {
  try {
    // Query books joined with their latest active task info
    // Use GROUP BY to prevent duplicates when a book has multiple active tasks
    const result = await query(`
      SELECT b.*, 
             t.id as active_task_id, 
             t.status as active_task_status, 
             t.progress as active_task_progress,
             (CASE WHEN b.content IS NOT NULL AND b.content != '' THEN 1 ELSE 0 END) as has_content,
             (SELECT COUNT(*) FROM generated_cards WHERE book_id = b.id AND type = 'summary') as has_summary,
             (SELECT COUNT(*) FROM generated_cards WHERE book_id = b.id AND type = 'quotes') as has_quotes
      FROM books b
      LEFT JOIN tasks t ON (
        JSON_EXTRACT(t.payload, '$.book_id') = b.id 
        AND t.status IN ('pending', 'assigned')
      )
      GROUP BY b.id
      ORDER BY b.id DESC
    `)
    
    // Process results to ensure status consistency
    const processedBooks = result.rows.map(book => {
      let finalStatus = book.status
      let finalProgress = book.progress

      // Auto-recovery: If book is 'processing' but no active task found, revert to 'pending'
      if (book.status === 'processing' && !book.active_task_id) {
        finalStatus = 'pending'
        // Proactively update DB to fix the state (Async, don't wait)
        query("UPDATE books SET status = 'pending' WHERE id = $1", [book.id])
      }

      // Real-time progress: If active task has progress, use it
      if (book.active_task_id && book.active_task_progress > 0) {
        finalProgress = book.active_task_progress
      }

      return {
        ...book,
        status: finalStatus,
        progress: finalProgress,
        filename: book.file_path ? path.basename(book.file_path) : null
      }
    })

    res.json(processedBooks)
  } catch (error) {
    console.error('Error fetching books:', error)
    res.status(500).json({ error: 'Error fetching books' })
  }
})

// Get book content (Transcribes if missing)
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT id, file_path, content FROM books WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    
    const book = result.rows[0]
    
    if (book.content) {
      return res.json({ content: book.content })
    }
    
    // Auto-transcribe if content is null
    if (!book.file_path) {
      console.error(`❌ Cannot transcribe book ${id}: file_path is missing`)
      return res.status(400).json({ error: 'Book file path is missing, cannot transcribe' })
    }

    console.log(`📝 Auto-transcribing missing content for book ${id}...`)
    try {
      const text = await extractTextFromFile(book.file_path)
      
      if (!text) {
        throw new Error('Extraction returned empty content')
      }

      await query('UPDATE books SET content = $1 WHERE id = $2', [text, id])
      res.json({ content: text })
    } catch (extractError) {
      console.error(`❌ Extraction failed for book ${id}:`, extractError)
      // Return a message instead of 500 to keep UI functional
      res.json({ content: 'Content could not be extracted automatically. Please verify the file format or server logs.' })
    }
  } catch (error) {
    console.error('Error fetching/transcribing book content:', error)
    res.status(500).json({ error: 'Error fetching book content', details: error.message })
  }
});

// Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM books WHERE id = $1', [id])
    
    const book = result.rows[0]
    res.json({
      ...book,
      filename: book.file_path ? path.basename(book.file_path) : null
    })
  } catch (error) {
    console.error('Error fetching book:', error)
    res.status(500).json({ error: 'Error fetching book' })
  }
})

// Helper function to scan directory
async function scanDirectory(dirPath) {
  const files = []
  try {
    const entries = await fs.readdir(dirPath)
    for (const entryName of entries) {
      const fullPath = path.join(dirPath, entryName)
      const stats = await fs.stat(fullPath)
      if (stats.isFile()) {
        const ext = path.extname(entryName).substring(1).toLowerCase()
        if (['pdf', 'epub', 'mobi', 'txt', 'docx'].includes(ext)) {
          files.push({
            name: entryName,
            path: fullPath,
            format: ext,
            size: stats.size
          })
        }
      }
    }
    return files
  } catch (error) {
    console.error('Error scanning directory:', error)
    return []
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'data/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// Upload a new book
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { name, category } = req.body
    const filePath = req.file.path
    const size = req.file.size
    const format = path.extname(req.file.originalname).substring(1)

    const result = await query(
      'INSERT INTO books (name, category, file_path, size, format) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name || req.file.originalname, category, filePath, size, format]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error uploading book:', error)
    res.status(500).json({ error: 'Error uploading book' })
  }
})

// Scan directory for books and add to database
router.post('/scan', async (req, res) => {
  try {
    console.log('🔍 Starting directory scan...')
    
    const booksDir = path.join(process.cwd(), 'data', 'books')
    console.log('📁 Scanning directory:', booksDir)
    
    // Check if directory exists
    try {
      await fs.access(booksDir)
      console.log('✅ Directory exists:', booksDir)
    } catch (error) {
      console.error('❌ Directory does not exist:', booksDir)
      return res.status(404).json({ error: 'Books directory not found' })
    }
    
    const files = await scanDirectory(booksDir)
    console.log('📚 Found files:', files.length)
    
    if (files.length === 0) {
      return res.json({ message: 'No supported files found', count: 0 })
    }
    
    let addedCount = 0
    
    for (const file of files) {
      // Clean title from filename (defined outside try block)
      let title = path.basename(file.name, path.extname(file.name))
      title = title.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      try {
        console.log(`📖 Processing: ${file.name}`)
        
        // Check if book already exists
        const existing = await query('SELECT id FROM books WHERE file_path = $1', [file.path])
        
        if (existing.rows.length > 0) {
          console.log(`⚠️  Already exists: ${title}`)
          continue
        }
        
        // Extract text proactively
        let content = null
        try {
          console.log(`📝 Extracting text for: ${title}`)
          content = await extractTextFromFile(file.path)
        } catch (err) {
          console.error(`⚠️  Failed to extract text for ${title}:`, err.message)
        }

        // Insert book into database
        const result = await query(
          `INSERT INTO books (name, file_path, size, format, category, status, progress, content) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name`,
          [title, file.path, file.size, file.format, 'General', 'pending', 0, content]
        )
        
        if (result.rows && result.rows.length > 0) {
          console.log(`✅ Added: ${title} (ID: ${result.rows[0].id})`)
          addedCount++
        } else {
          console.log(`⚠️  Added but no ID returned: ${title}`)
          addedCount++
        }
        
      } catch (error) {
        console.error(`❌ Error adding ${file.name}:`, error.message)
        console.error(`❌ Full error:`, error)
        console.error(`❌ Query params:`, [title, file.path, file.size, file.format])
      }
    }
    
    const totalBooksQuery = await query('SELECT COUNT(*) as count FROM books')
    const totalBooks = parseInt(totalBooksQuery.rows[0].count)
    
    res.json({
      message: `Directory scan completed`,
      found: files.length,
      added: addedCount,
      totalBooks: totalBooks
    })
    
  } catch (error) {
    console.error('Error in scan endpoint:', error)
    res.status(500).json({ error: 'Error scanning directory' })
  }
})

// Update book details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, category } = req.body
    
    const result = await query(
      'UPDATE books SET name = $1, category = $2 WHERE id = $3 RETURNING *',
      [name, category, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Error updating book:', error)
    res.status(500).json({ error: 'Error updating book' })
  }
})

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await query('DELETE FROM books WHERE id = $1 RETURNING *', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    
    res.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    res.status(500).json({ error: 'Error deleting book' })
  }
})

// Create a generated card for a book (Agent endpoint)
router.post('/:id/cards', async (req, res) => {
  try {
    const { id } = req.params
    const { category_id, type, content, tags } = req.body
    
    // Verify book exists
    const bookCheck = await query('SELECT id FROM books WHERE id = $1', [id])
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }

    // Prevent duplicates: Delete existing cards of the same type for this book
    console.log(`🧹 Deleting old cards of type "${type}" for book ${id} before inserting new one...`)
    await query('DELETE FROM generated_cards WHERE book_id = $1 AND type = $2', [id, type])

    // Insert card
    const result = await query(
      'INSERT INTO generated_cards (book_id, category_id, type, content, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [id, category_id, type, content, JSON.stringify(tags || [])]
    )

    // Update book status to 'processed' if it's a summary card
    // ALWAYS set status back to 'pending' to re-enable UI buttons
    if (type === 'summary') {
      await query("UPDATE books SET processed = 1, status = 'pending', category_id = $1 WHERE id = $2", [category_id, id])
    } else {
      await query("UPDATE books SET status = 'pending' WHERE id = $1", [id])
    }
    
    res.status(201).json({ 
      id: result.rows[0]?.id || result.id, 
      message: 'Card created successfully' 
    })
  } catch (error) {
    console.error('Error creating card:', error)
    res.status(500).json({ error: 'Error creating card' })
  }
})

// Get cards for a book
router.get('/:id/cards', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM generated_cards WHERE book_id = $1 ORDER BY created_at DESC', [id])
    res.json(result.rows)
  } catch (error) {
     console.error('Error fetching cards:', error)
     res.status(500).json({ error: 'Error fetching cards' })
  }
})

// Endpoint para crear tareas de agente (Reader, Extractor, Phrases)
router.post('/:id/task', async (req, res) => {
  try {
    const { id } = req.params
    const { type } = req.body

    if (!['reader', 'extractor', 'phrases'].includes(type)) {
      return res.status(400).json({ error: 'Invalid task type. Options: reader, extractor, phrases' })
    }

    // Verify book exists
    const bookCheck = await query('SELECT id, name FROM books WHERE id = $1', [id])
    if (bookCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    const book = bookCheck.rows[0]

    // Create payload
    const payload = {
      book_id: book.id,
      book_name: book.name,
      action: type
    }
    
    // Generic agent type for books
    const agentType = 'book_agent'
    const taskId = crypto.randomUUID()

    const result = await query(
      `INSERT INTO tasks (id, agent_type, payload, status, priority) 
       VALUES ($1, $2, $3, 'pending', 1)`,
      [taskId, agentType, JSON.stringify(payload)]
    )

    // Set book status to processing to disable UI buttons
    await query("UPDATE books SET status = 'processing' WHERE id = $1", [id])

    res.status(201).json({
      success: true,
      data: {
        task_id: taskId,
        status: 'pending'
      },
      message: `Task ${type} created for book ${book.name}`
    })

  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update book progress
router.put('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params
    const { progress } = req.body
    
    // Validate progress
    const progressVal = parseInt(progress)
    if (isNaN(progressVal) || progressVal < 0 || progressVal > 100) {
      return res.status(400).json({ error: 'Invalid progress value (0-100)' })
    }

    await query('UPDATE books SET progress = $1 WHERE id = $2', [progressVal, id])
    
    res.json({ success: true, message: 'Progress updated', progress: progressVal })
  } catch (error) {
    console.error('Error updating progress:', error)
    res.status(500).json({ error: 'Error updating progress' })
  }
})

// Chat with book using Ollama
router.post('/:id/chat', async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Get book details
    const bookResult = await query('SELECT * FROM books WHERE id = $1', [id])
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    const book = bookResult.rows[0]

    // Get book content
    let content = book.content
    if (!content) {
      try {
        content = await extractTextFromFile(book.file_path)
      } catch (err) {
        console.error('Error extracting book content:', err)
        content = 'Content not available'
      }
    }

    // Get generated cards for additional context
    const cardsResult = await query(
      'SELECT type, content FROM generated_cards WHERE book_id = $1 ORDER BY created_at DESC',
      [id]
    )
    const cards = cardsResult.rows

    // Build context from book and cards
    const summaryCards = cards.filter(c => c.type === 'summary')
    const extractionCards = cards.filter(c => c.type === 'key_points' || c.type === 'extractor')
    const phraseCards = cards.filter(c => c.type === 'quotes' || c.type === 'phrases')

    let context = `Book Title: ${book.name}\n`
    context += `Category: ${book.category || 'General'}\n\n`

    if (summaryCards.length > 0) {
      context += `Summary:\n${summaryCards[0].content}\n\n`
    }

    if (extractionCards.length > 0) {
      context += `Key Points:\n${extractionCards.map(c => c.content).join('\n')}\n\n`
    }

    if (phraseCards.length > 0) {
      context += `Notable Quotes:\n${phraseCards.map(c => c.content).join('\n')}\n\n`
    }

    // Add snippet of actual content (first 3000 chars to avoid token limits)
    if (content && content !== 'Content not available') {
      context += `Book Content (excerpt):\n${content.substring(0, 3000)}...\n\n`
    }

    // Build prompt for Ollama
    const prompt = `You are a dedicated COACH and expert on the book "${book.name}".
    Your goal is to help the user understand and APPLY the principles of this book to their life/business.
    
    Context about the book:
    ${context}
    
    User question: ${message}
    
    Instructions:
    1. Answer as a coach: supportive, actionable, and knowledgeable.
    2. Use the book's specific concepts and terminology.
    3. If the user asks for advice, give concrete steps based on the book.
    4. If the info isn't in the context, admit it but try to give general advice aligned with the book's theme.`

    // Call Ollama API
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3'

    const ollamaResponse = await fetch(`${ollamaHost}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      })
    })

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`)
    }

    const ollamaData = await ollamaResponse.json()
    const answer = ollamaData.response

    res.json({
      success: true,
      message: answer,
      book: {
        id: book.id,
        name: book.name
      }
    })

  } catch (error) {
    console.error('Error in chat endpoint:', error)
    
    // Check if Ollama is the issue
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'Ollama service is not available. Please ensure Ollama is running.',
        details: error.message
      })
    }
    
    res.status(500).json({ error: 'Error processing chat request' })
  }
})

// ============= FORMS ENDPOINTS =============

// Extract forms from book content
router.post('/:id/extract-forms', async (req, res) => {
  try {
    const { id } = req.params

    // Get book details
    const bookResult = await query('SELECT * FROM books WHERE id = $1', [id])
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    const book = bookResult.rows[0]

    // Get book content
    let content = book.content
    if (!content) {
      try {
        content = await extractTextFromFile(book.file_path)
      } catch (err) {
        console.error('Error extracting book content:', err)
        return res.status(500).json({ error: 'Could not extract book content' })
      }
    }

    // Extract forms using AI
    const forms = await extractFormsFromText(content, book.name)

    // Save forms to database
    const savedForms = []
    for (const form of forms) {
      const result = await query(
        `INSERT INTO book_forms (book_id, title, page_number, questions) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [id, form.title, form.pageNumber, JSON.stringify(form.questions)]
      )
      savedForms.push(result.rows[0])
    }

    res.json({
      success: true,
      formsExtracted: savedForms.length,
      forms: savedForms.map(f => ({
        id: f.id,
        title: f.title,
        pageNumber: f.page_number,
        questions: JSON.parse(f.questions),
        extractedAt: f.extracted_at
      }))
    })

  } catch (error) {
    console.error('Error extracting forms:', error)
    
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      return res.status(503).json({ 
        error: 'Ollama service is not available. Please ensure Ollama is running.',
        details: error.message
      })
    }
    
    res.status(500).json({ error: 'Error extracting forms' })
  }
})

// Get all forms for a book
router.get('/:id/forms', async (req, res) => {
  try {
    const { id } = req.params

    // Get forms
    const formsResult = await query(
      'SELECT * FROM book_forms WHERE book_id = $1 ORDER BY page_number, id',
      [id]
    )

    // Get user responses for each form
    const forms = []
    for (const form of formsResult.rows) {
      const responsesResult = await query(
        'SELECT * FROM form_responses WHERE form_id = $1 ORDER BY updated_at DESC LIMIT 1',
        [form.id]
      )

      forms.push({
        id: form.id,
        title: form.title,
        pageNumber: form.page_number,
        questions: JSON.parse(form.questions),
        extractedAt: form.extracted_at,
        userResponses: responsesResult.rows.length > 0 
          ? JSON.parse(responsesResult.rows[0].responses)
          : null,
        lastUpdated: responsesResult.rows.length > 0
          ? responsesResult.rows[0].updated_at
          : null
      })
    }

    res.json({ forms })

  } catch (error) {
    console.error('Error getting forms:', error)
    res.status(500).json({ error: 'Error retrieving forms' })
  }
})

// Save user responses to a form
router.post('/forms/:formId/responses', async (req, res) => {
  try {
    const { formId } = req.params
    const { responses } = req.body

    if (!responses || typeof responses !== 'object') {
      return res.status(400).json({ error: 'Invalid responses format' })
    }

    // Check if form exists
    const formResult = await query('SELECT * FROM book_forms WHERE id = $1', [formId])
    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' })
    }

    // Check if user already has responses for this form
    const existingResult = await query(
      'SELECT * FROM form_responses WHERE form_id = $1 AND user_id IS NULL LIMIT 1',
      [formId]
    )

    let result
    if (existingResult.rows.length > 0) {
      // Update existing responses
      result = await query(
        `UPDATE form_responses 
         SET responses = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING *`,
        [JSON.stringify(responses), existingResult.rows[0].id]
      )
    } else {
      // Insert new responses
      result = await query(
        `INSERT INTO form_responses (form_id, user_id, responses) 
         VALUES ($1, NULL, $2) 
         RETURNING *`,
        [formId, JSON.stringify(responses)]
      )
    }

    res.json({
      success: true,
      responseId: result.rows[0].id,
      updatedAt: result.rows[0].updated_at
    })

  } catch (error) {
    console.error('Error saving form responses:', error)
    res.status(500).json({ error: 'Error saving responses' })
  }
})

// Get user responses for a specific form
router.get('/forms/:formId/responses', async (req, res) => {
  try {
    const { formId } = req.params

    const result = await query(
      'SELECT * FROM form_responses WHERE form_id = $1 AND user_id IS NULL ORDER BY updated_at DESC LIMIT 1',
      [formId]
    )

    if (result.rows.length === 0) {
      return res.json({ responses: null })
    }

    res.json({
      formId: parseInt(formId),
      responses: JSON.parse(result.rows[0].responses),
      completedAt: result.rows[0].completed_at,
      updatedAt: result.rows[0].updated_at
    })

  } catch (error) {
    console.error('Error getting form responses:', error)
    res.status(500).json({ error: 'Error retrieving responses' })
  }
})

// Delete a form
router.delete('/forms/:formId', async (req, res) => {
  try {
    const { formId } = req.params

    await query('DELETE FROM book_forms WHERE id = $1', [formId])

    res.json({ success: true })

  } catch (error) {
    console.error('Error deleting form:', error)
    res.status(500).json({ error: 'Error deleting form' })
  }
})

export default router