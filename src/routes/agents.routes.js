import express from 'express'
import { query } from '../config/database.js'

// Import specialized agents for AMROIS 2.0
import interpreter from '../agents/InterpreterAgent.js'
import extractor from '../agents/ExtractorAgent.js'
import analyzer from '../agents/AnalyzerAgent.js'
import synthesizer from '../agents/SynthesizerAgent.js'
import narrator from '../agents/NarratorAgent.js'

const router = express.Router()

// --- AMROIS 2.0 SPECIALIZED AGENTS ENDPOINTS ---

/**
 * @route   POST /api/agents/interpreter
 * @desc    Run intent classification
 */
router.post('/interpreter', async (req, res) => {
  try {
    const { query: userInput } = req.body;
    if (!userInput) return res.status(400).json({ error: 'Query is required' });
    
    const result = await interpreter.execute({ query: userInput });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/agents/extractor
 * @desc    Run RAG knowledge extraction
 */
router.post('/extractor', async (req, res) => {
  try {
    const { query: userInput, bookIds = [] } = req.body;
    if (!userInput) return res.status(400).json({ error: 'Query is required' });
    
    const result = await extractor.execute({ query: userInput, bookIds });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/agents/analyzer
 * @desc    Run framework-based analysis
 */
router.post('/analyzer', async (req, res) => {
  try {
    const { content, query: userInput, framework = 'Feynman' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    const result = await analyzer.execute({ content, query: userInput, framework });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/agents/synthesizer
 * @desc    Run insight synthesis
 */
router.post('/synthesizer', async (req, res) => {
  try {
    const { items, query: userInput } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Items array is required' });
    
    const result = await synthesizer.execute({ items, query: userInput });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route   POST /api/agents/narrator
 * @desc    Run tone adjustment / narration
 */
router.post('/narrator', async (req, res) => {
  try {
    const { content, query: userInput, persona = 'Coach' } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    
    const result = await narrator.execute({ content, query: userInput, persona });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- LEGACY DEVICE/TASK AGENTS ENDPOINTS ---

/**
 * @route   GET /api/agents
 * @desc    Listar todos los agentes
 * @access  Private (admin)
 */
/**
 * @route   GET /api/agents
 * @desc    List all agents (devices) with real-time stats
 * @access  Private (admin)
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query

    let queryText = `
      SELECT id, name, department, status, 
             cpu_usage as cpuUsage, 
             memory_usage as memoryUsage, 
             last_heartbeat as lastHeartbeat
      FROM devices
    `
    
    const queryParams = []
    if (status) {
      queryText += ' WHERE status = $1'
      queryParams.push(status)
    }

    queryText += ' ORDER BY last_heartbeat DESC'

    const result = await query(queryText, queryParams)

    res.json({
      success: true,
      data: {
        agents: result.rows,
        total: result.rowCount
      }
    })

  } catch (error) {
    console.error('Error listando agentes:', error)
    res.status(500).json({
      success: false,
      error: 'Error listando agentes'
    })
  }
})

/**
 * @route   GET /api/agents/:name/status
 * @desc    Obtener estado de un agente específico
 * @access  Private
 */
router.get('/:name/status', async (req, res) => {
  try {
    const { name } = req.params

    // Obtener estadísticas del agente
    const statsResult = await query(`
      SELECT 
        agent_name,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_tasks,
        AVG(execution_time) as avg_execution_time,
        MAX(created_at) as last_activity,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as tasks_last_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as tasks_last_7d
      FROM agent_performance
      WHERE agent_name = $1
    `, [name])

    // Obtener tareas recientes
    const recentTasksResult = await query(`
      SELECT task_type, execution_time, success, created_at, metrics
      FROM agent_performance
      WHERE agent_name = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [name])

    if (statsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agente no encontrado'
      })
    }

    const stats = statsResult.rows[0]

    res.json({
      success: true,
      data: {
        name: stats.agent_name,
        total_tasks: parseInt(stats.total_tasks),
        completed_tasks: parseInt(stats.completed_tasks),
        successful_tasks: parseInt(stats.successful_tasks),
        avg_execution_time: parseFloat(stats.avg_execution_time) || 0,
        success_rate: stats.total_tasks > 0 
          ? Math.round((parseInt(stats.successful_tasks) / parseInt(stats.total_tasks)) * 100) 
          : 0,
        last_activity: stats.last_activity,
        tasks_last_24h: parseInt(stats.tasks_last_24h),
        tasks_last_7d: parseInt(stats.tasks_last_7d),
        recent_tasks: recentTasksResult.rows
      }
    })

  } catch (error) {
    console.error('Error obteniendo estado del agente:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estado del agente'
    })
  }
})

/**
 * @route   POST /api/agents/:name/execute
 * @desc    Ejecutar tarea en agente específico
 * @access  Private (admin)
 */
router.post('/:name/execute', async (req, res) => {
  try {
    const { name } = req.params
    const { task, context = {}, options = {} } = req.body

    if (!task || !task.type) {
      return res.status(400).json({
        success: false,
        error: 'El tipo de tarea es requerido'
      })
    }

    // Crear registro de tarea
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const taskResult = await query(`
      INSERT INTO tasks (id, agent_type, priority, payload, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `, [
      taskId,
      name,
      options.priority || 0,
      JSON.stringify({
        type: task.type,
        data: task.data || {},
        context,
        options
      })
    ])

    // Asignar a un dispositivo disponible
    const deviceResult = await query(
      'SELECT id FROM devices WHERE status = $1 AND is_banned = false ORDER BY last_heartbeat DESC NULLS LAST LIMIT 1',
      ['online']
    )

    if (deviceResult.rows.length > 0) {
      await query(
        'UPDATE tasks SET device_id = $1, status = $2 WHERE id = $3',
        [deviceResult.rows[0].id, 'assigned', taskId]
      )
    }

    res.status(201).json({
      success: true,
      data: {
        task_id: taskId,
        agent_name: name,
        assigned_device: deviceResult.rows[0]?.id || null,
        status: 'created'
      },
      message: 'Tarea creada para el agente'
    })

  } catch (error) {
    console.error('Error ejecutando tarea del agente:', error)
    res.status(500).json({
      success: false,
      error: 'Error ejecutando tarea del agente'
    })
  }
})

/**
 * @route   POST /api/agents/:name/train
 * @desc    Entrenar agente con feedback
 * @access  Private (admin)
 */
router.post('/:name/train', async (req, res) => {
  try {
    const { name } = req.params
    const { input, expected_output, actual_output, feedback } = req.body

    if (!input || !expected_output || !actual_output) {
      return res.status(400).json({
        success: false,
        error: 'input, expected_output y actual_output son requeridos'
      })
    }

    // En producción, esto se usaría para entrenar el modelo del agente
    // Por ahora, solo registramos el feedback para análisis

    const trainingData = {
      agent_name: name,
      input,
      expected_output,
      actual_output,
      feedback,
      timestamp: new Date().toISOString(),
      improvement_suggestions: generateImprovementSuggestions(expected_output, actual_output)
    }

    // Guardar datos de entrenamiento (podría ser en una tabla específica)
    console.log('Training data for agent:', name, trainingData)

    res.json({
      success: true,
      data: trainingData,
      message: 'Feedback de entrenamiento registrado'
    })

  } catch (error) {
    console.error('Error entrenando agente:', error)
    res.status(500).json({
      success: false,
      error: 'Error entrenando agente'
    })
  }
})

/**
 * @route   GET /api/agents/stats
 * @desc    Obtener estadísticas en tiempo real por categoría
 * @access  Private (admin)
 */
router.get('/stats', async (req, res) => {
  try {
    // 1. Contar agentes por tipo de tarea activa
    const statsResult = await query(`
      SELECT 
        COUNT(CASE WHEN payload->>'action' = 'reader' AND status = 'assigned' THEN 1 END) as reading,
        COUNT(CASE WHEN payload->>'action' = 'extractor' AND status = 'assigned' THEN 1 END) as extracting,
        COUNT(CASE WHEN payload->>'action' = 'phrases' AND status = 'assigned' THEN 1 END) as creating_cards,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as total_active,
        COUNT(*) as total_tasks
      FROM tasks
      WHERE status != 'completed' AND status != 'failed'
    `)

    // 2. Obtener uso de recursos desde dispositivos
    const deviceStats = await query(`
        SELECT 
            AVG(cpu_usage) as avg_cpu,
            AVG(memory_usage) as avg_mem,
            COUNT(CASE WHEN status = 'online' THEN 1 END) as online_count
        FROM devices
    `)

    const stats = statsResult.rows[0]
    const devStats = deviceStats.rows[0]

    res.json({
      success: true,
      data: {
        categories: {
          reading: parseInt(stats.reading) || 0,
          extracting: parseInt(stats.extracting) || 0,
          creating_cards: parseInt(stats.creating_cards) || 0
        },
        usage: {
          cpu: Math.round(parseFloat(devStats.avg_cpu)) || 0,
          memory: Math.round(parseFloat(devStats.avg_mem)) || 0
        },
        overall: {
            active_agents: parseInt(devStats.online_count) || 0,
            running_tasks: parseInt(stats.total_active) || 0
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas categorizadas:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas'
    })
  }
})

/**
 * @route   GET /api/agents/performance
 * @desc    Obtener métricas de rendimiento de todos los agentes
 * @access  Private (admin)
 */
router.get('/performance', async (req, res) => {
  try {
    const { period = '7d' } = req.query

    let sqliteInterval
    switch (period) {
      case '24h':
        sqliteInterval = "'-24 hours'"
        break
      case '7d':
        sqliteInterval = "'-7 days'"
        break
      case '30d':
        sqliteInterval = "'-30 days'"
        break
      default:
        sqliteInterval = "'-7 days'"
    }

    const performanceResult = await query(`
      SELECT 
        agent_name,
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_tasks,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_tasks,
        AVG(execution_time) as avg_execution_time,
        MIN(execution_time) as min_execution_time,
        MAX(execution_time) as max_execution_time,
        ROUND(
          COUNT(CASE WHEN success = true THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 2
        ) as success_rate
      FROM agent_performance
      WHERE created_at >= NOW() + CAST(${sqliteInterval} AS INTERVAL)
      GROUP BY agent_name
      ORDER BY success_rate DESC, total_tasks DESC
    `)

    res.json({
      success: true,
      data: {
        period,
        agents_performance: performanceResult.rows,
        summary: {
          total_agents: performanceResult.rows.length,
          avg_success_rate: performanceResult.rows.reduce((sum, agent) => sum + parseFloat(agent.success_rate), 0) / performanceResult.rows.length || 0,
          total_tasks: performanceResult.rows.reduce((sum, agent) => sum + parseInt(agent.total_tasks), 0)
        }
      }
    })

  } catch (error) {
    console.error('Error obteniendo rendimiento de agentes:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo rendimiento de agentes'
    })
  }
})

/**
 * Funciones auxiliares
 */

function generateImprovementSuggestions(expected, actual) {
  const suggestions = []

  // Comparar longitudes
  if (actual.length < expected.length * 0.8) {
    suggestions.push('Considerar generar respuestas más completas')
  }

  if (actual.length > expected.length * 1.5) {
    suggestions.push('Considerar ser más conciso en las respuestas')
  }

  // Comparar palabras clave (simplificado)
  const expectedWords = expected.toLowerCase().split(' ')
  const actualWords = actual.toLowerCase().split(' ')
  const commonWords = expectedWords.filter(word => actualWords.includes(word))
  
  if (commonWords.length / expectedWords.length < 0.5) {
    suggestions.push('Mejorar el alineamiento con el contenido esperado')
  }

  return suggestions
}

export default router