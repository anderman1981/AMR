import api from './api'

export const sendGlobalMessage = async (message, history = [], chatId = null) => {
    try {
        const response = await api.post('/api/chat/global', {
            message,
            history,
            chatId
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const getChatSessions = async () => {
    try {
        const response = await api.get('/api/chat/sessions')
        return response.data
    } catch (error) {
        throw error
    }
}

export const getChatMessages = async (chatId) => {
    try {
        const response = await api.get(`/api/chat/sessions/${chatId}/messages`)
        return response.data
    } catch (error) {
        throw error
    }
}
