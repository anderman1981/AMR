import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3467'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const getAgents = async () => {
  const response = await api.get('/api/agents')
  return response.data
}

export const getAgentById = async (agentId) => {
  const response = await api.get(`/api/agents/${agentId}`)
  return response.data
}

export const getAgentTasks = async (agentId) => {
  const response = await api.get(`/api/agents/${agentId}/tasks`)
  return response.data
}

export const getAllTasks = async () => {
  const response = await api.get('/api/tasks')
  return response.data
}

export const getTasksByStatus = async (status) => {
  const response = await api.get(`/api/tasks?status=${status}`)
  return response.data
}

export const restartAgent = async (agentId) => {
  const response = await api.post(`/api/agents/${agentId}/restart`)
  return response.data
}

export const stopAgent = async (agentId) => {
  const response = await api.post(`/api/agents/${agentId}/stop`)
  return response.data
}

export const emergencyStopAll = async () => {
  const response = await api.post('/api/agents/emergency-stop')
  return response.data
}

export const getAgentsStats = async () => {
  const response = await api.get('/api/agents/stats')
  return response.data
}

export const deployAgents = async () => {
  const response = await api.post('/api/agents/deploy')
  return response.data
}

export const updateAgentConfig = async (agentId, config) => {
  const response = await api.put(`/api/agents/${agentId}/config`, config)
  return response.data
}

export const getAgentLogs = async (agentId, limit = 100) => {
  const response = await api.get(`/api/agents/${agentId}/logs?limit=${limit}`)
  return response.data
}