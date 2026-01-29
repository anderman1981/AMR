import axios from 'axios'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { createLogger, transports, format } from 'winston'
import { WindowsSystemInfo } from './modules/system-info.js'
import { WindowsTaskExecutor } from './modules/task-executor.js'
import { WindowsSecurityManager } from './modules/security-manager.js'
import { WindowsFileSystemManager } from './modules/file-system-manager.js'

// Configuración
dotenv.config()
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})

class WindowsAgent {
  constructor() {
    this.serverUrl = process.env.AMROIS_SERVER_URL || 'http://localhost:4123'
    this.deviceId = process.env.DEVICE_ID || null
    this.deviceToken = process.env.DEVICE_TOKEN || null
    this.heartbeatInterval = 30000 // 30 segundos
    this.taskCheckInterval = 10000 // 10 segundos
    this.isRunning = false
    
    // Módulos específicos de Windows
    this.systemInfo = new WindowsSystemInfo()
    this.taskExecutor = new WindowsTaskExecutor()
    this.securityManager = new WindowsSecurityManager()
    this.fileSystem = new WindowsFileSystemManager()
  }

  async start() {
    try {
      logger.info('🪟 Iniciando AMROIS Windows Agent...')
      
      // Inicializar módulos
      await this.initializeModules()
      
      // Registrar dispositivo si no existe
      if (!this.deviceId || !this.deviceToken) {
        await this.registerDevice()
      }
      
      // Iniciar ciclos
      this.startHeartbeat()
      this.startTaskProcessor()
      
      this.isRunning = true
      logger.info(`✅ Windows Agent iniciado - Device ID: ${this.deviceId}`)
      
    } catch (error) {
      logger.error('❌ Error iniciando Windows Agent:', error)
      process.exit(1)
    }
  }

  async initializeModules() {
    try {
      await this.systemInfo.initialize()
      await this.taskExecutor.initialize()
      await this.securityManager.initialize()
      await this.fileSystem.initialize()
      logger.info('🔧 Módulos de Windows inicializados correctamente')
    } catch (error) {
      logger.error('❌ Error inicializando módulos:', error)
      throw error
    }
  }

  async registerDevice() {
    try {
      const systemInfo = await this.systemInfo.getFullSystemInfo()
      
      const response = await axios.post(`${this.serverUrl}/api/devices/register`, {
        deployment_token: process.env.DEPLOYMENT_TOKEN,
        device_info: {
          name: `Windows-${systemInfo.computerName}`,
          platform: 'windows',
          version: systemInfo.osVersion,
          architecture: systemInfo.architecture,
          department: process.env.DEPARTMENT || 'Windows Fleet',
          capabilities: this.getCapabilities()
        }
      })

      const { device_id, device_token } = response.data.data
      this.deviceId = device_id
      this.deviceToken = device_token
      
      logger.info(`📱 Dispositivo Windows registrado: ${device_id}`)
    } catch (error) {
      logger.error('❌ Error registrando dispositivo:', error.response?.data || error.message)
      throw error
    }
  }

  getCapabilities() {
    return {
      file_system: true,
      registry_access: true,
      process_management: true,
      task_scheduler: true,
      network_management: true,
      security_management: true,
      windows_api: true,
      powershell: true,
      wmi: true,
      active_directory: true,
      group_policy: true
    }
  }

  startHeartbeat() {
    setInterval(async () => {
      try {
        const systemInfo = await this.systemInfo.getSystemStatus()
        const response = await this.sendRequest('/heartbeat', {
          status: 'online',
          system_info: systemInfo
        })

        if (response.data.data.commands.emergency_wipe) {
          await this.emergencyWipe()
        }

        if (response.data.data.commands.restart) {
          await this.restartAgent()
        }

        if (response.data.data.commands.update_config) {
          await this.updateConfiguration()
        }

      } catch (error) {
        logger.error('❌ Error en heartbeat:', error.message)
      }
    }, this.heartbeatInterval)
  }

  startTaskProcessor() {
    setInterval(async () => {
      if (!this.isRunning) return
      
      try {
        const response = await this.sendRequest('/tasks')
        const tasks = response.data.data.tasks

        for (const task of tasks) {
          this.executeTask(task)
        }
      } catch (error) {
        logger.error('❌ Error obteniendo tareas:', error.message)
      }
    }, this.taskCheckInterval)
  }

