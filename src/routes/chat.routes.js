import express from 'express'
import { query } from '../config/database.js'
import axios from 'axios'
import agentOrchestrator from '../services/AgentOrchestrator.js'

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
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    const response = await axios.post(`${ollamaHost}/api/chat`, {
      model: process.env.OLLAMA_MODEL || 'llama3:latest',
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
      currentChatId = chatResult.rows[0]?.id || chatResult.insertId // Handle Postgres (rows) and SQLite (insertId)
    } else {
        // Update updated_at
        await query('UPDATE global_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [currentChatId])
    }

    // Save User Message
    await query(
        'INSERT INTO global_chat_messages (chat_id, role, content) VALUES ($1, $2, $3)',
        [currentChatId, 'user', message]
    )

    // --- START AMROIS 2.0 PIPELINE ---
    console.log(`🚀 Triggering Multi-Agent Pipeline for: "${message}"`);
    
    // 1. Process via Orchestrator
    const pipelineResult = await agentOrchestrator.processQuery(message, {
      history: history.slice(-4),
      persona: 'Coach',
      framework: 'Feynman'
    });

    if (!pipelineResult.success) {
      throw new Error(pipelineResult.error || 'Pipeline execution failed');
    }

    const coachResponse = pipelineResult.final_answer;
    // --- END AMROIS 2.0 PIPELINE ---

    // Save Assistant Message
    await query(
        'INSERT INTO global_chat_messages (chat_id, role, content) VALUES ($1, $2, $3)',
        [currentChatId, 'assistant', coachResponse]
    )

    res.json({
      role: 'assistant',
      content: coachResponse,
      chatId: currentChatId,
      metadata: pipelineResult.metadata // Send pipeline metadata for debug/UI
    })

  } catch (error) {
    console.error('Global Chat Error:', error)
    res.status(500).json({ error: 'Error processing your request' })
  }
})

/**
 * @route   POST /api/chat/save-response
 * @desc    Save an externally generated response to a chat session (used by n8n)
 */
router.post('/save-response', async (req, res) => {
  try {
    const { chatId, content, role = 'assistant', metadata = {} } = req.body;
    
    if (!chatId || !content) {
      return res.status(400).json({ error: 'chatId and content are required' });
    }
    
    await query(
      'INSERT INTO global_chat_messages (chat_id, role, content) VALUES ($1, $2, $3)',
      [chatId, role, content]
    );
    
    await query('UPDATE global_chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [chatId]);
    
    res.json({ success: true, message: 'Response saved successfully' });
  } catch (error) {
    console.error('Error saving external response:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

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
