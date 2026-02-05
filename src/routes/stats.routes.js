import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

/**
 * @route   GET /api/stats
 * @desc    Get aggregated system statistics
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
    const [booksResult, tasksResult, devicesResult, knowledgeResult, interactionsResult, agentUsageResult, taskTimeResult] = await Promise.all([
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
        `),
        query(`
            SELECT 
                COUNT(*) as total_cards,
                COUNT(CASE WHEN type = 'quote' THEN 1 END) as quotes,
                COUNT(CASE WHEN type = 'summary' THEN 1 END) as summaries,
                COUNT(CASE WHEN type = 'key_points' THEN 1 END) as insights
            FROM generated_cards
        `),
        query(`
            SELECT COUNT(*) as messages FROM global_chat_messages WHERE role = 'user'
        `),
        query(`
            SELECT agent_type, COUNT(*) as count 
            FROM tasks 
            GROUP BY agent_type
        `),
        query(`
            SELECT SUM(COALESCE(execution_time, 0)) as total_time 
            FROM agent_performance
        `)
    ])

    const books = booksResult.rows[0]
    const tasks = tasksResult.rows[0]
    const devices = devicesResult.rows[0]
    const knowledge = knowledgeResult.rows[0]
    const interactions = interactionsResult.rows[0]
    const agentUsage = agentUsageResult.rows
    const taskTime = taskTimeResult.rows[0]

    // Calculate Brain Level with safety defaults
    const knowledgeTotal = parseInt(knowledge?.total_cards || 0)
    const booksProcessed = parseInt(books?.processed || 0)
    const interactionMessages = parseInt(interactions?.messages || 0)

    const rawScore = (knowledgeTotal * 1) + 
                     (booksProcessed * 10) + 
                     (interactionMessages * 5)
    
    // Calculate Agent Stats
    const totalTasks = agentUsage.reduce((acc, curr) => acc + curr.count, 0)
    const agentStats = agentUsage.map(a => ({
        name: a.agent_type,
        count: a.count,
        percentage: totalTasks > 0 ? Math.round((a.count / totalTasks) * 100) : 0
    }))

    const stats = {
      totalBooks: parseInt(books.total || 0),
      processedBooks: parseInt(books.processed || 0),
      pendingBooks: parseInt(books.pending || 0),
      processingBooks: parseInt(books.processing || 0),
      activeDevices: parseInt(devices.active || 0),
      completedTasks: parseInt(tasks.completed || 0),
      
      contentStats: {
        quotes: parseInt(knowledge.quotes || 0),
        summaries: parseInt(knowledge.summaries || 0),
        insights: parseInt(knowledge.insights || 0),
        totalKnowledge: parseInt(knowledge.total_cards || 0)
      },

      agentStats: {
        breakdown: agentStats,
        totalExecutionTime: parseInt(taskTime.total_time || 0) // in ms
      },

      brainMetrics: {
        score: rawScore,
        level: Math.floor(Math.sqrt(rawScore)) || 1,
        totalCards: parseInt(knowledge.total_cards || 0),
        totalInteractions: parseInt(interactions.messages || 0)
      },
      systemHealth: 98
    }

    res.json(stats)
  } catch (error) {
    console.error('Error fetching system stats:', error)
    // Return a partial success with empty stats instead of a 500
    res.status(200).json({ 
      error: 'Incomplete stats data',
      message: error.message,
      totalBooks: 0,
      processedBooks: 0,
      pendingBooks: 0,
      processingBooks: 0,
      activeDevices: 0,
      completedTasks: 0,
      contentStats: { quotes: 0, summaries: 0, insights: 0, totalKnowledge: 0 },
      agentStats: { breakdown: [], totalExecutionTime: 0 },
      brainMetrics: { score: 0, level: 1, totalCards: 0, totalInteractions: 0 },
      systemHealth: 50
    })
  }
})

export default router
