import express from 'express'
import { query } from '../config/database.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'

const router = express.Router()

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'data', 'uploads')
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB por archivo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/epub+zip',
      'application/x-mobipocket-ebook',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no soportado'))
    }
  }
})

/**
 * @route   GET /api/books
 * @desc    Obtener todos los libros
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { category, status, limit = 50, offset = 0 } = req.query

    let queryText = 'SELECT * FROM books'
    const queryParams = []
    const conditions = []

    if (category) {
      conditions.push(`category = $${queryParams.length + 1}`)
      queryParams.push(category)
    }

    if (status) {
      conditions.push(`status = $${queryParams.length + 1}`)
      queryParams.push(status)
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ')
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await query(queryText, queryParams)

    res.json({
      success: true,
      data: result.rows.map(book => ({
        ...book,
        size: parseInt(book.size) || 0
      }))
    })

  } catch (error) {
    console.error('Error obteniendo libros:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo libros'
    })
  }
})

/**
 * @route   POST /api/books/upload
 * @desc    Subir nuevos libros
 * @access  Private
 */
router.post('/upload', upload.array('books', 10), async (req, res) => {
  try {
    const uploadedFiles = []
    const errors = []

    for (const file of req.files) {
      try {
        // Determinar categoría basada en el nombre del archivo
        const category = determineCategory(file.originalname)
        
        // Insertar en la base de datos
        const result = await query(
          `INSERT INTO books (name, file_path, category, format, size, status)
           VALUES ($1, $2, $3, $4, $5, 'pending')
           RETURNING *`,
          [
            file.originalname,
            file.path,
            category,
            path.extname(file.originalname).substring(1),
            file.size
          ]
        )

        uploadedFiles.push({
          id: result.rows[0].id,
          name: file.originalname,
          category,
          format: path.extname(file.originalname).substring(1),
          size: file.size
        })

        // Iniciar procesamiento asíncrono
        processBookAsync(result.rows[0].id)

      } catch (error) {
        console.error(`Error procesando archivo ${file.originalname}:`, error)
        errors.push({
          filename: file.originalname,
          error: error.message
        })
      }
    }

    res.status(201).json({
      success: true,
      data: {
        uploaded_files: uploadedFiles,
        errors: errors,
        total_uploaded: uploadedFiles.length,
        total_errors: errors.length
      }
    })

  } catch (error) {
    console.error('Error subiendo libros:', error)
    res.status(500).json({
      success: false,
      error: 'Error subiendo libros'
    })
  }
})

/**
 * @route   POST /api/books/scan
 * @desc    Escanear directorio de libros físicos
 * @access  Private
 */
router.post('/scan', async (req, res) => {
  try {
    const booksPath = process.env.BOOKS_PATH || '/app/books'
    
    // Verificar que el directorio exista
    try {
      await fs.access(booksPath)
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Directorio de libros no encontrado',
        path: booksPath
      })
    }

    // Escanear directorio en busca de archivos
    const files = await scanDirectory(booksPath)
    let processedCount = 0
    let skippedCount = 0

    for (const file of files) {
      try {
        // Verificar si el archivo ya existe en la base de datos
        const existingResult = await query(
          'SELECT id FROM books WHERE file_path = $1',
          [file.path]
        )

        if (existingResult.rows.length > 0) {
          skippedCount++
          continue
        }

        // Insertar nuevo libro
        const category = determineCategory(file.name)
        
        await query(
          `INSERT INTO books (name, file_path, category, format, size, status)
           VALUES ($1, $2, $3, $4, $5, 'pending')`,
          [
            file.name,
            file.path,
            category,
            file.format,
            file.size
          ]
        )

        processedCount++

        // Iniciar procesamiento asíncrono
        processBookAsync(file.name)

      } catch (error) {
        console.error(`Error procesando archivo ${file.name}:`, error)
      }
    }

    res.json({
      success: true,
      data: {
        scanned_path: booksPath,
        total_files_found: files.length,
        new_books_processed: processedCount,
        existing_books_skipped: skippedCount,
        scan_completed: true
      }
    })

  } catch (error) {
    console.error('Error escaneando libros:', error)
    res.status(500).json({
      success: false,
      error: 'Error escaneando libros'
    })
  }
})

/**
 * @route   GET /api/books/config
 * @desc    Obtener configuración de libros
 * @access  Private
 */
router.get('/config', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        books_path: process.env.BOOKS_PATH || '/app/books',
        scan_interval: parseInt(process.env.BOOKS_SCAN_INTERVAL) || 3600,
        supported_formats: ['pdf', 'epub', 'mobi', 'txt', 'docx'],
        max_file_size: 50 * 1024 * 1024, // 50MB
        auto_scan: process.env.AUTO_SCAN === 'true'
      }
    })

  } catch (error) {
    console.error('Error obteniendo configuración:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo configuración'
    })
  }
})

