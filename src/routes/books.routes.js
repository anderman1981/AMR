import express from 'express'
import { query } from '../config/database.js'
import multer from 'multer'
import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import { extractTextFromFile } from '../utils/extractor.js'

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
    const result = await query(`
      SELECT b.*, 
             t.id as active_task_id, 
             t.status as active_task_status, 
             t.progress as active_task_progress
      FROM books b
      LEFT JOIN tasks t ON (
        JSON_EXTRACT(t.payload, '$.book_id') = b.id 
        AND t.status IN ('pending', 'assigned')
      )
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
        progress: finalProgress
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
    console.log(`📝 Auto-transcribing missing content for book ${id}...`)
    const text = await extractTextFromFile(book.file_path)
    
    await query('UPDATE books SET content = $1 WHERE id = $2', [text, id])
    
    res.json({ content: text })
  } catch (error) {
    console.error('Error fetching/transcribing book content:', error)
    res.status(500).json({ error: 'Error fetching book content' })
  }
})

// Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM books WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    
    res.json(result.rows[0])
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
       VALUES ($1, $2, $3, 'pending', 1) 
       RETURNING id`,
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

export default router