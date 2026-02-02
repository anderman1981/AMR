
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import systeminformation from 'systeminformation'
import crypto from 'crypto'

dotenv.config()

// --- Express Server (Port 12000) ---
const app = express()
const PORT = process.env.AGENT_PORT || 12000
const API_URL = process.env.VITE_API_URL || 'http://localhost:3467'

app.use(cors())
app.use(express.json())

// Agent State
const agentState = {
  status: 'initializing',
  deviceId: null,
  deviceToken: null,
  deploymentToken: process.env.DEPLOYMENT_TOKEN || 'dev-token',
  lastHeartbeat: null,
  tasksProcessed: 0
}

app.get('/api/health', (req, res) => {
  res.json({
    status: agentState.status === 'active' ? 'ok' : 'initializing',
    service: 'AMROIS Agents API (MacOS/Server)',
    deviceId: agentState.deviceId,
    timestamp: new Date().toISOString()
  })
})

const server = app.listen(PORT, () => {
  console.log(`🤖 AMROIS Agents API & Worker started on port ${PORT}`)
})

// --- Active Agent Client Logic ---

async function registerDevice() {
  try {
    const osInfo = await systeminformation.osInfo()
    const payload = {
      deployment_token: agentState.deploymentToken,
      device_info: {
        name: `MacOS-${osInfo.hostname}`,
        platform: 'macos',
        version: osInfo.release,
        architecture: osInfo.arch,
        department: 'Development'
      }
    }

    console.log('📝 Registering device...')
    const res = await axios.post(`${API_URL}/api/devices/register`, payload)
    
    agentState.deviceId = res.data.data.device_id
    agentState.deviceToken = res.data.data.device_token
    agentState.status = 'active'
    
    console.log(`✅ Registered as: ${agentState.deviceId}`)
    startHeartbeat()
    
  } catch (error) {
    console.error('❌ Registration failed:', error.message)
    if (error.response?.status === 401) {
       console.warn('⚠️ Token invalid. Running in local-only mode.')
       agentState.status = 'local-only'
       agentState.deviceId = 'local-mac-' + Date.now()
       startHeartbeat() // Start anyway for simulation
    } else {
       setTimeout(registerDevice, 5000) // Retry
    }
  }
}

function startHeartbeat() {
  setInterval(async () => {
    if (!agentState.deviceId) return

    try {
      console.log(`💓 Heartbeat for ${agentState.deviceId}`)
      agentState.lastHeartbeat = new Date()
      
      // In a real implementation, we would sign this request with agentState.deviceToken
      // For now, we just log activity. The backend would reject unsigned requests if robust auth is on.
      // We will implement full signature if requested by user.
      
    } catch (error) {
      console.error('Heartbeat error:', error.message)
    }
  }, 10000)
}

// Start Client
setTimeout(registerDevice, 2000) // Wait a bit for server to start

// --- Book Processing Logic ---
const KEYWORDS = {
  'tech': ['javascript', 'python', 'code', 'programming', 'software', 'agile'],
  'business': ['startup', 'lean', 'money', 'finance', 'market', 'strategy'],
  'fiction': ['novel', 'story', 'character', 'plot', 'drama'],
  'science': ['physics', 'biology', 'chemistry', 'math', 'universe']
}

async function processBooks() {
  if (agentState.status !== 'active' && agentState.status !== 'local-only') return
  
  try {
    // 1. Fetch pending books (unprocessed)
    const res = await axios.get(`${API_URL}/api/books`)
    const books = res.data.filter(b => !b.processed && b.status !== 'processing')
    
    if (books.length === 0) return

    console.log(`📚 Found ${books.length} unprocessed books. Starting processing...`)
    
    for (const book of books) {
      console.log(`🧠 Processing book: ${book.name}...`)
      
      // Mimic "Reading" (In real app, we would download book.file_path and extract text)
      await new Promise(r => setTimeout(r, 2000)) // Simulate reading time
      
      // Categorize
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
      
      // Generate "Card" Content (Mock)
      const summary = `Summary of **${book.name}**: This appears to be a ${category} book. It covers key concepts related to ${tags.join(', ')}.`
      
      const payload = {
        category_id: 1, // Default ID
        type: 'summary',
        content: summary,
        tags: tags
      }
      
      try {
        await axios.post(`${API_URL}/api/books/${book.id}/cards`, payload)
        console.log(`✅ Generated card for: ${book.name}`)
      } catch (err) {
        console.error(`❌ Failed to save card for ${book.name}:`, err.message)
      }
    }
    
  } catch (error) {
    console.error('Book processing error:', error.message)
  }
}

// Start Processing Loop
setInterval(processBooks, 30000) // Check every 30s

process.on('SIGTERM', () => {
  server.close()
})
