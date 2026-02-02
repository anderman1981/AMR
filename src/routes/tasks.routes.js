import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

/**
 * @route   POST /api/books/:id/task
 * @desc    Create a new task for a specific book
 * @access  Public
 */
router.post('/books/:id/task', async (req, res) => {
  try {
    const { id } = req.params
    const { type } = req.body // e.g., 'reader', 'extractor', 'phrases'

    if (!['reader', 'extractor', 'phrases'].includes(type)) {
      return res.status(400).json({ error: 'Invalid task type' })
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
    
    // Agent mapping
    const agentType = 'book_agent' // Generic agent type that handles all book ops

    // Insert Task
    const result = await query(
      `INSERT INTO tasks (agent_type, payload, status, priority) 
       VALUES ($1, $2, 'pending', 1) 
       RETURNING id`,
      [agentType, JSON.stringify(payload)]
    )

    res.status(201).json({
      success: true,
      data: {
        task_id: result.rows[0].id,
        status: 'pending'
      },
      message: `Task ${type} created for book ${book.name}`
    })

  } catch (error) {
    console.error('Error creating task:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   GET /api/tasks
 * @desc    List all tasks
 * @access  Public (admin)
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query
    
    let queryText = 'SELECT * FROM tasks'
    const queryParams = []
    
    if (status) {
      queryText += ' WHERE status = $1'
      queryParams.push(status)
    }
    
    queryText += ' ORDER BY created_at DESC LIMIT $' + (queryParams.length + 1)
    queryParams.push(parseInt(limit))
    
    const result = await query(queryText, queryParams)
    
    res.json({
      success: true,
      data: {
        tasks: result.rows,
        total: result.rowCount
      }
    })
  } catch (error) {
    console.error('Error listing tasks:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * @route   PATCH /api/tasks/:id/progress
 * @desc    Update task progress
 * @access  Private (device)
 */
router.patch('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params
    const { progress } = req.body

    const result = await query(
      'UPDATE tasks SET progress = $1, updated_at = datetime(\'now\') WHERE id = $2 RETURNING id',
      [progress, id]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    res.json({ success: true, message: 'Task progress updated' })
  } catch (error) {
    console.error('Error updating task progress:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

export default router