import express from 'express'
import axios from 'axios'
import systeminformation from 'systeminformation'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 12001 // Port 12001 to avoid conflict
const API_URL = process.env.API_URL || 'http://localhost:3467'
const DEPLOYMENT_TOKEN = 'dev-token' // Should match DB

app.use(express.json())

// Device Identity
let DEVICE_ID = null
let DEVICE_TOKEN = null

// --- AGENT LOGIC ---

// 1. Reader Agent: Categorizes and creates a summary card
const runReaderAgent = async (task, bookId) => {
  console.log(`📖 Reader Agent executing for Book ID: ${bookId}`)
  
  // Fetch book to ensure it exists
  try {
      const bookRes = await axios.get(`${API_URL}/api/books`)
      const book = bookRes.data.find(b => b.id.toString() === bookId.toString())
      
      if (!book) throw new Error('Book not found')

      // Mock Reading with Progress Updates
      console.log('Simulating reading progress...')
      const steps = [10, 30, 50, 70, 90, 100]
      
      for (const progress of steps) {
        await new Promise(r => setTimeout(r, 800)) // fast simulation
        try {
            await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress })
            console.log(`📖 Reader Progress: ${progress}% for Book ${bookId}`)
        } catch (e) {
            console.error('Failed to update progress:', e.message)
        }
      }
      
      const KEYWORDS = {
        business: ['venta', 'negocio', 'marketing', 'dinero', 'rico', 'empresa', 'lider'],
        psychology: ['mente', 'psico', 'cerebro', 'emocion', 'vida', 'amor', 'autoestima'],
        biography: ['historia', 'vida', 'biografia', 'memorias'],
        tech: ['software', 'codigo', 'programacion', 'datos', 'ia', 'inteligencia']
      }

      let category = 'general'
      let tags = []
      const titleLower = book.name.toLowerCase()
      
      for (const [cat, kws] of Object.entries(KEYWORDS)) {
        if (kws.some(kw => titleLower.includes(kw))) {
          category = cat
          tags.push(cat)
          break
        }
      }

      // Create Card
      const summary = `**Analysis by Reader Agent**\n\n**Title**: ${book.name}\n**Category**: ${category.toUpperCase()}\n\nThis book has been scanned. Based on the analysis, it focuses on themes related to ${tags.join(', ') || 'general topics'}.`
      
      await axios.post(`${API_URL}/api/books/${bookId}/cards`, {
        type: 'summary',
        category_id: 1,
        content: summary,
        tags: tags
      })
      
      return { success: true, message: `Book processed and categorized as ${category}` }
  } catch (err) {
      throw new Error(`Failed to run reader agent: ${err.message}`)
  }
}

// 2. Extractor Agent: Extracts best parts
const runExtractorAgent = async (task, bookId) => {
  console.log(`🧪 Extractor Agent executing for Book ID: ${bookId}`)
  await new Promise(r => setTimeout(r, 5000)) // Simulate heavy work
  
  const bestParts = [
    "Chapter 1: The beginning of awareness.",
    "Key Insight: Success is not final, failure is not fatal.",
    "Critical Concept: The loop of habit."
  ]
  
  try {
    await axios.post(`${API_URL}/api/books/${bookId}/cards`, {
      type: 'key_points',
      category_id: 1,
      content: `**Key Extractions**\n\n${bestParts.map(p => `- ${p}`).join('\n')}`,
      tags: ['extraction', 'highlights']
    })
    return { success: true, message: 'Best parts extracted' }
  } catch (err) {
    throw new Error(`Failed to run extractor agent: ${err.message}`)
  }
}

