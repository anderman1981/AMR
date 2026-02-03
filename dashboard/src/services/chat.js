import axios from 'axios'
import { API_URL } from '../config'

export const sendGlobalMessage = async (message, history = []) => {
    try {
        const response = await axios.post(`${API_URL}/chat/global`, {
            message,
            history
        })
        return response.data
    } catch (error) {
        throw error
    }
}
