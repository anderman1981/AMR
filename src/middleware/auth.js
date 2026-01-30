import crypto from 'crypto'

/**
 * Middleware para verificar firmas HMAC de dispositivos
 */
export const verifyHMAC = async (req, res, next) => {
  try {
    // Obtener headers de autenticación
    const signature = req.headers['x-amrois-signature']
    const timestamp = req.headers['x-amrois-timestamp']
    const deviceId = req.headers['x-amrois-device-id']

    // Verificar que existan todos los headers requeridos
    if (!signature || !timestamp || !deviceId) {
      return res.status(401).json({
        success: false,
        error: 'Headers de autenticación requeridos'
      })
    }

    // Verificar que el timestamp no sea muy antiguo (protección contra replay attacks)
    const now = Math.floor(Date.now() / 1000)
    const requestTime = parseInt(timestamp)
    const timeDiff = now - requestTime

    if (timeDiff > 300) { // 5 minutos de tolerancia
      return res.status(401).json({
        success: false,
        error: 'Timestamp expirado',
        details: `Diferencia: ${timeDiff} segundos`
      })
    }

    // Obtener el dispositivo de la base de datos
    // Por ahora, verificamos con un device_token simulado
    // En producción, esto vendría de la base de datos
    const deviceToken = req.deviceToken // Esto se establecería en un middleware previo

    if (!deviceToken) {
      return res.status(401).json({
        success: false,
        error: 'Dispositivo no autorizado'
      })
    }

    // Reconstruir el payload para verificar
    const payload = JSON.stringify(req.body) + timestamp
    
    // Calcular HMAC esperado
    const expectedSignature = crypto
      .createHmac('sha256', deviceToken)
      .update(payload)
      .digest('hex')

    // Verificar la firma
    if (signature !== expectedSignature) {
      // Registrar violación de seguridad
      await logSecurityViolation({
        deviceId,
        violationType: 'INVALID_HMAC_SIGNATURE',
        severity: 8,
        requestData: {
          providedSignature: signature,
          expectedSignature,
          timestamp,
          body: req.body
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })

      return res.status(401).json({
        success: false,
        error: 'Firma inválida'
      })
    }

    // Firma verificada correctamente
    next()

  } catch (error) {
    console.error('Error en verificación HMAC:', error)
    return res.status(500).json({
      success: false,
      error: 'Error en verificación de autenticación'
    })
  }
}

/**
 * Middleware para obtener el dispositivo de la base de datos
 */
export const getDevice = async (req, res, next) => {
  try {
    const deviceId = req.headers['x-amrois-device-id']

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'ID de dispositivo requerido'
      })
    }

    // Obtener dispositivo de la base de datos
    const { query } = await import('../config/database.js')
    const result = await query(
      'SELECT * FROM devices WHERE id = $1 AND is_banned = false',
      [deviceId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado o bloqueado'
      })
    }

    const device = result.rows[0]
    req.device = device
    req.deviceToken = device.device_token

    next()
  } catch (error) {
    console.error('Error obteniendo dispositivo:', error)
    return res.status(500).json({
      success: false,
      error: 'Error al verificar dispositivo'
    })
  }
}

/**
 * Función para registrar violaciones de seguridad
 */
const logSecurityViolation = async (violationData) => {
  try {
    const { query } = await import('../config/database.js')
    
    await query(
      `INSERT INTO security_violations 
       (device_id, violation_type, severity, request_data, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        violationData.deviceId,
        violationData.violationType,
        violationData.severity,
        JSON.stringify(violationData.requestData),
        violationData.ipAddress,
        violationData.userAgent
      ]
    )

    console.warn('Violación de seguridad registrada:', violationData)
  } catch (error) {
    console.error('Error registrando violación de seguridad:', error)
  }
}

/**
 * Middleware para generar firma HMAC
 */
export const generateSignature = (payload, timestamp, secret) => {
  const data = JSON.stringify(payload) + timestamp
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex')
}

/**
 * Middleware para rate limiting por dispositivo
 */
const rateLimitMap = new Map()

export const deviceRateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const deviceId = req.headers['x-amrois-device-id']
    
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        error: 'ID de dispositivo requerido'
      })
    }

    const now = Date.now()
    const windowStart = now - windowMs

    if (!rateLimitMap.has(deviceId)) {
      rateLimitMap.set(deviceId, [])
    }

    const requests = rateLimitMap.get(deviceId)
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        details: `Límite de ${maxRequests} solicitudes por ${windowMs/1000} segundos excedido`
      })
    }

    recentRequests.push(now)
    rateLimitMap.set(deviceId, recentRequests)

    // Limpieza periódica del mapa
    setTimeout(() => {
      const currentRequests = rateLimitMap.get(deviceId) || []
      const validRequests = currentRequests.filter(timestamp => timestamp > windowStart)
      
      if (validRequests.length === 0) {
        rateLimitMap.delete(deviceId)
      } else {
        rateLimitMap.set(deviceId, validRequests)
      }
    }, windowMs)

    next()
  }
}