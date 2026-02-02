import api from './api'

export const getBooks = async () => {
  const response = await api.get('/api/books')
  return response.data
}

export const getBook = async (bookId) => {
  const response = await api.get(`/api/books/${bookId}`)
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

export const deleteBook = async (bookId) => {
  const response = await api.delete(`/api/books/${bookId}`)
  return response.data
}

export const getBookContent = async (bookId) => {
  const response = await api.get(`/api/books/${bookId}/content`)
  return response.data
}

export const getBookCards = async (bookId) => {
  const response = await api.get(`/api/books/${bookId}/cards`)
  return response.data
}

export const createBookTask = async ({ id, type }) => {
  const response = await api.post(`/api/books/${id}/task`, { type })
  return response.data
}

export const chatWithBook = async (bookId, message) => {
  const response = await api.post(`/api/books/${bookId}/chat`, { message })
  return response.data
}

// Forms
export const extractBookForms = async (bookId) => {
  const response = await api.post(`/api/books/${bookId}/extract-forms`)
  return response.data
}

export const getBookForms = async (bookId) => {
  const response = await api.get(`/api/books/${bookId}/forms`)
  return response.data
}

export const saveFormResponses = async (formId, responses) => {
  const response = await api.post(`/api/books/forms/${formId}/responses`, { responses })
  return response.data
}

export const getFormResponses = async (formId) => {
  const response = await api.get(`/api/books/forms/${formId}/responses`)
  return response.data
}

export const deleteForm = async (formId) => {
  const response = await api.delete(`/api/books/forms/${formId}`)
  return response.data
}