import api from './api'

export const getSystemStats = async () => {
  const response = await api.get('/api/stats')
  return response.data
}

export const statsService = {
  getSystemStats
}
