import express from 'express'
import { query } from '../config/database.js'
import multer from 'multer'
import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function scanDirectory(dirPath) {
  const files = []
  
  try {
    console.log('Reading directory:', dirPath)
    const entries = await fs.readdir(dirPath)
    console.log('Found entries:', entries.length)
    
    for (const entryName of entries) {
      const fullPath = path.join(dirPath, entryName)
      const stats = await fs.stat(fullPath)
      
      if (stats.isFile()) {
        const ext = path.extname(entryName).substring(1).toLowerCase()
        
        // Debug every file
        console.log(`File: ${entryName}, Ext: ${ext}, Size: ${stats.size}`)
        
        if (['pdf', 'epub', 'mobi', 'txt', 'docx'].includes(ext)) {
          files.push({
            name: entryName,
            path: fullPath,
            format: ext,
            size: stats.size
          })
          console.log(`✅ Added to list: ${entryName}`)
        }
      }
    }
    
    console.log(`Total supported files found: ${files.length}`)
    return files
  } catch (error) {
    console.error('Error escaneando directorio:', error)
    return []
  }
}

const router = express.Router()

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

// Get configuration
router.get('/config', async (req, res) => {
  try {
    const configPath = path.join(process.cwd(), '.env')
    res.json({
      path: process.env.BOOKS_PATH || './books', 
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
    const { path: newPath, scanInterval } = req.body
    console.log('Updating config:', { newPath, scanInterval })
    res.json({
      success: true,
      message: 'Configuration updated (Session only)',
      path: newPath,
      scanInterval
    })
  } catch (error) {
    console.error('Error updating config:', error)
    res.status(500).json({ error: 'Error updating config' })
  }
})

// Get all books
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM books ORDER BY id DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching books:', error)
    res.status(500).json({ error: 'Error fetching books' })
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

// Get configuration
router.get('/config', async (req, res) => {
  try {
    const configPath = path.join(process.cwd(), '.env')
    // In a real app we'd read from DB or .env safely
    // For now returning the current BOOKS_PATH from env or default
    res.json({
      path: process.env.BOOKS_PATH || './books', 
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
    const { path: newPath, scanInterval } = req.body
    console.log('Updating config:', { newPath, scanInterval })
    
    // In a real app, update DB or .env file
    // For now we just echo back success as we are using env vars primarily
    
    res.json({
      success: true,
      message: 'Configuration updated (Session only)',
      path: newPath,
      scanInterval
    })
  } catch (error) {
    console.error('Error updating config:', error)
    res.status(500).json({ error: 'Error updating config' })
  }
})

// Upload a new book
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { title, author, description, category } = req.body
    const filePath = req.file.path
    const fileSize = req.file.size
    const fileFormat = path.extname(req.file.originalname).substring(1)

    const result = await query(
      'INSERT INTO books (title, author, description, category, file_path, file_size, file_format) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, author, description, category, filePath, fileSize, fileFormat]
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
        
        // Insert book into database
        const result = await query(
          `INSERT INTO books (name, file_path, size, format) 
           VALUES ($1, $2, $3, $4) RETURNING id, name`,
          [title, file.path, file.size, file.format]
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
    const { title, author, description, category } = req.body
    
    const result = await query(
      'UPDATE books SET title = $1, author = $2, description = $3, category = $4 WHERE id = $5 RETURNING *',
      [title, author, description, category, id]
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

    // Update book status to 'processed' if it's a summary card (assuming summary means done)
    if (type === 'summary') {
      await query('UPDATE books SET processed = 1, category_id = $1 WHERE id = $2', [category_id, id])
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

export default router