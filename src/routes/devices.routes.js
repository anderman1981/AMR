import express from 'express'
import { query } from '../config/database.js'
import crypto from 'crypto'

const router = express.Router()

/**
 * @route   POST /api/devices/register
 * @desc    Registrar nuevo dispositivo
 * @access  Public (con deployment token)
 */
router.post('/register', async (req, res) => {
  try {
    const { deployment_token, device_info } = req.body

    // Validar token de deployment
    const tokenResult = await query(
      'SELECT * FROM deployment_tokens WHERE token = $1 AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())',
      [deployment_token]
    )

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Token de deployment inválido o expirado'
      })
    }

    const token = tokenResult.rows[0]

    // Verificar usos del token
    if (token.current_uses >= token.max_uses) {
      return res.status(401).json({
        success: false,
        error: 'Token de deployment agotado'
      })
    }

    // Generar ID único para el dispositivo
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Generar token secreto para el dispositivo
    const deviceToken = generateDeviceToken()

    // Insertar nuevo dispositivo
    await query(
      `INSERT INTO devices (id, name, department, device_token, status)
       VALUES ($1, $2, $3, $4, 'offline')`,
      [
        deviceId,
        device_info?.name || `Dispositivo ${deviceId}`,
        device_info?.department || 'Sin departamento',
        deviceToken
      ]
    )

    // Actualizar uso del token
    await query(
      'UPDATE deployment_tokens SET current_uses = current_uses + 1 WHERE token = $1',
      [deployment_token]
    )

    res.status(201).json({
      success: true,
      data: {
        device_id: deviceId,
        device_token: deviceToken,
        status: 'registered'
      },
      message: 'Dispositivo registrado exitosamente'
    })

  } catch (error) {
    console.error('Error registrando dispositivo:', error)
    res.status(500).json({
      success: false,
      error: 'Error al registrar dispositivo'
    })
  }
})

/**
 * @route   POST /api/devices/:id/heartbeat
 * @desc    Actualizar heartbeat y recibir comandos
 * @access  Private (con HMAC verification)
 */
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const deviceId = req.params.id
    const { status, system_info } = req.body

    // Actualizar último heartbeat y estado
    await query(
      `UPDATE devices 
       SET last_heartbeat = NOW(), 
           status = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [status || 'online', deviceId]
    )

    // Obtener tareas pendientes para este dispositivo
    const tasksResult = await query(
      `SELECT id, agent_type, priority, payload 
       FROM tasks 
       WHERE device_id = $1 AND status = 'pending'
       ORDER BY priority DESC, created_at ASC
       LIMIT 10`,
      [deviceId]
    )

    // Marcar tareas como asignadas
    if (tasksResult.rows.length > 0) {
      const taskIds = tasksResult.rows.map(task => task.id)
      await query(
        `UPDATE tasks 
         SET status = 'assigned', updated_at = NOW()
         WHERE id = ANY($1)`,
        [taskIds]
      )
    }

    res.json({
      success: true,
      data: {
        device_id: deviceId,
        status: 'heartbeat_received',
        pending_tasks: tasksResult.rows,
        commands: {
          emergency_wipe: false, // Esto podría venir de la base de datos
          restart: false,
          update_config: false
        }
      }
    })

  } catch (error) {
    console.error('Error en heartbeat:', error)
    res.status(500).json({
      success: false,
      error: 'Error procesando heartbeat'
    })
  }
})

/**
 * @route   GET /api/devices/:id/tasks
 * @desc    Obtener tareas asignadas al dispositivo
 * @access  Private (con HMAC verification)
 */
router.get('/:id/tasks', async (req, res) => {
  try {
    const deviceId = req.params.id
    const { status = 'assigned', limit = 20 } = req.query

    const tasksResult = await query(
      `SELECT id, agent_type, priority, payload, status, attempts, created_at
       FROM tasks 
       WHERE device_id = $1 AND status = $2
       ORDER BY priority DESC, created_at ASC
       LIMIT $3`,
      [deviceId, status, parseInt(limit)]
    )

    res.json({
      success: true,
      data: {
        device_id: deviceId,
        tasks: tasksResult.rows,
        total: tasksResult.rows.length
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
 * @route   POST /api/devices/:id/report
 * @desc    Reportar resultados de tareas
 * @access  Private (con HMAC verification)
 */
router.post('/:id/report', async (req, res) => {
  try {
    const deviceId = req.params.id
    const { task_id, result, status, error } = req.body

    // Actualizar estado de la tarea
    await query(
      `UPDATE tasks 
       SET status = $1, 
           result = $2, 
           attempts = attempts + 1,
           updated_at = NOW()
       WHERE id = $3 AND device_id = $4`,
      [status || 'completed', JSON.stringify(result), task_id, deviceId]
    )

    // Registrar performance del agente
    if (result && result.execution_time) {
      await query(
        `INSERT INTO agent_performance 
         (agent_name, task_type, execution_time, success, metrics)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          result.agent_name || 'unknown',
          result.task_type || 'unknown',
          result.execution_time,
          status === 'completed',
          JSON.stringify(result.metrics || {})
        ]
      )
    }

    res.json({
      success: true,
      data: {
        task_id,
        device_id: deviceId,
        status: 'reported'
      },
      message: 'Reporte recibido exitosamente'
    })

  } catch (error) {
    console.error('Error reportando tarea:', error)
    res.status(500).json({
      success: false,
      error: 'Error reportando tarea'
    })
  }
})

/**
 * @route   GET /api/devices
 * @desc    Listar todos los dispositivos
 * @access  Private (admin)
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query

    let queryText = 'SELECT * FROM devices'
    const queryParams = []
    const conditions = []

    if (status) {
      conditions.push(`status = $${queryParams.length + 1}`)
      queryParams.push(status)
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ')
    }

    queryText += ` ORDER BY last_heartbeat DESC NULLS LAST LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(parseInt(limit), parseInt(offset))

    const result = await query(queryText, queryParams)

    res.json({
      success: true,
      data: {
        devices: result.rows,
        total: result.rows.length
      }
    })

  } catch (error) {
    console.error('Error listando dispositivos:', error)
    res.status(500).json({
      success: false,
      error: 'Error listando dispositivos'
    })
  }
})

/**
 * @route   GET /api/devices/stats
 * @desc    Obtener estadísticas de dispositivos
 * @access  Private (admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'online' THEN 1 END) as online,
        COUNT(CASE WHEN status = 'offline' THEN 1 END) as offline,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance,
        COUNT(CASE WHEN is_banned = true THEN 1 END) as banned,
        AVG(security_score) as avg_security_score
      FROM devices
    `)

    const stats = statsResult.rows[0]

    res.json({
      success: true,
      data: {
        total_devices: parseInt(stats.total),
        online_devices: parseInt(stats.online),
        offline_devices: parseInt(stats.offline),
        maintenance_devices: parseInt(stats.maintenance),
        banned_devices: parseInt(stats.banned),
        avg_security_score: parseFloat(stats.avg_security_score) || 0
      }
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas'
    })
  }
})

/**
 * Función para generar token de dispositivo
 */
function generateDeviceToken() {
  return crypto.randomBytes(32).toString('hex')
}

export default router