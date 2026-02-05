import api from './api'

export const devicesService = {
  /**
   * Obtener lista de dispositivos con paginación y filtros
   * @param {Object} params - { status, limit, offset }
   */
  getDevices: async (params = {}) => {
    const response = await api.get('/api/devices', { params })
    return response.data.data
  },

  /**
   * Obtener estadísticas generales de dispositivos
   */
  getDeviceStats: async () => {
    const response = await api.get('/api/devices/stats')
    return response.data.data
  },

  /**
   * Obtener tareas asignadas a un dispositivo específico
   * @param {string} deviceId
   * @param {Object} params - { status, limit }
   */
  getDeviceTasks: async (deviceId, params = {}) => {
    const response = await api.get(`/api/devices/${deviceId}/tasks`, { params })
    return response.data.data
  }
}