/**
 * @route   PUT /api/books/config
 * @desc    Actualizar configuración de libros
 * @access  Private
 */
router.put('/config', async (req, res) => {
  try {
    const { path, scan_interval } = req.body

    // Validar que la ruta exista si se proporciona
    if (path) {
      try {
        await fs.access(path)
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'La ruta especificada no existe o no es accesible'
        })
      }
    }

    // En producción, esto se guardaría en un archivo de configuración
    // Por ahora, solo retornamos la configuración actualizada
    res.json({
      success: true,
      data: {
        books_path: path || process.env.BOOKS_PATH || '/app/books',
        scan_interval: scan_interval || process.env.BOOKS_SCAN_INTERVAL || 3600
      },
      message: 'Configuración actualizada'
    })

  } catch (error) {
    console.error('Error actualizando configuración:', error)
    res.status(500).json({
      success: false,
      error: 'Error actualizando configuración'
    })
  }
})

/**
 * @route   GET /api/books/:id
 * @desc    Obtener detalles de un libro específico
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await query('SELECT * FROM books WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Libro no encontrado'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error obteniendo libro:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo libro'
    })
  }
})

/**
 * @route   DELETE /api/books/:id
 * @desc    Eliminar un libro
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Obtener información del libro antes de eliminar
    const bookResult = await query('SELECT file_path FROM books WHERE id = $1', [id])

    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Libro no encontrado'
      })
    }

    // Eliminar archivo físico
    try {
      await fs.unlink(bookResult.rows[0].file_path)
    } catch (error) {
      console.warn('No se pudo eliminar el archivo físico:', error.message)
    }

    // Eliminar registro de la base de datos
    await query('DELETE FROM books WHERE id = $1', [id])

    res.json({
      success: true,
      message: 'Libro eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando libro:', error)
    res.status(500).json({
      success: false,
      error: 'Error eliminando libro'
    })
  }
})

/**
 * Funciones auxiliares
 */

function determineCategory(filename) {
  const name = filename.toLowerCase()
  
  if (name.includes('emprende') || name.includes('negocio') || name.includes('business')) {
    return 'emprendimiento'
  } else if (name.includes('finanza') || name.includes('dinero') || name.includes('inversion')) {
    return 'finanzas'
  } else if (name.includes('market') || name.includes('venta') || name.includes('marketing')) {
    return 'marketing'
  } else if (name.includes('lider') || name.includes('management') || name.includes('jefe')) {
    return 'liderazgo'
  } else if (name.includes('desarrollo') || name.includes('personal') || name.includes('crecimiento')) {
    return 'desarrollo-personal'
  } else if (name.includes('tecno') || name.includes('software') || name.includes('program')) {
    return 'tecnologia'
  } else {
    return 'otros'
  }
}

async function scanDirectory(dirPath) {
  const files = []
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      
      if (entry.isFile()) {
        const ext = path.extname(entry.name).substring(1).toLowerCase()
        const stats = await fs.stat(fullPath)
        
        if (['pdf', 'epub', 'mobi', 'txt', 'docx'].includes(ext)) {
          files.push({
            name: entry.name,
            path: fullPath,
            format: ext,
            size: stats.size
          })
        }
      } else if (entry.isDirectory()) {
        // Escanear subdirectorios recursivamente
        const subFiles = await scanDirectory(fullPath)
        files.push(...subFiles)
      }
    }
  } catch (error) {
    console.error('Error escaneando directorio:', error)
  }
  
  return files
}

async function processBookAsync(bookId) {
  try {
    // Actualizar estado a procesando
    await query(
      'UPDATE books SET status = $1, progress = 0 WHERE id = $2',
      ['processing', bookId]
    )

    // Simular procesamiento (en producción, esto extraería texto, analizaría contenido, etc.)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await query(
        'UPDATE books SET progress = $1 WHERE id = $2',
        [i, bookId]
      )
    }

    // Marcar como procesado
    await query(
      'UPDATE books SET status = $1, progress = 100, updated_at = NOW() WHERE id = $2',
      ['processed', bookId]
    )

    console.log(`Libro ${bookId} procesado exitosamente`)

  } catch (error) {
    console.error(`Error procesando libro ${bookId}:`, error)
    
    await query(
      'UPDATE books SET status = $1 WHERE id = $2',
      ['error', bookId]
    )
  }
}

export default router