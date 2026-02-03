import api from './api'

export const sendGlobalMessage = async (message, history = []) => {
    try {
        const response = await api.post('/api/chat/global', {
            message,
            history
        })
        return response.data
    } catch (error) {
        throw error
    }
}