  async executeTask(task) {
    const startTime = Date.now()
    let result = null
    let status = 'failed'
    let error = null

    try {
      logger.info(`🔧 Ejecutando tarea: ${task.agent_type} - ${task.id}`)
      
      // Marcar tarea como en progreso
      await this.updateTaskStatus(task.id, 'running')
      
      // Ejecutar tarea según el tipo
      switch (task.agent_type) {
        case 'ContentAgent':
          result = await this.taskExecutor.executeContentTask(task.payload)
          break
        case 'DetectorAgent':
          result = await this.taskExecutor.executeDetectorTask(task.payload)
          break
        case 'LearningAgent':
          result = await this.taskExecutor.executeLearningTask(task.payload)
          break
        case 'ManagerAgent':
          result = await this.taskExecutor.executeManagerTask(task.payload)
          break
        case 'WindowsAgent':
          result = await this.taskExecutor.executeWindowsTask(task.payload)
          break
        default:
          throw new Error(`Tipo de agente no soportado: ${task.agent_type}`)
      }

      status = 'completed'
      logger.info(`✅ Tarea completada: ${task.id}`)

    } catch (err) {
      error = err.message
      status = 'failed'
      logger.error(`❌ Tarea fallida: ${task.id} - ${error}`)
    }

    const executionTime = Date.now() - startTime

    // Reportar resultado
    await this.reportTaskResult(task.id, {
      result,
      status,
      error,
      execution_time: executionTime,
      agent_name: task.agent_type,
      task_type: task.payload?.type || 'unknown',
      metrics: {
        platform: 'windows',
        node_version: process.version,
        memory_usage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    })
  }

  async updateTaskStatus(taskId, status) {
    try {
      await this.sendRequest(`/tasks/${taskId}/status`, { status }, 'PUT')
    } catch (error) {
      logger.error('❌ Error actualizando estado de tarea:', error.message)
    }
  }

  async reportTaskResult(taskId, result) {
    try {
      await this.sendRequest('/report', {
        task_id: taskId,
        ...result
      })
    } catch (error) {
      logger.error('❌ Error reportando resultado:', error.message)
    }
  }

  async sendRequest(endpoint, data = {}, method = 'POST') {
    const url = `${this.serverUrl}/api/devices/${this.deviceId}${endpoint}`
    const timestamp = Math.floor(Date.now() / 1000)
    const payload = JSON.stringify(data) + timestamp

    const signature = crypto
      .createHmac('sha256', this.deviceToken)
      .update(payload)
      .digest('hex')

    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        'X-AMROIS-Signature': signature,
        'X-AMROIS-Timestamp': timestamp,
        'X-AMROIS-Device-ID': this.deviceId
      },
      ...(method === 'POST' && { data })
    }

    const response = await axios(config)
    return response
  }

  async emergencyWipe() {
    logger.warn('🚨 Ejecutando emergency wipe...')
    try {
      await this.securityManager.emergencyWipe()
      await this.fileSystem.cleanSensitiveFiles()
      process.exit(0)
    } catch (error) {
      logger.error('❌ Error en emergency wipe:', error)
      process.exit(1)
    }
  }

  async restartAgent() {
    logger.info('🔄 Reiniciando agente...')
    process.exit(0)
  }

  async updateConfiguration() {
    logger.info('🔄 Actualizando configuración...')
    // Recargar variables de entorno
    dotenv.config()
  }

  async shutdown() {
    logger.info('🛑 Apagando Windows Agent...')
    this.isRunning = false
    
    try {
      await this.sendRequest('/heartbeat', {
        status: 'offline',
        system_info: await this.systemInfo.getSystemStatus()
      })
    } catch (error) {
      logger.error('❌ Error en heartbeat final:', error)
    }
    
    process.exit(0)
  }
}

// Manejo de cierre elegante
process.on('SIGTERM', () => {
  logger.info('SIGTERM received')
  if (agent) agent.shutdown()
})

process.on('SIGINT', () => {
  logger.info('SIGINT received')
  if (agent) agent.shutdown()
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Iniciar agente
const agent = new WindowsAgent()
agent.start().catch(console.error)