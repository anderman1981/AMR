import { Server } from 'socket.io'

let io = null

export function setupWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3465', 'http://localhost:3464'],
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id)
    
    socket.on('subscribe:task', (taskId) => {
      socket.join(`task:${taskId}`)
      console.log(`📡 Client ${socket.id} subscribed to task ${taskId}`)
    })

    socket.on('unsubscribe:task', (taskId) => {
      socket.leave(`task:${taskId}`)
      console.log(`📡 Client ${socket.id} unsubscribed from task ${taskId}`)
    })

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id)
    })
  })

  console.log('🔌 WebSocket server initialized')
  return io
}

export function getIO() {
  if (!io) {
    throw new Error('WebSocket not initialized. Call setupWebSocket first.')
  }
  return io
}

export function emitTaskProgress(taskId, progress, status = 'running') {
  if (!io) {
    console.warn('WebSocket not initialized, skipping progress emit')
    return
  }

  const payload = {
    taskId,
    progress: Math.min(100, Math.max(0, progress)),
    status,
    timestamp: Date.now()
  }

  io.to(`task:${taskId}`).emit('task:progress', payload)
  console.log(`📊 Progress emitted for task ${taskId}: ${progress}%`)
}

export function emitTaskComplete(taskId, result) {
  if (!io) return

  const payload = {
    taskId,
    progress: 100,
    status: 'completed',
    result,
    timestamp: Date.now()
  }

  io.to(`task:${taskId}`).emit('task:complete', payload)
  console.log(`✅ Task ${taskId} completed`)
}

export function emitTaskError(taskId, error) {
  if (!io) return

  const payload = {
    taskId,
    status: 'error',
    error: error.message || 'Unknown error',
    timestamp: Date.now()
  }

  io.to(`task:${taskId}`).emit('task:error', payload)
  console.error(`❌ Task ${taskId} failed:`, error)
}
