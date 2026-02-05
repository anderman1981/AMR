import express from 'express'
import axios from 'axios'
import systeminformation from 'systeminformation'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 12001 // Port 12001 to avoid conflict
const API_URL = process.env.API_URL || 'http://localhost:5467'
const DEPLOYMENT_TOKEN = 'dev-token' // Should match DB

app.use(express.json())

// Device Identity
let DEVICE_ID = null
let DEVICE_TOKEN = null

// --- AGENT LOGIC ---

// --- HELPER: Call LLM Agent ---
const callAgentAPI = async (prompt, system = "You are a helpful AI assistant.") => {
  try {
    const AGENT_API = 'http://localhost:11434/api/chat'; // Using Ollama directly
    const response = await axios.post(AGENT_API, {
      model: "llama3.2", // Default to a lightweight model
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      stream: false
    });
    return response.data.message.content;
  } catch (error) {
    console.error(`⚠️ Agent API Error: ${error.message}`);
    // Fallback if API is down, to avoid crashing the worker
    return `[System Error] Could not connect to Agent API at 12000. \n${error.message}`;
  }
};

// 1. Reader Agent: Categorizes and creates a summary card
const runReaderAgent = async (task, bookId) => {
  console.log(`📖 Reader Agent executing for Book ID: ${bookId}`)
  
  try {
      const bookRes = await axios.get(`${API_URL}/api/books`)
      const book = bookRes.data.find(b => b.id.toString() === bookId.toString())
      
      if (!book) throw new Error('Book not found')

      // 1. Real Progress Simulation (Fetching content analysis takes time)
      console.log(`🤖 Fetching content for: ${book.name}`)
      const contentRes = await axios.get(`${API_URL}/api/books/${bookId}/content`)
      const bookContent = contentRes.data.content || "No content available."

      await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 30 })
      
      const prompt = `Analyze the following book content from "${book.name}". 
      Book Content (Snippet): ${bookContent.substring(0, 5000)}
      
      1. Provide a COMPREHENSIVE and DETAILED summary (min 300 words). Include the book's core argument, major themes, and conclusion.
      2. Identify the best single category (Business, Psychology, Biography, Tech, Fiction, Other).
      3. List 5-7 key hashtags/tags based on actual content.
      Format: JSON { "summary": "...", "category": "...", "tags": [...] }`;

      console.log(`🤖 Asking LLM to read "${book.name}"...`);
      const detailsStr = await callAgentAPI(prompt, "You are a Librarian Agent. Output purely JSON.");
      
      // Attempt generic JSON parse from LLM
      let details;
      try {
        const jsonMatch = detailsStr.match(/\{[\s\S]*\}/);
        details = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
      } catch (e) {
        details = { summary: detailsStr, category: "General", tags: ["Uncategorized"] };
      }

      await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 60 })

      // Update Book Category in DB
      try {
        await axios.put(`${API_URL}/api/books/${bookId}`, {
          name: book.name,
          category: details.category || 'General'
        })
        console.log(`✅ Updated category to: ${details.category}`)
      } catch (catErr) {
        console.error('Failed to update book category:', catErr.message)
      }

      // Create Card
      const summaryContent = `**Analysis by Reader Agent**\n\n**Title**: ${book.name}\n**Category**: ${details.category.toUpperCase()}\n\n${details.summary}`;
      
      await axios.post(`${API_URL}/api/books/${bookId}/cards`, {
        type: 'summary',
        category_id: 1,
        content: summaryContent,
        tags: details.tags || ['general']
      })

      await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 100 })
      
      return { success: true, message: `Book analyzed: ${details.category}` }
  } catch (err) {
      throw new Error(`Failed to run reader agent: ${err.message}`)
  }
}

// 2. Extractor Agent: Extracts best parts
const runExtractorAgent = async (task, bookId) => {
  console.log(`🧪 Extractor Agent executing for Book ID: ${bookId}`)
  
  try {
    const bookRes = await axios.get(`${API_URL}/api/books`)
    const book = bookRes.data.find(b => b.id.toString() === bookId.toString())
    if (!book) throw new Error('Book not found')
    
    const contentRes = await axios.get(`${API_URL}/api/books/${bookId}/content`)
    const bookContent = contentRes.data.content || "No content available."

    const prompt = `Extract specific, actionable insights from the book "${book.name}".
    Book Content (Snippet): ${bookContent.substring(0, 5000)}
    
    1. Identify the 3-5 clearest "Golden Nuggets" or core ideas.
    2. Create a "Task List" to implement these ideas.
    Format as markdown. Use bullet points for tasks.`;
    
    console.log(`🤖 Asking LLM to extract from "${book.name}"...`);
    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 50 })

    const insights = await callAgentAPI(prompt, "You are a Researcher Agent. Extract high-value, actionable insights and implementation steps.");
    
    await axios.post(`${API_URL}/api/books/${bookId}/cards`, {
      type: 'key_points',
      category_id: 1,
      content: `**Key Extractions**\n\n${insights}`,
      tags: ['extraction', 'highlights']
    })
    
    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 100 })
    return { success: true, message: 'Best parts extracted' }
  } catch (err) {
    throw new Error(`Failed to run extractor agent: ${err.message}`)
  }
}

// 3. Phrases Agent: Generates quotes
const runPhrasesAgent = async (task, bookId) => {
  console.log(`💬 Phrases Agent executing for Book ID: ${bookId}`)
  
  try {
    const bookRes = await axios.get(`${API_URL}/api/books`)
    const book = bookRes.data.find(b => b.id.toString() === bookId.toString())
    if (!book) throw new Error('Book not found')

    const contentRes = await axios.get(`${API_URL}/api/books/${bookId}/content`)
    const bookContent = contentRes.data.content || "No content available."

    const prompt = `Find 10 powerful, memorable quotes from the book "${book.name}".
    Book Content (Snippet): ${bookContent.substring(0, 5000)}
    
    - Output ONLY the 10 quotes.
    - Format each as a blockquote (> Quote - Author).`;
    
    console.log(`🤖 Asking LLM for quotes from "${book.name}"...`);
    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 50 })

    const quotes = await callAgentAPI(prompt, "You are a Curator Agent. Provide exactly 10 shareable quotes.");
    
    await axios.post(`${API_URL}/api/books/${bookId}/cards`, {
      type: 'quotes',
      category_id: 1,
      content: `**Memorable Quotes**\n\n${quotes}`,
      tags: ['quotes', 'wisdom']
    })

    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 100 })
    return { success: true, message: 'Quotes generated' }
  } catch (err) {
    throw new Error(`Failed to run phrases agent: ${err.message}`)
  }
}
// 4. Combined Agent: Runs everything in sequence
const runFullAnalysis = async (task, bookId) => {
  console.log(`🚀 Starting FULL ANALYSIS for Book ID: ${bookId}`)
  try {
    // Stage 1: Reader
    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 5 })
    await runReaderAgent(task, bookId)
    
    // Stage 2: Extractor
    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 35 })
    await runExtractorAgent(task, bookId)
    
    // Stage 3: Phrases
    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 70 })
    await runPhrasesAgent(task, bookId)
    
    await axios.put(`${API_URL}/api/books/${bookId}/progress`, { progress: 100 })
    return { success: true, message: 'Full analysis completed (Summary, Insights, Quotes)' }
  } catch (err) {
    console.error(`❌ Full analysis failed for book ${bookId}:`, err.message)
    throw new Error(`Full analysis failed: ${err.message}`)
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
        } else if (action === 'full_analysis') {
            result = await runFullAnalysis(task, book_id)
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
