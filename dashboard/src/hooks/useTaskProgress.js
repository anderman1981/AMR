import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3464'

export function useTaskProgress(taskId) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (!taskId) return

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket')
      socket.emit('subscribe:task', taskId)
    })

    socket.on('task:progress', (data) => {
      if (data.taskId === taskId) {
        setProgress(data.progress)
        setStatus(data.status)
      }
    })

    socket.on('task:complete', (data) => {
      if (data.taskId === taskId) {
        setProgress(100)
        setStatus('completed')
      }
    })

    socket.on('task:error', (data) => {
      if (data.taskId === taskId) {
        setStatus('error')
        setError(data.error)
      }
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket')
    })

    return () => {
      socket.emit('unsubscribe:task', taskId)
      socket.disconnect()
    }
  }, [taskId])
  
  return { progress, status, error }
}
