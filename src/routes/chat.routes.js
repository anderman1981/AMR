import express from 'express'
import { query } from '../config/sqlite.js'
import axios from 'axios'

const router = express.Router()

// System Prompt for the Coach
const COACH_SYSTEM_PROMPT = `
Eres mi analista literario y mentor de aprendizaje experto. Tu conocimiento principal proviene EXCLUSIVAMENTE de la "BIBLIOTECA LOCAL" del usuario.

REGLAS DE ORO (PRIORIDAD ALTA):
1.  **VALIDACIÓN DE RECURSOS**:
    *   Antes de responder, VERIFICA si el libro o tema está en la lista "TÍTULOS DISPONIBLES EN BIBLIOTECA".
    *   Si el usuario pregunta por un libro que **NO** está en la lista: DEBES decir explícitamente: "⚠️ No cuento con el recurso [Nombre del Libro] en tu biblioteca local (Formatos soportados: PDF, EPUB, etc.). Realizaré la búsqueda usando mi conocimiento general."
    *   Si el libro **SÍ** está: Úsalo como fuente primaria y cita el formato (ej. "Según tu PDF de...").

2.  **JERARQUÍA DE RESPUESTA**:
    *   Nivel 1 (Prioritario): Información directa de los "FRAGMENTOS DE CONTEXTO" proporcionados.
    *   Nivel 2 (Secundario): Información general sobre los "TÍTULOS DISPONIBLES" (si no hay fragmentos exactos).
    *   Nivel 3 (Fallback): Conocimiento general SOLO si se activó el aviso de "Recurso no encontrado".

INSTRUCCIONES DE MENTOR:
1.  **Analiza** la pregunta buscando conexiones con tu biblioteca real.
2.  **Responde** con lenguaje natural y orientado a la acción.
3.  **Cita las fuentes**: Menciona el libro exacto de tu biblioteca.
4.  **Estructura**: Ideas Centrales -> Análisis Cruzado -> Acciones Prácticas.

TONO:
"Empático, riguroso con las fuentes locales, pero servicial. Si no lo tienes, avisa honestamente y luego ayuda con lo que sepas."
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
    const { message, history = [], chatId } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // 0. Manage Session (Create or Retrieve)
    let currentChatId = chatId
    if (!currentChatId) {
      const chatTitle = message.length > 50 ? message.substring(0, 50) + '...' : message
      const chatResult = await query(
        'INSERT INTO global_chats (title) VALUES ($1) RETURNING id',
        [chatTitle]
      )
      currentChatId = chatResult.insertId // For SQLite with better-sqlite3 wrapper
    } else {
        // Update updated_at
        await query('UPDATE global_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [currentChatId])
    }

    // Save User Message
    await query(
        'INSERT INTO global_chat_messages (chat_id, role, content) VALUES ($1, $2, $3)',
        [currentChatId, 'user', message]
    )

    // 1. Search for relevant context (RAG-lite)
    const keywords = message.split(' ').filter(w => w.length > 4)
    let dbContext = []
    
    if (keywords.length > 0) {
        const keyword1 = `%${keywords[0]}%`
        const keyword2 = keywords.length > 1 ? `%${keywords[1]}%` : keyword1
        
        const results = await query(`
            SELECT b.name as book_title, gc.type, gc.content
            FROM generated_cards gc
            JOIN books b ON gc.book_id = b.id
            WHERE gc.content LIKE $1 OR gc.content LIKE $2
            LIMIT 15
        `, [keyword1, keyword2])
        
        dbContext = results.rows
    } else {
        // Broad search / Random useful context
        const results = await query(`
            SELECT b.name as book_title, gc.type, gc.content
            FROM generated_cards gc
            JOIN books b ON gc.book_id = b.id
            WHERE gc.type = 'summary' OR gc.type = 'key_points'
            ORDER BY RANDOM()
            LIMIT 5
        `)
        dbContext = results.rows
    }

    // 1.5 Get Enhanced Book List (Include Formats)
    // Fetch name, format, status to inform LLM of exactly what is available
    const allBooksResult = await query('SELECT name, format, status FROM books ORDER BY name ASC')
    const availableTitles = allBooksResult.rows.map(b => {
        const fmt = b.format ? b.format.toUpperCase() : 'N/A'
        const stat = b.status === 'processed' ? '✅ Digitalizado' : '⏳ Pendiente'
        return `- ${b.name} [${fmt}] (${stat})`
    }).join('\n')

    // 2. Construct System Context
    let contextString = "=== INVENTARIO DE BIBLIOTECA ===\n"
    contextString += availableTitles
    contextString += "\n\n=== FRAGMENTOS DE CONTEXTO (RAG) ===\n"
    
    if (dbContext.length > 0) {
        contextString += dbContext.map(row => `[FUENTE: ${row.book_title} | TIPO: ${row.type}]: ${row.content}`).join('\n\n')
    } else {
        contextString += "No se encontraron citas textuales exactas para esta consulta en los libros procesados."
    }

    // 3. Prepare Chat Messages
    const recentHistory = history.slice(-4) // Last 2 turns
    
    const messages = [
      { role: 'system', content: COACH_SYSTEM_PROMPT + "\n\n" + contextString },
      ...recentHistory,
      { role: 'user', content: message }
    ]

    // 4. Call LLM
    const coachResponse = await callLLM(messages)

    // Save Assistant Message
    await query(
        'INSERT INTO global_chat_messages (chat_id, role, content) VALUES ($1, $2, $3)',
        [currentChatId, 'assistant', coachResponse]
    )

    res.json({
      role: 'assistant',
      content: coachResponse,
      chatId: currentChatId,
      context_used: dbContext.length // debugging info
    })

  } catch (error) {
    console.error('Global Chat Error:', error)
    res.status(500).json({ error: 'Error processing your request' })
  }
})

// GET /api/chat/sessions
router.get('/sessions', async (req, res) => {
    try {
        const result = await query('SELECT * FROM global_chats ORDER BY updated_at DESC')
        res.json(result.rows)
    } catch (error) {
        console.error('Error fetching sessions:', error)
        res.status(500).json({ error: 'Failed to fetch chat history' })
    }
})

// GET /api/chat/sessions/:id/messages
router.get('/sessions/:id/messages', async (req, res) => {
    try {
        const { id } = req.params
        const result = await query('SELECT role, content FROM global_chat_messages WHERE chat_id = $1 ORDER BY created_at ASC', [id])
        res.json(result.rows)
    } catch (error) {
        console.error('Error fetching messages:', error)
        res.status(500).json({ error: 'Failed to fetch messages' })
    }
})

export default router
