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

export const getBooks = async () => {
  const response = await api.get('/api/books')
  return response.data
}

export const getBooksConfig = async () => {
  const response = await api.get('/api/books/config')
  return response.data
}

export const updateBooksPath = async ({ path }) => {
  const response = await api.put('/api/books/config', { path })
  return response.data
}

export const uploadBook = async (file) => {
  const formData = new FormData()
  formData.append('book', file)
  
  const response = await api.post('/api/books/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      console.log(`Upload Progress: ${progress}%`)
    }
  })
  
  return response.data
}

export const scanBooks = async () => {
  const response = await api.post('/api/books/scan')
  return response.data
}

// Crear tarea de agente
export const createTask = async (bookId, type) => {
  const response = await api.post(`/api/books/${bookId}/task`, { type })
  return response.data
}

export const deleteBook = async (bookId) => {
  const response = await api.delete(`/api/books/${bookId}`)
  return response.data
}

export const getBookContent = async (bookId) => {
  const response = await api.get(`/api/books/${bookId}/content`)
  return response.data
}