import express from 'express'
import { query } from '../config/database.js'

const router = express.Router()

/**
 * @route   POST /api/llm/generate
 * @desc    Generar texto usando LLM
 * @access  Private
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, provider = 'ollama', model, options = {} } = req.body

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'El prompt es requerido'
      })
    }

    // Obtener configuración del proveedor
    const llmConfig = getLLMConfig(provider)
    
    // Generar texto usando el proveedor especificado
    const result = await generateText(prompt, {
      provider,
      model: model || llmConfig.defaultModel,
      ...options
    })

    // Registrar uso de LLM
    await logLLMUsage({
      provider,
      model: result.model,
      prompt_tokens: result.usage?.prompt_tokens || 0,
      completion_tokens: result.usage?.completion_tokens || 0,
      total_tokens: result.usage?.total_tokens || 0,
      cost: result.cost || 0
    })

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error generando texto:', error)
    res.status(500).json({
      success: false,
      error: 'Error generando texto'
    })
  }
})

/**
 * @route   POST /api/llm/chat
 * @desc    Chat con LLM
 * @access  Private
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, provider = 'ollama', model, options = {} } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de mensajes válido'
      })
    }

    // Construir prompt a partir de mensajes
    const prompt = buildPromptFromMessages(messages)

    // Obtener configuración del proveedor
    const llmConfig = getLLMConfig(provider)

    // Generar respuesta
    const result = await generateText(prompt, {
      provider,
      model: model || llmConfig.defaultModel,
      ...options
    })

    // Registrar uso de LLM
    await logLLMUsage({
      provider,
      model: result.model,
      prompt_tokens: result.usage?.prompt_tokens || 0,
      completion_tokens: result.usage?.completion_tokens || 0,
      total_tokens: result.usage?.total_tokens || 0,
      cost: result.cost || 0
    })

    res.json({
      success: true,
      data: {
        ...result,
        messages: [...messages, { role: 'assistant', content: result.text }]
      }
    })

  } catch (error) {
    console.error('Error en chat:', error)
    res.status(500).json({
      success: false,
      error: 'Error en chat'
    })
  }
})

/**
 * @route   POST /api/llm/embed
 * @desc    Generar embeddings
 * @access  Private
 */
router.post('/embed', async (req, res) => {
  try {
    const { text, provider = 'ollama', model } = req.body

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'El texto es requerido'
      })
    }

    // Obtener configuración del proveedor
    const llmConfig = getLLMConfig(provider)
    const embeddingModel = model || llmConfig.embeddingModel

    // Generar embedding
    const result = await generateEmbedding(text, {
      provider,
      model: embeddingModel
    })

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error generando embedding:', error)
    res.status(500).json({
      success: false,
      error: 'Error generando embedding'
    })
  }
})

/**
 * @route   GET /api/llm/providers
 * @desc    Listar proveedores LLM disponibles
 * @access  Private
 */
router.get('/providers', async (req, res) => {
  try {
    const providers = {
      ollama: {
        name: 'Ollama',
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
        defaultModel: process.env.OLLAMA_MODEL || 'llama3:latest',
        embeddingModel: 'nomic-embed-text:latest',
        available: await checkProviderAvailability('ollama'),
        cost: 0
      },
      openai: {
        name: 'OpenAI',
        host: 'https://api.openai.com',
        defaultModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',
        embeddingModel: 'text-embedding-3-large',
        available: process.env.OPENAI_API_KEY ? await checkProviderAvailability('openai') : false,
        cost: 'variable'
      },
      anthropic: {
        name: 'Anthropic Claude',
        host: 'https://api.anthropic.com',
        defaultModel: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
        embeddingModel: null,
        available: process.env.ANTHROPIC_API_KEY ? await checkProviderAvailability('anthropic') : false,
        cost: 'variable'
      }
    }

    res.json({
      success: true,
      data: providers
    })

  } catch (error) {
    console.error('Error obteniendo proveedores:', error)
    res.status(500).json({
      success: false,
      error: 'Error obteniendo proveedores'
    })
  }
})

/**
 * @route   GET /api/llm/health
 * @desc    Verificar salud de los proveedores LLM
 * @access  Private
 */
router.get('/health', async (req, res) => {
  try {
    const health = {}

    // Verificar Ollama
    try {
      const ollamaResponse = await fetch(`${process.env.OLLAMA_HOST || 'http://localhost:11434'}/api/tags`)
      if (ollamaResponse.ok) {
        const ollamaData = await ollamaResponse.json()
        health.ollama = {
          status: 'healthy',
          models: ollamaData.models || [],
          host: process.env.OLLAMA_HOST || 'http://localhost:11434'
        }
      } else {
        health.ollama = { status: 'unhealthy' }
      }
    } catch (error) {
      health.ollama = { status: 'unhealthy', error: error.message }
    }

    // Verificar OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        })
        if (openaiResponse.ok) {
          health.openai = { status: 'healthy' }
        } else {
          health.openai = { status: 'unhealthy' }
        }
      } catch (error) {
        health.openai = { status: 'unhealthy', error: error.message }
      }
    } else {
      health.openai = { status: 'not_configured' }
    }

    // Verificar Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        })
        if (anthropicResponse.ok) {
          health.anthropic = { status: 'healthy' }
        } else {
          health.anthropic = { status: 'unhealthy' }
        }
      } catch (error) {
        health.anthropic = { status: 'unhealthy', error: error.message }
      }
    } else {
      health.anthropic = { status: 'not_configured' }
    }

    res.json({
      success: true,
      data: health
    })

  } catch (error) {
    console.error('Error verificando salud LLM:', error)
    res.status(500).json({
      success: false,
      error: 'Error verificando salud LLM'
    })
  }
})