// 3. Phrases Agent: Generates quotes
const runPhrasesAgent = async (task, bookId) => {
  console.log(`💬 Phrases Agent executing for Book ID: ${bookId}`)
  await new Promise(r => setTimeout(r, 2000))
  
  const quotes = [
    "\"The only way to do great work is to love what you do.\"",
    "\"It always seems impossible until it's done.\""
  ]
  
  try {
    await axios.post(`${API_URL}/api/books/${bookId}/cards`, {
      type: 'quotes',
      category_id: 1,
      content: `**Memorable Quotes**\n\n${quotes.join('\n\n')}`,
      tags: ['quotes', 'wisdom']
    })
    return { success: true, message: 'Quotes generated' }
  } catch (err) {
    throw new Error(`Failed to run phrases agent: ${err.message}`)
  }
}

// --- WORKER LOOP ---

const processTask = async (task, headers) => {
    console.log(`⚙️  Processing Task ${task.id}: ${task.agent_type}...`)
    
    let result = { success: false }
    let payload = task.payload || {}
    
    // Parse payload if it's a string (SQLite returns JSON as string)
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload)
        } catch (e) {
            console.error('Failed to parse task payload:', e)
            payload = {}
        }
    }

    const { book_id, action } = payload 

    try {
        if (action === 'reader') {
            result = await runReaderAgent(task, book_id)
        } else if (action === 'extractor') {
            result = await runExtractorAgent(task, book_id)
        } else if (action === 'phrases') {
            result = await runPhrasesAgent(task, book_id)
        } else {
            console.warn('Unknown task action:', action)
            result = { success: false, message: 'Unknown action' }
        }
    } catch (err) {
        console.error('Task execution failed:', err)
        result = { success: false, error: err.message }
    }

    // Report Result
    try {
        await axios.post(`${API_URL}/api/devices/${DEVICE_ID}/report`, {
            task_id: task.id,
            status: result.success ? 'completed' : 'failed',
            result: result,
            error: result.error
        }, { headers })
        console.log(`✅ Reported task ${task.id}`)
    } catch (err) {
        console.error('Failed to report task:', err.message)
    }
}

const startHeartbeat = () => {
    setInterval(async () => {
        if (!DEVICE_ID || !DEVICE_TOKEN) return

        try {
            const timestamp = Date.now().toString()
            const signature = crypto.createHmac('sha256', DEVICE_TOKEN).update(timestamp).digest('hex')
            
            const headers = {
                'x-device-id': DEVICE_ID,
                'x-timestamp': timestamp,
                'x-signature': signature
            }

            // HEARTBEAT to get tasks
            const res = await axios.post(`${API_URL}/api/devices/${DEVICE_ID}/heartbeat`, {
                status: 'online',
                system_info: { cpu: 10, memory: 20 }
            }, { headers })
            
            const tasks = res.data.data.pending_tasks
            if (tasks && tasks.length > 0) {
                console.log(`📦 Received ${tasks.length} tasks`)
                for (const task of tasks) {
                    await processTask(task, headers)
                }
            }
            
        } catch (error) {
            console.error(`Heartbeat error: ${error.message}`)
        }
    }, 5000) // Poll every 5s
}

const registerDevice = async () => {
  try {
    const sys = await systeminformation.osInfo()
    const payload = {
      deployment_token: DEPLOYMENT_TOKEN,
      device_info: {
        name: `AgentWorker_${sys.hostname}`,
        department: 'AI_LAB',
        os: sys.platform
      }
    }
    
    console.log('📝 Registering agent worker...')
    const res = await axios.post(`${API_URL}/api/devices/register`, payload)
    DEVICE_ID = res.data.data.device_id
    DEVICE_TOKEN = res.data.data.device_token
    console.log(`✅ Registered as: ${DEVICE_ID} (Port: ${PORT})`)
    
    startHeartbeat()
  } catch (error) {
    console.error(`❌ Registration failed: ${error.message}. Retrying in 10s...`)
    setTimeout(registerDevice, 10000)
  }
}

// Server for Health check
app.get('/health', (req, res) => res.json({ status: 'ok', device_id: DEVICE_ID }))

const server = app.listen(PORT, () => {
    console.log(`🤖 Book Agent Worker running on port ${PORT}`)
    registerDevice()
})

process.on('SIGTERM', () => server.close())
