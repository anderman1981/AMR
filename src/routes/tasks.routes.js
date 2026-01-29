import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

/**
 * @route   GET /api/tasks
 * @desc    Obtener todas las tareas
 * @access  Private (admin)
 */
router.get('/', async (req, res) => {
  try {
    const { status, device_id, limit = 50, offset = 0 } = req.query

    let queryText = `
      SELECT t.*, d.name as device_name 
      FROM tasks t
      LEFT JOIN devices d ON t.device_id = d.id
    `
    const queryParams = []
    const conditions = []

    if (status) {
      conditions.push(`t.status = $${queryParams.length + 1}`)
      queryParams.push(status)
    }

    if (device_id) {
      conditions.push(`t.device_id = $${queryParams.length + 1}`)
      queryParams.push(device_id)
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ')
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await query(queryText, queryParams)

    res.json({
      success: true,
      data: {
        tasks: result.rows,
        total: result.rows.length
      }
    })

  } catch (error) {
    console.error('Error obteniendo tareas:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo tareas'
    })
  }
})

/**
 * @route   POST /api/tasks
 * @desc    Crear nueva tarea
 * @access  Private (admin)
 */
router.post('/', async (req, res) => {
  try {
    const { batch_id, device_id, agent_type, priority = 0, payload } = req.body

    // Validar datos requeridos
    if (!agent_type || !payload) {
      return res.status(400).json({
        success: false,
        error: 'agent_type y payload son requeridos'
      })
    }

    // Generar ID único para la tarea
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Insertar nueva tarea
    const result = await query(
      `INSERT INTO tasks (id, batch_id, device_id, agent_type, priority, payload, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [taskId, batch_id, device_id, agent_type, parseInt(priority), JSON.stringify(payload)]
    )

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Tarea creada exitosamente'
    })

  } catch (error) {
    console.error('Error creando tarea:', error)
    res.status(500).json({
      success: false,
      error: 'Error creando tarea'
    })
  }
})

/**
 * @route   POST /api/tasks/batch
 * @desc    Crear múltiples tareas (batch)
 * @access  Private (admin)
 */
router.post('/batch', async (req, res) => {
  try {
    const { batch_id, tasks, device_distribution = 'round_robin' } = req.body

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de tareas válido'
      })
    }

    // Obtener dispositivos disponibles
    const devicesResult = await query(
      'SELECT id FROM devices WHERE status = $1 AND is_banned = false',
      ['online']
    )

    if (devicesResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay dispositivos disponibles para asignar tareas'
      })
    }

    const availableDevices = devicesResult.rows.map(d => d.id)
    const createdTasks = []

    // Distribuir tareas entre dispositivos
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const deviceId = availableDevices[i % availableDevices.length]
      const taskId = `task_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`

      try {
        const result = await query(
          `INSERT INTO tasks (id, batch_id, device_id, agent_type, priority, payload, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending')
           RETURNING *`,
          [
            taskId,
            batch_id || `batch_${Date.now()}`,
            deviceId,
            task.agent_type,
            task.priority || 0,
            JSON.stringify(task.payload)
          ]
        )

        createdTasks.push(result.rows[0])

      } catch (error) {
        console.error(`Error creando tarea ${i}:`, error)
      }
    }

    res.status(201).json({
      success: true,
      data: {
        batch_id: batch_id || `batch_${Date.now()}`,
        created_tasks: createdTasks,
        total_created: createdTasks.length,
        total_requested: tasks.length,
        devices_used: availableDevices
      },
      message: `Batch creado con ${createdTasks.length} tareas exitosamente`
    })

  } catch (error) {
    console.error('Error creando batch de tareas:', error)
    res.status(500).json({
      success: false,
      error: 'Error creando batch de tareas'
    })
  }
})

/**
 * @route   GET /api/tasks/stats
 * @desc    Obtener estadísticas de tareas
 * @access  Private (admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as assigned,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        AVG(CASE WHEN status = 'completed' THEN 
          EXTRACT(EPOCH FROM (updated_at - created_at)) 
        END) as avg_completion_time_sec
      FROM tasks
    `)

    const agentTypeStatsResult = await query(`
      SELECT 
        agent_type,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        ROUND(
          COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / 
          NULLIF(COUNT(*), 0), 2
        ) as success_rate
      FROM tasks
      GROUP BY agent_type
      ORDER BY total DESC
    `)

    const dailyStatsResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as tasks_created,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as tasks_completed
      FROM tasks
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `)

    const stats = statsResult.rows[0]

    res.json({
      success: true,
      data: {
        overall: {
          total_tasks: parseInt(stats.total),
          pending_tasks: parseInt(stats.pending),
          assigned_tasks: parseInt(stats.assigned),
          running_tasks: parseInt(stats.running),
          completed_tasks: parseInt(stats.completed),
          failed_tasks: parseInt(stats.failed),
          avg_completion_time_sec: parseFloat(stats.avg_completion_time) || 0
        },
        by_agent_type: agentTypeStatsResult.rows,
        daily_stats: dailyStatsResult.rows
      }
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas de tareas:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas'
    })
  }
})

/**
 * @route   GET /api/tasks/:id
 * @desc    Obtener detalles de una tarea específica
 * @access  Private (admin)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await query(`
      SELECT t.*, d.name as device_name 
      FROM tasks t
      LEFT JOIN devices d ON t.device_id = d.id
      WHERE t.id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error obteniendo tarea:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo tarea'
    })
  }
})

/**
 * @route   PUT /api/tasks/:id
 * @desc    Actualizar tarea
 * @access  Private (admin)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, priority, device_id, payload } = req.body

    // Construir consulta dinámicamente
    const updates = []
    const queryParams = []
    let paramIndex = 1

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      queryParams.push(status)
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`)
      queryParams.push(parseInt(priority))
    }

    if (device_id !== undefined) {
      updates.push(`device_id = $${paramIndex++}`)
      queryParams.push(device_id)
    }

    if (payload !== undefined) {
      updates.push(`payload = $${paramIndex++}`)
      queryParams.push(JSON.stringify(payload))
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay campos para actualizar'
      })
    }

    updates.push(`updated_at = NOW()`)

    const result = await query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex++} RETURNING *`,
      [...queryParams, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Tarea actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error actualizando tarea:', error)
    res.status(500).json({
      success: false,
      error: 'Error actualizando tarea'
    })
  }
})

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Eliminar tarea
 * @access  Private (admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tarea no encontrada'
      })
    }

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando tarea:', error)
    res.status(500).json({
      success: false,
      error: 'Error eliminando tarea'
    })
  }
})

export default router