/**
 * Funciones auxiliares
 */

function getLLMConfig(provider) {
  const configs = {
    ollama: {
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      defaultModel: process.env.OLLAMA_MODEL || 'llama3:latest',
      embeddingModel: 'nomic-embed-text:latest'
    },
    openai: {
      host: 'https://api.openai.com',
      defaultModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      embeddingModel: 'text-embedding-3-large',
      apiKey: process.env.OPENAI_API_KEY
    },
    anthropic: {
      host: 'https://api.anthropic.com',
      defaultModel: process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  }

  return configs[provider] || configs.ollama
}

async function generateText(prompt, options) {
  const { provider, model, temperature = 0.7, max_tokens = 2000 } = options

  if (provider === 'ollama') {
    return await generateWithOllama(prompt, { model, temperature, max_tokens })
  } else if (provider === 'openai') {
    return await generateWithOpenAI(prompt, { model, temperature, max_tokens })
  } else if (provider === 'anthropic') {
    return await generateWithAnthropic(prompt, { model, temperature, max_tokens })
  } else {
    throw new Error(`Proveedor no soportado: ${provider}`)
  }
}

async function generateWithOllama(prompt, options) {
  const { model, temperature, max_tokens } = options
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434'

  const response = await fetch(`${host}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature,
        num_predict: max_tokens
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Error en Ollama: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    text: data.response,
    model,
    provider: 'ollama',
    usage: {
      prompt_tokens: data.prompt_eval_count || 0,
      completion_tokens: data.eval_count || 0,
      total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
    },
    cost: 0
  }
}

async function generateWithOpenAI(prompt, options) {
  const { model, temperature, max_tokens } = options

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens
    })
  })

  if (!response.ok) {
    throw new Error(`Error en OpenAI: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    text: data.choices[0].message.content,
    model,
    provider: 'openai',
    usage: data.usage,
    cost: calculateOpenAICost(data.usage, model)
  }
}

async function generateWithAnthropic(prompt, options) {
  const { model, temperature, max_tokens } = options

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens,
      temperature,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    throw new Error(`Error en Anthropic: ${response.statusText}`)
  }

  const data = await response.json()

  return {
    text: data.content[0].text,
    model,
    provider: 'anthropic',
    usage: {
      prompt_tokens: data.usage.input_tokens,
      completion_tokens: data.usage.output_tokens,
      total_tokens: data.usage.input_tokens + data.usage.output_tokens
    },
    cost: calculateAnthropicCost(data.usage, model)
  }
}

async function generateEmbedding(text, options) {
  const { provider, model } = options

  if (provider === 'ollama') {
    const host = process.env.OLLAMA_HOST || 'http://localhost:11434'
    
    const response = await fetch(`${host}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text
      })
    })

    if (!response.ok) {
      throw new Error(`Error en Ollama embeddings: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      embedding: data.embedding,
      model,
      provider: 'ollama'
    }
  } else {
    throw new Error(`Embeddings no soportados para proveedor: ${provider}`)
  }
}

function buildPromptFromMessages(messages) {
  return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')
}

async function checkProviderAvailability(provider) {
  try {
    if (provider === 'ollama') {
      const response = await fetch(`${process.env.OLLAMA_HOST || 'http://localhost:11434'}/api/tags`)
      return response.ok
    } else if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) return false
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      })
      return response.ok
    } else if (provider === 'anthropic') {
      if (!process.env.ANTHROPIC_API_KEY) return false
      // Implementar verificación de Anthropic
      return true
    }
  } catch (error) {
    return false
  }
  return false
}

async function logLLMUsage(usageData) {
  try {
    // En producción, esto se guardaría en la base de datos
    console.log('LLM Usage:', usageData)
  } catch (error) {
    console.error('Error registrando uso de LLM:', error)
  }
}

function calculateOpenAICost(usage, model) {
  // Precios aproximados por 1M tokens (actualizar según precios reales)
  const prices = {
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  }

  const price = prices[model] || prices['gpt-3.5-turbo']
  return (usage.prompt_tokens / 1000000) * price.input + (usage.completion_tokens / 1000000) * price.output
}

function calculateAnthropicCost(usage, model) {
  // Precios aproximados por 1M tokens
  const prices = {
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 }
  }

  const price = prices[model] || prices['claude-3-sonnet-20240229']
  return (usage.input_tokens / 1000000) * price.input + (usage.output_tokens / 1000000) * price.output
}

export default router