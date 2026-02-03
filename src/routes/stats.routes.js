import express from 'express'
import { query } from '../config/sqlite.js'

const router = express.Router()

/**
 * @route   GET /api/stats
 * @desc    Get aggregated system statistics
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Parallelize queries for performance
    const [booksResult, tasksResult, devicesResult] = await Promise.all([
        query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN processed = 1 THEN 1 END) as processed,
                COUNT(CASE WHEN status = 'pending' AND processed = 0 THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing
            FROM books
        `),
        query(`
            SELECT COUNT(*) as completed FROM tasks WHERE status = 'completed'
        `),
        query(`
            SELECT COUNT(*) as active FROM devices WHERE status = 'online'
        `)
    ])

    const books = booksResult.rows[0]
    const tasks = tasksResult.rows[0]
    const devices = devicesResult.rows[0]

    // Calculate system health based on failures vs success (mock logic for now)
    // In real scenario could be based on error logs or server load
    const systemHealth = 98 

    const stats = {
      totalBooks: parseInt(books.total || 0),
      processedBooks: parseInt(books.processed || 0),
      pendingBooks: parseInt(books.pending || 0),
      processingBooks: parseInt(books.processing || 0),
      activeDevices: parseInt(devices.active || 0),
      completedTasks: parseInt(tasks.completed || 0),
      systemHealth: systemHealth
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Error fetching system statistics' })
  }
})

export default router
