import express from 'express'
import { query } from '../config/sqlite.js'
import axios from 'axios'

const router = express.Router()

// System Prompt for the Coach
const COACH_SYSTEM_PROMPT = `
Eres mi analista literario y mentor de aprendizaje experto. Antes de responder, haz las preguntas necesarias para entender mi objetivo con este libro (ej. aprender una habilidad, entretenimiento o investigación).

INSTRUCCIONES:
1.  **Analiza** la pregunta del usuario y busca conexiones con los libros del contexto proporcionado.
2.  **Responde** usando un lenguaje natural, empático y orientado a la acción (Mentor).
3.  **Cita las fuentes**: Siempre menciona qué libro o autor respalda tu consejo si la información viene del contexto.
4.  **Estructura de Respuesta**:
    *   **Ideas Centrales**: Extrae modelos mentales y argumentos clave.
    *   **Análisis Cruzado**: Cruza conceptos de psicología, historia, sociología y lógica.
    *   **Simplicidad (Feynman)**: Explica como si tuviera 12 años (Técnica Feynman) y usa Pensamiento de Primeros Principios.
    *   **Contraste**: Contrasta los puntos de vista del autor con argumentos opuestos cuando sea relevante.
    *   **Acciones Prácticas**: Termina SIEMPRE con una lista de pasos aplicables a la vida diaria.
5.  **Si NO tienes información suficiente**:
    *   No inventes información sobre libros que no tienes.
    *   Sugiere revisar "Títulos Disponibles" relevantes.

TONO:
"Usa un lenguaje natural, analogías claras y resúmenes en bullet points. Pregunta al final si necesito profundizar en algún concepto."
`

// Helper to call LLM (Ollama)
async function callLLM(messages) {
  try {
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3:latest', // Or configurable via env
      messages: messages,
      stream: false
    })
    return response.data.message.content
  } catch (error) {
    console.error('LLM Call Failed:', error.message)
    throw new Error('Failed to generate response from Coach')
  }
}

// POST /api/chat/global
router.post('/global', async (req, res) => {
  try {
    const { message, history = [] } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // 1. Search for relevant context (RAG-lite)
    // Simple text match on book_cards columns
    const searchTerms = message.split(' ').filter(term => term.length > 3).join(' OR ')
    
    // Perform a search in book_cards (summaries, key points, quotes)
    // Note: SQLite full-text search would be better, but simple LIKE/OR works for "lite" version
    const contextQuery = `
      SELECT 
        b.name as book_title, 
        bc.type, 
        bc.content 
      FROM book_cards bc
      JOIN books b ON bc.book_id = b.id
      WHERE 
        bc.content LIKE $1 OR 
        bc.content LIKE $2 OR
        b.name LIKE $3
      ORDER BY RANDOM() 
      LIMIT 10
    `
    // Simple parameterized query (using the full message for broad context finding - simplified)
    // improved logic: search for keywords
    // For MVP, we pass the message as a broad LIKE parameter. 
    // Ideally we'd loop keywords, but let's try a direct broad match first or fallback to random insights if empty
    
    const keywords = message.split(' ').filter(w => w.length > 4)
    let dbContext = []
    
    if (keywords.length > 0) {
        // Construct a dynamic query safely? 
        // Let's stick to a simpler approach: Get ALL Book Cards and filter in memory if DB is small, 
        // OR better: Just get summary/key_points types for ALL processed books to give "General Knowledge"
        // Let's search for just the first 2 keywords to find relevant clips
        
        const keyword1 = `%${keywords[0]}%`
        const keyword2 = keywords.length > 1 ? `%${keywords[1]}%` : keyword1
        
        const results = await query(`
            SELECT b.name as book_title, bc.type, bc.content
            FROM book_cards bc
            JOIN books b ON bc.book_id = b.id
            WHERE bc.content LIKE $1 OR bc.content LIKE $2
            LIMIT 15
        `, [keyword1, keyword2])
        
        dbContext = results.rows
    } else {
        // Broad search / Random useful context
        const results = await query(`
            SELECT b.name as book_title, bc.type, bc.content
            FROM book_cards bc
            JOIN books b ON bc.book_id = b.id
            WHERE bc.type = 'summary' OR bc.type = 'key_points'
            ORDER BY RANDOM()
            LIMIT 5
        `)
        dbContext = results.rows
    }

    // Get list of all available books for recommendations
    const allBooksResult = await query('SELECT name, status FROM books ORDER BY name ASC')
    const availableTitles = allBooksResult.rows.map(b => `- ${b.name} (${b.status === 'processed' ? 'Leído' : 'No leído'})`).join('\n')

    // 2. Construct System Context
    let contextString = "INFORMACIÓN DE LA BIBLIOTECA:\n"
    if (dbContext.length > 0) {
        contextString += dbContext.map(row => `[LIBRO: ${row.book_title} (${row.type} তিনিও]: ${row.content}`).join('\n\n')
    } else {
        contextString += "No se encontraron fragmentos específicos que coincidan exactamente con las palabras clave, pero tienes acceso a la lista de libros."
    }
    
    contextString += `\n\nTÍTULOS DISPONIBLES EN BIBLIOTECA:\n${availableTitles}`

    // 3. Prepare Chat Messages
    // Include limited history to maintain context but stay within context window
    const recentHistory = history.slice(-4) // Last 2 turns
    
    const messages = [
      { role: 'system', content: COACH_SYSTEM_PROMPT + "\n\n" + contextString },
      ...recentHistory,
      { role: 'user', content: message }
    ]

    // 4. Call LLM
    const coachResponse = await callLLM(messages)

    res.json({
      role: 'assistant',
      content: coachResponse,
      context_used: dbContext.length // debugging info
    })

  } catch (error) {
    console.error('Global Chat Error:', error)
    res.status(500).json({ error: 'Error processing your request' })
  }
})

export default router
