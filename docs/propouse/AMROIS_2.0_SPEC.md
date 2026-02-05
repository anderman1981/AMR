# 📚🧠 AMROIS 2.0 - Sistema Multi-Agente Coach Literario

## Especificación Técnica para Evolución del Sistema Actual

---

## 1. Análisis del Estado Actual

### 1.1 Fortalezas de AMROIS 1.0 ✅

**Stack Técnico Sólido:**
- ✅ Node.js + Express (backend funcional)
- ✅ React + Vite + Ant Design (UI moderna)
- ✅ SQLite (base de datos operativa)
- ✅ Ollama + LLaMA 3 (IA local, sin costos)
- ✅ Sistema de agentes en background (base para extensión)

**Funcionalidades Core:**
- ✅ Gestión multi-formato (PDF, EPUB, MOBI, TXT, DOCX)
- ✅ Extracción de texto automatizada
- ✅ RAG básico implementado
- ✅ Chat por libro y global
- ✅ Análisis con IA (resúmenes, insights, citas)
- ✅ Extracción de formularios interactivos

### 1.2 Áreas de Mejora 🎯

**Limitaciones Actuales:**
- ❌ Respuestas tipo "resumen académico", no conversación
- ❌ Análisis superficial (no aplica frameworks profundos)
- ❌ Sin memoria contextual entre sesiones
- ❌ Sin aprendizaje de preferencias del usuario
- ❌ RAG básico (chunking por caracteres, no semántico)
- ❌ Una sola "voz", no adaptada por autor

**Objetivo AMROIS 2.0:**
Transformar de **"biblioteca con IA"** a **"coach literario personalizado"**

---

## 2. Arquitectura de Evolución (sin romper lo actual)

### 2.1 Principios de Migración

```
✅ MANTENER: Backend Express, SQLite, Ollama, React UI
✅ AGREGAR: n8n (orquestación), TensorFlow.js (ML), Chroma (vector store)
✅ MEJORAR: RAG, prompts, análisis, narrativa
✅ NO ROMPER: Funcionalidades actuales durante transición
```

### 2.2 Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│              AMROIS 2.0 - Frontend (React)                   │
│  Mantiene: Dashboard, Lector, Chat UI existente             │
│  Agrega: Feedback stars, indicador multi-agente             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         API Gateway (Express - ACTUAL)                       │
│  Rutas actuales:                                            │
│  - /api/books (CRUD) ✅ SE MANTIENE                         │
│  - /api/chat/book/:id ✅ SE MEJORA                          │
│  - /api/chat/global ✅ SE MEJORA                            │
│  - /api/analysis ✅ SE MANTIENE                             │
│  Rutas nuevas:                                              │
│  + /api/chat/feedback (para ML)                             │
│  + /api/agents/status (monitoreo)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴──────────────┐
         ▼                          ▼
┌──────────────────┐       ┌──────────────────────┐
│   SQLite DB      │       │   Chroma Vector DB   │
│   (ACTUAL)       │       │   (NUEVO)            │
│  ✅ books        │       │  + Embeddings        │
│  ✅ analysis     │       │  + Chunks semánticos │
│  ✅ messages     │       │  + Metadatos         │
│  + ml_training   │       └──────────────────────┘
│  + gap_memory    │
│  + metrics       │
└──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              n8n - Orquestador (NUEVO)                       │
│                                                              │
│  Workflow: Chat con Coach                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Agent 1  │→ │ Agent 2  │→ │ Agent 3  │→ │ Agent 4  │→  │
│  │Interpret │  │Extractor │  │ Analyzer │  │Synthesis │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                      ↓                       │
│                              ┌──────────────┐               │
│                              │   Agent 5    │               │
│                              │   Narrator   │               │
│                              │   (Coach)    │               │
│                              └──────────────┘               │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│  Ollama (ACTUAL) │    │  TensorFlow.js (NEW) │
│  localhost:11434 │    │  - Intent Classifier │
│  LLaMA 3.1:70b   │    │  - Style Transfer    │
│                  │    │  - Feedback Learning │
└──────────────────┘    └──────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│         GAP Protocol - Memoria de Agentes (NUEVO)             │
│  - Síntesis exitosas (rating 4-5)                            │
│  - Patrones de conversación efectivos                        │
│  - Preferencias de usuario por contexto                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Sistema Multi-Agente Detallado

### 3.1 Agent 1: Interpreter (Clasificador de Intención)

**Integración con código actual:**

```javascript
// backend/routes/chat.js (MODIFICAR - agregar capa intermedia)

const express = require('express');
const router = express.Router();
const db = require('../database');

// NUEVO: Feature flag para activar/desactivar pipeline multi-agente
const USE_MULTI_AGENT = process.env.USE_MULTI_AGENT === 'true';

router.post('/chat/book/:id', async (req, res) => {
  const { message } = req.body;
  const bookId = req.params.id;
  
  try {
    // NUEVO: Si multi-agente está activo, interpretar primero
    if (USE_MULTI_AGENT) {
      const interpretation = await interpretUserIntent(message, bookId, req.session);
      
      // Si no hay claridad suficiente, hacer preguntas
      if (!interpretation.claridad_suficiente) {
        return res.json({
          type: 'clarification',
          questions: interpretation.preguntas_aclaracion,
          interpretation_id: interpretation.id
        });
      }
      
      // Si hay claridad, ejecutar pipeline completo
      const response = await executeMultiAgentPipeline(interpretation, message, bookId);
      return res.json(response);
    }
    
    // ACTUAL: Flujo original (fallback)
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    const context = await buildRAGContext(message, book.extracted_text);
    const ollamaResponse = await callOllama(message, context);
    
    // Guardar mensaje
    await db.run(
      'INSERT INTO messages (book_id, role, content, created_at) VALUES (?, ?, ?, ?)',
      [bookId, 'assistant', ollamaResponse, Date.now()]
    );
    
    res.json({ 
      response: ollamaResponse,
      type: 'direct' 
    });
    
  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({ error: 'Error al procesar mensaje' });
  }
});

// NUEVA FUNCIÓN: Interpretar intención del usuario
async function interpretUserIntent(message, bookId, session) {
  // Llamar a n8n webhook que ejecuta Agent 1
  const response = await fetch('http://localhost:5678/webhook/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      bookId,
      conversationHistory: session.conversationHistory || [],
      userProfile: session.userProfile || {}
    })
  });
  
  return await response.json();
}

// NUEVA FUNCIÓN: Ejecutar pipeline completo
async function executeMultiAgentPipeline(interpretation, message, bookId) {
  // Llamar a n8n workflow master que orquesta todos los agentes
  const response = await fetch('http://localhost:5678/webhook/full-pipeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interpretation,
      originalMessage: message,
      bookId
    })
  });
  
  const result = await response.json();
  
  // Guardar respuesta con metadata para tracking
  await db.run(`
    INSERT INTO messages (
      book_id, 
      role, 
      content, 
      metadata,
      created_at
    ) VALUES (?, ?, ?, ?, ?)
  `, [
    bookId,
    'assistant',
    result.narrative_response,
    JSON.stringify({
      synthesis_id: result.synthesis_id,
      interpretation: interpretation,
      voice_profile: result.voice_profile
    }),
    Date.now()
  ]);
  
  return {
    type: 'narrative',
    response: result.narrative_response,
    synthesis_id: result.synthesis_id,
    next_question: result.next_question
  };
}

module.exports = router;
```

**Prompt para Agent 1 (via n8n + Ollama):**

```javascript
// backend/prompts/interpreter.js

function buildInterpreterPrompt(userMessage, context) {
  return `Eres un experto en análisis de intenciones conversacionales sobre libros.

CONTEXTO DEL USUARIO:
- Libro actual: "${context.bookTitle}" por ${context.bookAuthor}
- Historial: ${context.conversationHistory.length} mensajes previos
${context.conversationHistory.length > 0 ? `- Último tema: ${context.conversationHistory.slice(-1)[0].topic}` : ''}

MENSAJE DEL USUARIO:
"${userMessage}"

ANALIZA Y CLASIFICA:

1. OBJETIVO principal (selecciona UNO):
   - "aprender": Quiere entender conceptos, ideas, teorías del libro
   - "decidir": Necesita ayuda para tomar una decisión usando el conocimiento
   - "crear": Quiere diseñar algo nuevo (plan, sistema, estrategia)
   - "aplicar": Busca pasos concretos para implementar en su vida
   - "investigar": Quiere comparar con otros libros o profundizar más
   - "reflexionar": Busca pensar más profundo sobre un tema filosófico

2. CLARIDAD del mensaje (¿puedes responder bien con esta info?):
   - true: El mensaje es suficientemente específico
   - false: Necesitas hacer 2-4 preguntas cortas de aclaración

3. PROFUNDIDAD esperada por el usuario:
   - "rapida": Quiere respuesta directa (1-2 min de lectura)
   - "practica": Quiere acciones concretas (3-5 min)
   - "profunda": Quiere análisis detallado (5-10 min)
   - "estrategica": Quiere framework completo (10+ min)

4. CONTEXTO detectado:
   - tema_principal: ¿De qué trata específicamente?
   - subtemas: ¿Qué otros temas relacionados implica?
   - nivel_usuario: principiante/intermedio/avanzado (basado en cómo pregunta)

5. Si claridad es FALSE, genera 2-4 PREGUNTAS CORTAS como:
   - "¿Para qué situación específica quieres aplicar esto?"
   - "¿Prefieres enfoque práctico o estratégico?"
   - "¿Hay algún desafío particular que enfrentas con esto?"

RESPONDE SOLO EN JSON (sin markdown, sin comentarios):
{
  "objetivo": "aprender|decidir|crear|aplicar|investigar|reflexionar",
  "claridad_suficiente": true|false,
  "profundidad": "rapida|practica|profunda|estrategica",
  "contexto_detectado": {
    "tema_principal": "...",
    "subtemas": ["...", "..."],
    "nivel_usuario": "principiante|intermedio|avanzado"
  },
  "preguntas_aclaracion": ["...", "..."],
  "confianza": 0.85
}`;
}

module.exports = { buildInterpreterPrompt };
```

**n8n Workflow para Agent 1:**

```json
{
  "name": "AMROIS - Agent 1 Interpreter",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "interpret",
        "responseMode": "responseNode"
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300],
      "id": "webhook-1"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:11434/api/generate",
        "options": {},
        "bodyParametersJson": "={\n  \"model\": \"llama3.1:70b\",\n  \"prompt\": \"{{ $json.interpretPrompt }}\",\n  \"stream\": false,\n  \"format\": \"json\",\n  \"options\": {\n    \"temperature\": 0.3,\n    \"top_p\": 0.9\n  }\n}"
      },
      "name": "Ollama - Interpret",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300],
      "id": "ollama-1"
    },
    {
      "parameters": {
        "functionCode": "// Parsear respuesta de Ollama\nconst ollamaResponse = JSON.parse($input.item.json.response);\n\n// Agregar ID único para tracking\nollamaResponse.id = `interpret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;\n\nreturn { json: ollamaResponse };"
      },
      "name": "Parse Response",
      "type": "n8n-nodes-base.code",
      "position": [680, 300],
      "id": "code-1"
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.claridad_suficiente }}",
              "value2": true
            }
          ]
        }
      },
      "name": "IF - Claridad OK?",
      "type": "n8n-nodes-base.if",
      "position": [900, 300],
      "id": "if-1"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "name": "Respond - Need Clarification",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [900, 480],
      "id": "respond-clarification"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3464/api/agents/log-interpretation",
        "bodyParametersJson": "={{ $json }}"
      },
      "name": "Log to Database",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 300],
      "id": "log-db"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "name": "Respond - Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1340, 300],
      "id": "respond-success"
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{"node": "Ollama - Interpret"}]]
    },
    "Ollama - Interpret": {
      "main": [[{"node": "Parse Response"}]]
    },
    "Parse Response": {
      "main": [[{"node": "IF - Claridad OK?"}]]
    },
    "IF - Claridad OK?": {
      "main": [
        [{"node": "Log to Database"}],
        [{"node": "Respond - Need Clarification"}]
      ]
    },
    "Log to Database": {
      "main": [[{"node": "Respond - Success"}]]
    }
  }
}
```

---

### 3.2 Agent 2: Extractor (Mejorado con Vector Store)

**Migración de RAG actual a Chroma:**

```javascript
// backend/services/vectorStore.js (NUEVO - reemplaza RAG básico)

const { ChromaClient } = require('chromadb');
const ollama = require('../utils/ollama');

class VectorStoreService {
  constructor() {
    this.client = new ChromaClient({ path: 'http://localhost:8000' });
    this.collection = null;
  }
  
  async initialize() {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: 'amrois_books',
        metadata: { 
          'hnsw:space': 'cosine',
          description: 'AMROIS book embeddings with semantic chunking'
        }
      });
      console.log('✅ Vector store initialized');
    } catch (error) {
      console.error('❌ Error initializing vector store:', error);
      throw error;
    }
  }
  
  /**
   * Indexar un libro completo con chunking inteligente
   * MEJORA vs actual: chunks semánticos en vez de por caracteres
   */
  async indexBook(bookId, bookText, metadata) {
    console.log(`📊 Indexando libro: ${metadata.title}`);
    
    // Chunking inteligente (por secciones, no por caracteres fijos)
    const chunks = await this.intelligentChunking(bookText, metadata);
    
    console.log(`  - ${chunks.length} chunks creados`);
    
    // Generar embeddings usando Ollama
    const embeddings = await this.generateEmbeddings(chunks.map(c => c.text));
    
    // Preparar documentos para Chroma
    const ids = chunks.map((_, i) => `${bookId}_chunk_${i}`);
    const documents = chunks.map(c => c.text);
    const metadatas = chunks.map((chunk, i) => ({
      book_id: bookId,
      book_title: metadata.title,
      author: metadata.author,
      chunk_index: i,
      chunk_type: chunk.type,
      page_estimate: chunk.pageEstimate,
      word_count: chunk.wordCount
    }));
    
    // Agregar a Chroma
    await this.collection.add({
      ids,
      embeddings,
      documents,
      metadatas
    });
    
    // Actualizar en SQLite que el libro está indexado
    const db = require('../database');
    await db.run(
      'UPDATE books SET vector_indexed = 1, chunks_count = ? WHERE id = ?',
      [chunks.length, bookId]
    );
    
    console.log(`✅ Libro indexado: ${chunks.length} chunks`);
  }
  
  /**
   * Chunking inteligente - MEJORA CLAVE
   * Detecta capítulos, secciones, cambios de tema
   */
  async intelligentChunking(text, metadata) {
    const chunks = [];
    
    // 1. Detectar capítulos primero
    const chapterRegex = /(?:Chapter|Capítulo|CHAPTER|CAPÍTULO)\s+(\d+|[IVXLCDM]+)[:\.]?\s*(.+?)(?=\n|$)/gi;
    const chapters = text.split(chapterRegex);
    
    let currentPage = 1;
    const wordsPerPage = 250; // Estimación
    
    for (let i = 0; i < chapters.length; i++) {
      const chapterText = chapters[i];
      
      if (!chapterText || chapterText.trim().length < 100) continue;
      
      // Si el capítulo es muy largo (>1500 palabras), sub-dividir
      const words = chapterText.trim().split(/\s+/);
      
      if (words.length > 1500) {
        // Sub-dividir por párrafos manteniendo coherencia semántica
        const paragraphs = chapterText.split(/\n\n+/);
        let currentChunk = '';
        let chunkWordCount = 0;
        
        for (const paragraph of paragraphs) {
          const pWords = paragraph.trim().split(/\s+/).length;
          
          // Si agregar este párrafo excede 800 palabras, guardar chunk actual
          if (chunkWordCount + pWords > 800 && currentChunk.length > 0) {
            chunks.push({
              text: currentChunk.trim(),
              type: this.detectChunkType(currentChunk),
              pageEstimate: currentPage,
              wordCount: chunkWordCount
            });
            
            currentPage += Math.ceil(chunkWordCount / wordsPerPage);
            currentChunk = paragraph;
            chunkWordCount = pWords;
          } else {
            currentChunk += '\n\n' + paragraph;
            chunkWordCount += pWords;
          }
        }
        
        // Agregar último chunk
        if (currentChunk.trim().length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            type: this.detectChunkType(currentChunk),
            pageEstimate: currentPage,
            wordCount: chunkWordCount
          });
          currentPage += Math.ceil(chunkWordCount / wordsPerPage);
        }
      } else {
        // Capítulo completo como chunk
        chunks.push({
          text: chapterText.trim(),
          type: 'chapter',
          pageEstimate: currentPage,
          wordCount: words.length
        });
        currentPage += Math.ceil(words.length / wordsPerPage);
      }
    }
    
    return chunks;
  }
  
  /**
   * Detectar tipo de sección (ayuda a priorizar en búsqueda)
   */
  detectChunkType(text) {
    const lowerText = text.toLowerCase();
    
    if (/exercise|ejercicio|práctica|actividad/i.test(text)) return 'exercise';
    if (/summary|resumen|conclusión|en síntesis/i.test(text)) return 'summary';
    if (/example|ejemplo|caso|historia|anécdota/i.test(text)) return 'example';
    if (/principle|principio|regla|ley|concepto clave/i.test(text)) return 'principle';
    if (/quote|cita|dice|afirma|según/i.test(text)) return 'quote';
    
    return 'content';
  }
  
  /**
   * Generar embeddings usando Ollama
   */
  async generateEmbeddings(texts) {
    const embeddings = [];
    
    // Procesar en batches para no saturar Ollama
    const batchSize = 5;
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const batchEmbeddings = await Promise.all(
        batch.map(async (text) => {
          const response = await fetch('http://localhost:11434/api/embeddings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama3.1:70b',
              prompt: text
            })
          });
          
          const result = await response.json();
          return result.embedding;
        })
      );
      
      embeddings.push(...batchEmbeddings);
      
      // Log progreso
      console.log(`  - Embeddings generados: ${Math.min(i + batchSize, texts.length)}/${texts.length}`);
    }
    
    return embeddings;
  }
  
  /**
   * Búsqueda mejorada con re-ranking semántico
   */
  async searchRelevant(query, bookIds = null, options = {}) {
    const {
      limit = 10,
      minSimilarity = 0.5,
      chunkTypes = null // ['principle', 'example', 'summary']
    } = options;
    
    // Generar embedding de la query
    const queryEmbedding = await this.generateEmbeddings([query]);
    
    // Preparar filtros
    let where = {};
    if (bookIds && bookIds.length > 0) {
      where.book_id = { $in: bookIds };
    }
    if (chunkTypes && chunkTypes.length > 0) {
      where.chunk_type = { $in: chunkTypes };
    }
    
    // Buscar en Chroma
    const results = await this.collection.query({
      queryEmbeddings: queryEmbedding,
      nResults: limit * 2, // Traer más para re-ranking
      where: Object.keys(where).length > 0 ? where : undefined
    });
    
    // Re-ranking: priorizar chunks tipo 'principle' y 'summary'
    const ranked = results.ids[0].map((id, i) => ({
      id,
      text: results.documents[0][i],
      metadata: results.metadatas[0][i],
      similarity: 1 - results.distances[0][i], // Convertir distancia a similitud
      boost: this.getTypeBoost(results.metadatas[0][i].chunk_type)
    }));
    
    // Filtrar por similitud mínima y ordenar por score boosted
    const filtered = ranked
      .filter(r => r.similarity >= minSimilarity)
      .map(r => ({
        ...r,
        score: r.similarity * r.boost
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return filtered;
  }
  
  getTypeBoost(chunkType) {
    const boosts = {
      'principle': 1.3,
      'summary': 1.2,
      'example': 1.1,
      'exercise': 1.0,
      'quote': 0.9,
      'content': 1.0
    };
    return boosts[chunkType] || 1.0;
  }
  
  /**
   * Re-indexar libro existente (útil para migraciones)
   */
  async reindexBook(bookId) {
    const db = require('../database');
    const book = await db.get('SELECT * FROM books WHERE id = ?', [bookId]);
    
    if (!book || !book.extracted_text) {
      throw new Error(`Libro ${bookId} no encontrado o sin texto extraído`);
    }
    
    // Eliminar chunks antiguos
    await this.collection.delete({
      where: { book_id: bookId }
    });
    
    // Re-indexar
    await this.indexBook(bookId, book.extracted_text, {
      title: book.title,
      author: book.author,
      genre: book.genre
    });
  }
}

module.exports = new VectorStoreService();
```

**Script de migración de libros actuales:**

```javascript
// backend/scripts/migrate-to-vector-store.js

const vectorStore = require('../services/vectorStore');
const db = require('../database');

async function migrateAllBooks() {
  console.log('🚀 Iniciando migración de libros a vector store...\n');
  
  // Inicializar Chroma
  await vectorStore.initialize();
  
  // Obtener todos los libros con texto extraído
  const books = await db.all(`
    SELECT id, title, author, genre, extracted_text 
    FROM books 
    WHERE extracted_text IS NOT NULL 
    AND extracted_text != ''
  `);
  
  console.log(`📚 Encontrados ${books.length} libros para migrar\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const book of books) {
    try {
      console.log(`\n📖 Migrando: "${book.title}" (${book.author})`);
      
      await vectorStore.indexBook(book.id, book.extracted_text, {
        title: book.title,
        author: book.author,
        genre: book.genre
      });
      
      success++;
      console.log(`✅ Migrado exitosamente`);
      
    } catch (error) {
      failed++;
      console.error(`❌ Error migrando "${book.title}":`, error.message);
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`  ✅ Exitosos: ${success}`);
  console.log(`  ❌ Fallidos: ${failed}`);
  console.log(`  📈 Total: ${books.length}`);
}

// Ejecutar
migrateAllBooks()
  .then(() => {
    console.log('\n🎉 Migración completada');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
```

**Uso en Agent 2 (Extractor):**

```javascript
// backend/services/agents/extractor.js

const vectorStore = require('../vectorStore');
const ollama = require('../../utils/ollama');

class ExtractorAgent {
  
  async extract(interpretation, message, bookId) {
    console.log(`🔍 Extractor Agent ejecutando...`);
    
    // 1. Buscar chunks relevantes con el nuevo vector store
    const relevantChunks = await vectorStore.searchRelevant(
      message,
      [bookId],
      {
        limit: 15,
        minSimilarity: 0.6,
        // Priorizar principios y resúmenes si el objetivo es "aprender"
        chunkTypes: interpretation.objetivo === 'aprender' 
          ? ['principle', 'summary', 'content']
          : null
      }
    );
    
    console.log(`  - Encontrados ${relevantChunks.length} chunks relevantes`);
    
    // 2. Construir contexto para Ollama
    const context = relevantChunks
      .map((chunk, i) => `
[SECCIÓN ${i+1} - Página ~${chunk.metadata.page_estimate}]
${chunk.text}
      `)
      .join('\n\n---\n\n');
    
    // 3. Llamar a Ollama para extraer conocimiento estructurado
    const extractionPrompt = this.buildExtractionPrompt(
      message,
      context,
      interpretation
    );
    
    const extraction = await ollama.generate({
      model: 'llama3.1:70b',
      prompt: extractionPrompt,
      format: 'json',
      options: {
        temperature: 0.4,
        num_ctx: 8192 // Contexto amplio para chunks largos
      }
    });
    
    const result = JSON.parse(extraction.response);
    
    // 4. Almacenar extracción para trazabilidad
    const db = require('../../database');
    await db.run(`
      INSERT INTO extractions (
        book_id,
        query,
        extraction_data,
        chunks_used,
        created_at
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      bookId,
      message,
      JSON.stringify(result),
      relevantChunks.length,
      Date.now()
    ]);
    
    console.log(`✅ Extracción completada`);
    
    return {
      extraction: result,
      context_chunks: relevantChunks.length,
      avg_similarity: relevantChunks.reduce((acc, c) => acc + c.similarity, 0) / relevantChunks.length
    };
  }
  
  buildExtractionPrompt(userMessage, bookContext, interpretation) {
    return `Eres un experto en extraer conocimiento estructurado de textos.

CONTEXTO DEL LIBRO:
${bookContext}

PREGUNTA DEL USUARIO:
"${userMessage}"

OBJETIVO DEL USUARIO: ${interpretation.objetivo}
PROFUNDIDAD: ${interpretation.profundidad}

EXTRAE del contexto anterior:

1. IDEAS CENTRALES (máximo 5)
   - Solo las ideas más relevantes para la pregunta
   - Con explicación concisa
   - Indica en qué sección aparece

2. PRINCIPIOS PRÁCTICOS (máximo 7)
   - Formato: "Cuando [situación], entonces [acción]"
   - Que sean aplicables y accionables
   - Basados directamente en el texto

3. MODELOS MENTALES
   - Frameworks o estructuras de pensamiento del autor
   - Cómo el autor piensa sobre el tema

4. ARGUMENTOS CLAVE
   - Principales razonamientos del autor
   - Por qué funcionan estas ideas

5. CITAS RELEVANTES (máximo 3)
   - Solo las más poderosas para el tema
   - Literales del texto

RESPONDE EN JSON:
{
  "ideas_centrales": [
    {
      "idea": "...",
      "explicacion": "...",
      "seccion": "Sección 1"
    }
  ],
  "principios_practicos": [
    {
      "cuando": "...",
      "entonces": "...",
      "razon": "..."
    }
  ],
  "modelos_mentales": [
    {
      "nombre": "...",
      "descripcion": "...",
      "cuando_usar": "..."
    }
  ],
  "argumentos_clave": ["...", "..."],
  "citas_relevantes": [
    {
      "texto": "...",
      "contexto": "...",
      "seccion": "Sección X"
    }
  ]
}`;
  }
}

module.exports = new ExtractorAgent();
```

---

### 3.3 Agent 3: Analyzer (Frameworks de Análisis Profundo)

**Implementación de Primeros Principios + Feynman:**

```javascript
// backend/services/agents/analyzer.js

const ollama = require('../../utils/ollama');

class AnalyzerAgent {
  
  async analyze(extraction, interpretation) {
    console.log(`🧠 Analyzer Agent ejecutando...`);
    
    const analyses = await Promise.all([
      this.applyFirstPrinciples(extraction),
      this.applyFeynman(extraction),
      interpretation.fuentes_requeridas?.length > 1 
        ? this.compareMultipleBooks(extraction) 
        : null
    ]);
    
    return {
      primeros_principios: analyses[0],
      explicaciones_feynman: analyses[1],
      comparacion_libros: analyses[2],
      profundidad_score: this.calculateDepthScore(analyses)
    };
  }
  
  /**
   * Reducción a Primeros Principios
   */
  async applyFirstPrinciples(extraction) {
    const prompt = `Eres un filósofo analítico especializado en reducir ideas a sus primeros principios.

IDEAS EXTRAÍDAS:
${JSON.stringify(extraction.ideas_centrales, null, 2)}

PRINCIPIOS EXTRAÍDOS:
${JSON.stringify(extraction.principios_practicos, null, 2)}

ANALIZA usando el método de Primeros Principios:

1. Para cada idea/principio, pregunta:
   - ¿Cuál es la VERDAD FUNDAMENTAL aquí? (lo que no se puede reducir más)
   - ¿Qué SUPUESTOS puedo eliminar sin perder validez?
   - ¿Cuál es la ESENCIA irreductible?

2. Identifica:
   - PRIMEROS PRINCIPIOS (verdades base)
   - IDEAS DERIVADAS (construidas sobre los principios)
   - SUPUESTOS ELIMINABLES (contextuales, no esenciales)

3. Valida:
   - ¿Este principio es universalmente válido o contextual?
   - ¿Qué tan fundamental es? (0-100)

RESPONDE EN JSON:
{
  "primeros_principios": [
    {
      "principio": "La única variable que controlas 100% son tus acciones",
      "ideas_derivadas": ["hábitos", "sistemas", "rutinas"],
      "supuestos_eliminados": ["necesitas motivación", "requiere fuerza de voluntad"],
      "validez_universal": 90,
      "por_que_es_fundamental": "..."
    }
  ],
  "insights_profundos": ["...", "..."]
}`;

    const response = await ollama.generate({
      model: 'llama3.1:70b',
      prompt,
      format: 'json',
      options: { temperature: 0.3 }
    });
    
    return JSON.parse(response.response);
  }
  
  /**
   * Técnica Feynman - Explicar Simple
   */
  async applyFeynman(extraction) {
    const conceptos = [
      ...extraction.ideas_centrales.map(i => i.idea),
      ...extraction.modelos_mentales.map(m => m.nombre)
    ];
    
    const prompt = `Eres Richard Feynman. Tu trabajo es explicar conceptos de forma tan simple que un niño de 12 años lo entienda.

CONCEPTOS A EXPLICAR:
${conceptos.map((c, i) => `${i+1}. ${c}`).join('\n')}

Para cada concepto:

1. EXPLICA como si fuera para un niño de 12 años
   - Sin jerga técnica
   - Con analogías de la vida real
   - Ejemplos concretos

2. IDENTIFICA dónde está la complejidad innecesaria
   - ¿Qué palabras complicadas se pueden reemplazar?
   - ¿Qué partes son esenciales vs decorativas?

3. DETECTA gaps de comprensión
   - Si no puedes explicarlo simple, ¿qué falta entender?
   - ¿Qué pregunta necesitas responder primero?

RESPONDE EN JSON:
{
  "explicaciones_simples": [
    {
      "concepto_original": "...",
      "explicacion_feynman": "...",
      "analogia": "...",
      "ejemplo_cotidiano": "...",
      "complejidad_eliminada": ["término X", "concepto Y"],
      "gaps_detectados": ["falta entender Z"],
      "simplicidad_score": 0-100
    }
  ]
}`;

    const response = await ollama.generate({
      model: 'llama3.1:70b',
      prompt,
      format: 'json',
      options: { temperature: 0.5 }
    });
    
    return JSON.parse(response.response);
  }
  
  /**
   * Comparación Multi-Libro (si aplica)
   */
  async compareMultipleBooks(extractions) {
    // TODO: Implementar cuando se agregue soporte multi-libro
    return null;
  }
  
  calculateDepthScore(analyses) {
    // Score basado en:
    // - Cantidad de primeros principios identificados
    // - Simplicidad de explicaciones Feynman
    // - Profundidad de gaps detectados
    
    const [fp, feynman] = analyses;
    
    const fpScore = Math.min(100, fp.primeros_principios.length * 15);
    const feynmanScore = feynman.explicaciones_simples.reduce(
      (acc, e) => acc + e.simplicidad_score, 0
    ) / feynman.explicaciones_simples.length;
    
    return Math.round((fpScore + feynmanScore) / 2);
  }
}

module.exports = new AnalyzerAgent();
```

---

### 3.4 Agent 4: Synthesizer (Marco Mental + Acciones)

```javascript
// backend/services/agents/synthesizer.js

const ollama = require('../../utils/ollama');
const gapMemory = require('../gapMemory'); // NUEVO

class SynthesizerAgent {
  
  async synthesize(analysis, interpretation, userContext) {
    console.log(`🎯 Synthesizer Agent ejecutando...`);
    
    // 1. Buscar síntesis similares exitosas en memoria GAP
    const similarSuccesses = await gapMemory.retrieveSimilar({
      objetivo: interpretation.objetivo,
      profundidad: interpretation.profundidad,
      tema: interpretation.contexto_detectado.tema_principal
    });
    
    // 2. Generar síntesis usando análisis + memoria
    const synthesis = await this.generateSynthesis(
      analysis,
      interpretation,
      similarSuccesses
    );
    
    // 3. Almacenar en GAP para futuro aprendizaje
    synthesis.id = await gapMemory.storeSynthesis(synthesis, {
      objetivo: interpretation.objetivo,
      tema: interpretation.contexto_detectado.tema_principal
    });
    
    console.log(`✅ Síntesis generada (ID: ${synthesis.id})`);
    
    return synthesis;
  }
  
  async generateSynthesis(analysis, interpretation, similarSuccesses) {
    const prompt = `Eres un maestro en crear frameworks mentales unificados y accionables.

ANÁLISIS PROFUNDO:
${JSON.stringify(analysis, null, 2)}

OBJETIVO DEL USUARIO: ${interpretation.objetivo}
PROFUNDIDAD: ${interpretation.profundidad}
NIVEL: ${interpretation.contexto_detectado.nivel_usuario}

${similarSuccesses.length > 0 ? `
SÍNTESIS EXITOSAS SIMILARES (para inspirarte):
${JSON.stringify(similarSuccesses.slice(0, 2), null, 2)}
` : ''}

CREA UNA SÍNTESIS que incluya:

1. SÍNTESIS UNIFICADA (1 párrafo, 100-150 palabras)
   - Integra todas las ideas en un marco coherente
   - Lenguaje simple y directo
   - Sin jerga técnica

2. PRINCIPIOS PRÁCTICOS (5-7)
   - Formato: "Cuando [situación], entonces [acción] porque [razón]"
   - Accionables inmediatamente
   - Verificables en la realidad

3. MARCO MENTAL (diagrama conceptual)
   - Cómo se relacionan las ideas entre sí
   - En formato mermaid para visualización

4. EXPERIMENTOS DE 72 HORAS (3-5)
   - Acciones pequeñas para implementar en 1-3 días
   - Específicas y concretas
   - Con criterio de éxito claro
   - Formato: título + pasos + tiempo + resultado esperado

5. PREGUNTAS REFLEXIVAS (2-3)
   - Que inviten a pensar más profundo
   - Sin respuestas obvias
   - Relacionadas con aplicación personal

RESPONDE EN JSON:
{
  "sintesis_unificada": "...",
  "principios_practicos": [
    {
      "cuando": "...",
      "entonces": "...",
      "porque": "...",
      "ejemplo": "..."
    }
  ],
  "marco_mental": {
    "diagrama_mermaid": "graph TD; A-->B; B-->C;",
    "explicacion": "..."
  },
  "experimentos_72h": [
    {
      "titulo": "...",
      "descripcion": "...",
      "pasos": ["1. ...", "2. ...", "3. ..."],
      "tiempo_estimado": "30 minutos",
      "criterio_exito": "...",
      "por_que_funciona": "..."
    }
  ],
  "preguntas_reflexivas": [
    "¿Qué pasaría si...?",
    "¿Cómo cambiaría tu vida si...?"
  ]
}`;

    const response = await ollama.generate({
      model: 'llama3.1:70b',
      prompt,
      format: 'json',
      options: { 
        temperature: 0.6,
        num_ctx: 8192
      }
    });
    
    return JSON.parse(response.response);
  }
}

module.exports = new SynthesizerAgent();
```

**GAP Memory Service (NUEVO):**

```javascript
// backend/services/gapMemory.js

const db = require('../database');
const crypto = require('crypto');

class GAPMemoryService {
  
  /**
   * Almacenar síntesis para futuro aprendizaje
   */
  async storeSynthesis(synthesis, context) {
    const id = crypto.randomUUID();
    
    await db.run(`
      INSERT INTO gap_synthesis_memory (
        synthesis_id,
        objetivo,
        tema,
        profundidad,
        sintesis_unificada,
        principios,
        experimentos,
        timestamp,
        user_feedback
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `, [
      id,
      context.objetivo,
      context.tema,
      context.profundidad || 'practica',
      synthesis.sintesis_unificada,
      JSON.stringify(synthesis.principios_practicos),
      JSON.stringify(synthesis.experimentos_72h),
      Date.now()
    ]);
    
    return id;
  }
  
  /**
   * Recuperar síntesis similares exitosas
   */
  async retrieveSimilar(context, limit = 3) {
    // Buscar síntesis con mismo objetivo y buen feedback (4-5 estrellas)
    const similar = await db.all(`
      SELECT 
        synthesis_id,
        sintesis_unificada,
        principios,
        experimentos,
        user_feedback
      FROM gap_synthesis_memory
      WHERE objetivo = ?
      AND user_feedback >= 4
      ORDER BY timestamp DESC
      LIMIT ?
    `, [context.objetivo, limit]);
    
    return similar.map(s => ({
      id: s.synthesis_id,
      sintesis: s.sintesis_unificada,
      principios: JSON.parse(s.principios),
      experimentos: JSON.parse(s.experimentos),
      rating: s.user_feedback
    }));
  }
  
  /**
   * Almacenar feedback del usuario
   */
  async storeFeedback(synthesisId, rating, comment = null) {
    await db.run(`
      UPDATE gap_synthesis_memory
      SET 
        user_feedback = ?,
        feedback_comment = ?,
        feedback_timestamp = ?
      WHERE synthesis_id = ?
    `, [rating, comment, Date.now(), synthesisId]);
    
    // Si rating es alto (4-5), marcar como patrón exitoso
    if (rating >= 4) {
      await this.markAsSuccessPattern(synthesisId);
    }
    
    // Si rating es bajo (1-2), analizar para mejorar
    if (rating <= 2) {
      await this.analyzeFailure(synthesisId, comment);
    }
  }
  
  async markAsSuccessPattern(synthesisId) {
    const synthesis = await db.get(
      'SELECT * FROM gap_synthesis_memory WHERE synthesis_id = ?',
      [synthesisId]
    );
    
    // Extraer patrón exitoso
    await db.run(`
      INSERT OR REPLACE INTO gap_success_patterns (
        pattern_type,
        objetivo,
        tema,
        successful_structure,
        times_used,
        avg_rating,
        last_updated
      ) VALUES (?, ?, ?, ?, 
        COALESCE((SELECT times_used + 1 FROM gap_success_patterns 
                  WHERE objetivo = ? AND tema = ?), 1),
        ?, ?)
    `, [
      'synthesis',
      synthesis.objetivo,
      synthesis.tema,
      JSON.stringify({
        principios_count: JSON.parse(synthesis.principios).length,
        experimentos_count: JSON.parse(synthesis.experimentos).length,
        sintesis_length: synthesis.sintesis_unificada.length
      }),
      synthesis.objetivo,
      synthesis.tema,
      synthesis.user_feedback,
      Date.now()
    ]);
  }
  
  async analyzeFailure(synthesisId, comment) {
    // Almacenar para análisis posterior y reentrenamiento
    await db.run(`
      INSERT INTO ml_training_data (
        interaction_type,
        user_input,
        system_output,
        user_feedback,
        feedback_comment,
        timestamp,
        used_for_training
      ) VALUES (?, ?, ?, ?, ?, ?, 0)
    `, [
      'synthesis_failure',
      synthesisId,
      'synthesis_output',
      'negative',
      comment,
      Date.now()
    ]);
  }
}

module.exports = new GAPMemoryService();
```

---

### 3.5 Agent 5: Narrator (Voz de Autor/Coach)

```javascript
// backend/services/agents/narrator.js

const ollama = require('../../utils/ollama');
const db = require('../../database');

class NarratorAgent {
  
  constructor() {
    // Perfiles de voz por autor
    this.voices = {
      'ryan_holiday': {
        style: 'directo, estoico, usa historias de filósofos antiguos',
        tone: 'mentor experimentado pero accesible',
        signature_phrases: [
          'Déjame contarte algo que aprendí de los estoicos...',
          'La pregunta real aquí es...',
          'Esto me recuerda a...'
        ],
        avoid: ['listas de bullets', 'lenguaje académico', 'abstracciones sin ejemplos'],
        author_name: 'Ryan Holiday'
      },
      'james_clear': {
        style: 'científico pero práctico, enfocado en sistemas y hábitos',
        tone: 'coach pragmático y optimista',
        signature_phrases: [
          'Aquí está lo que la ciencia nos dice...',
          'El problema no es la motivación, es...',
          'Haz esto tan pequeño que...'
        ],
        avoid: ['teoría sin práctica', 'complejidad innecesaria'],
        author_name: 'James Clear'
      },
      'naval_ravikant': {
        style: 'filosófico, paradójico, pensamiento en primeros principios',
        tone: 'sabio moderno, directo y provocador',
        signature_phrases: [
          'La verdadera pregunta es...',
          'Todo se reduce a...',
          'Si tuviera que elegir solo una cosa...'
        ],
        avoid: ['obviedades', 'consejos genéricos', 'motivación superficial'],
        author_name: 'Naval Ravikant'
      },
      'default_mentor': {
        style: 'conversacional, empático, claro',
        tone: 'mentor cercano y confiable',
        signature_phrases: [
          'Déjame explicarte cómo veo esto...',
          'La clave aquí está en...',
          'Piénsalo de esta manera...'
        ],
        avoid: ['jerga técnica', 'distancia académica', 'listas sin narrativa'],
        author_name: 'Coach'
      }
    };
  }
  
  /**
   * Obtener perfil de voz basado en el libro
   */
  async getVoiceProfile(bookId) {
    const book = await db.get('SELECT author FROM books WHERE id = ?', [bookId]);
    
    if (!book) return this.voices['default_mentor'];
    
    // Matching de autores
    const authorLower = book.author.toLowerCase();
    
    if (authorLower.includes('ryan holiday')) return this.voices['ryan_holiday'];
    if (authorLower.includes('james clear')) return this.voices['james_clear'];
    if (authorLower.includes('naval')) return this.voices['naval_ravikant'];
    
    return this.voices['default_mentor'];
  }
  
  /**
   * Generar respuesta narrativa (NO lista, NO bullets)
   */
  async generateNarrative(synthesis, userQuestion, bookId) {
    console.log(`✍️  Narrator Agent ejecutando...`);
    
    const voiceProfile = await this.getVoiceProfile(bookId);
    
    const prompt = `Eres ${voiceProfile.author_name}, hablando directamente con alguien que te admira y busca aprender.

TU ESTILO:
- ${voiceProfile.style}
- Tono: ${voiceProfile.tone}
- Frases características: ${voiceProfile.signature_phrases.join(' / ')}

❌ NUNCA USES:
${voiceProfile.avoid.map(a => `- ${a}`).join('\n')}

CONOCIMIENTO SINTETIZADO:
${JSON.stringify(synthesis, null, 2)}

PREGUNTA DEL USUARIO:
"${userQuestion}"

ESCRIBE UNA RESPUESTA CONVERSACIONAL:

**ESTRUCTURA (sin headers visibles):**

1. APERTURA (1-2 párrafos)
   - Conecta empáticamente con la pregunta
   - Introduce el tema como si estuvieras conversando tomando café
   - Usa tu voz característica desde el inicio

2. DESARROLLO (4-6 párrafos)
   - Entreteje las ideas en narrativa fluida
   - USA metáforas y ejemplos cotidianos
   - Los principios se mencionan DENTRO de párrafos, NO como lista
   - Ejemplos: "Cuando te encuentres en X, la clave está en Y porque Z..."
   - Mantén tono conversacional: "Déjame explicarte...", "Lo que he visto es..."

3. ACCIONES PRÁCTICAS (2 párrafos)
   - Presenta los experimentos de 72h como parte de la conversación
   - NO uses "Experimento 1:", usa narrativa: "Podrías empezar por..."
   - Máximo 3 acciones concretas integradas en párrafos

4. CIERRE (1 párrafo + pregunta)
   - Resume el insight principal en 2-3 frases
   - Termina con UNA pregunta reflexiva que invite a pensar
   - La pregunta final DEBE ser: "¿Qué parte de esto quieres profundizar o aplicar primero?"

**REGLAS ABSOLUTAS:**
❌ CERO bullets (•, -, *, 1., 2., etc.)
❌ CERO listas numeradas
❌ CERO headers markdown (##, ###)
❌ CERO "En resumen...", "Los puntos clave son..."
❌ CERO "Espero que esto te sea útil"
✅ SOLO párrafos fluidos, narrativa natural
✅ HABLA en segunda persona ("tú", "te")
✅ USA ejemplos concretos y metáforas
✅ SUENA como mentor humano, NO como IA

Escribe SOLO la respuesta narrativa (sin meta-comentarios, sin markdown excepto párrafos):
`;

    const response = await ollama.generate({
      model: 'llama3.1:70b',
      prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_ctx: 8192
      }
    });
    
    const narrative = response.response.trim();
    
    // Validación automática (evitar bullets)
    const hasBullets = /[•\-\*]\s|^\d+\./m.test(narrative);
    const hasHeaders = /^#{1,6}\s/m.test(narrative);
    
    if (hasBullets || hasHeaders) {
      console.warn('⚠️  Respuesta contiene bullets/headers, regenerando...');
      // TODO: Regenerar con prompt más estricto
    }
    
    console.log(`✅ Narrativa generada (${narrative.split(' ').length} palabras)`);
    
    return narrative;
  }
}

module.exports = new NarratorAgent();
```

---

## 4. Flujo Completo en n8n

### 4.1 Workflow Master - Pipeline Completo

```json
{
  "name": "AMROIS - Full Pipeline",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "full-pipeline",
        "responseMode": "responseNode"
      },
      "name": "Webhook Start",
      "type": "n8n-nodes-base.webhook",
      "position": [100, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:5678/webhook/interpret"
      },
      "name": "Agent 1 - Interpreter",
      "type": "n8n-nodes-base.httpRequest",
      "position": [320, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3464/api/agents/extract"
      },
      "name": "Agent 2 - Extractor",
      "type": "n8n-nodes-base.httpRequest",
      "position": [540, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3464/api/agents/analyze"
      },
      "name": "Agent 3 - Analyzer",
      "type": "n8n-nodes-base.httpRequest",
      "position": [760, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3464/api/agents/synthesize"
      },
      "name": "Agent 4 - Synthesizer",
      "type": "n8n-nodes-base.httpRequest",
      "position": [980, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3464/api/agents/narrate"
      },
      "name": "Agent 5 - Narrator",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1200, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "name": "Respond Final",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1420, 300]
    }
  ],
  "connections": {
    "Webhook Start": {
      "main": [[{"node": "Agent 1 - Interpreter"}]]
    },
    "Agent 1 - Interpreter": {
      "main": [[{"node": "Agent 2 - Extractor"}]]
    },
    "Agent 2 - Extractor": {
      "main": [[{"node": "Agent 3 - Analyzer"}]]
    },
    "Agent 3 - Analyzer": {
      "main": [[{"node": "Agent 4 - Synthesizer"}]]
    },
    "Agent 4 - Synthesizer": {
      "main": [[{"node": "Agent 5 - Narrator"}]]
    },
    "Agent 5 - Narrator": {
      "main": [[{"node": "Respond Final"}]]
    }
  }
}
```

### 4.2 Endpoints de Agentes en Backend

```javascript
// backend/routes/agents.js (NUEVO)

const express = require('express');
const router = express.Router();

const extractorAgent = require('../services/agents/extractor');
const analyzerAgent = require('../services/agents/analyzer');
const synthesizerAgent = require('../services/agents/synthesizer');
const narratorAgent = require('../services/agents/narrator');

// Agent 2: Extractor
router.post('/extract', async (req, res) => {
  try {
    const { interpretation, message, bookId } = req.body;
    const result = await extractorAgent.extract(interpretation, message, bookId);
    res.json(result);
  } catch (error) {
    console.error('Error en Extractor:', error);
    res.status(500).json({ error: error.message });
  }
});

// Agent 3: Analyzer
router.post('/analyze', async (req, res) => {
  try {
    const { extraction, interpretation } = req.body;
    const result = await analyzerAgent.analyze(extraction.extraction, interpretation);
    res.json(result);
  } catch (error) {
    console.error('Error en Analyzer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Agent 4: Synthesizer
router.post('/synthesize', async (req, res) => {
  try {
    const { analysis, interpretation, userContext } = req.body;
    const result = await synthesizerAgent.synthesize(analysis, interpretation, userContext);
    res.json(result);
  } catch (error) {
    console.error('Error en Synthesizer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Agent 5: Narrator
router.post('/narrate', async (req, res) => {
  try {
    const { synthesis, originalMessage, bookId } = req.body;
    const narrative = await narratorAgent.generateNarrative(
      synthesis,
      originalMessage,
      bookId
    );
    
    res.json({
      narrative_response: narrative,
      synthesis_id: synthesis.id,
      next_question: "¿Qué parte de esto quieres profundizar o aplicar primero?"
    });
  } catch (error) {
    console.error('Error en Narrator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logging de interpretación (para tracking)
router.post('/log-interpretation', async (req, res) => {
  try {
    const db = require('../database');
    await db.run(`
      INSERT INTO interpretations_log (
        interpretation_id,
        objective,
        clarity,
        depth,
        timestamp
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      req.body.id,
      req.body.objetivo,
      req.body.claridad_suficiente ? 1 : 0,
      req.body.profundidad,
      Date.now()
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging interpretation:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Registrar en app.js:**

```javascript
// backend/app.js (MODIFICAR)

const agentsRoutes = require('./routes/agents');

// ... otras rutas ...

app.use('/api/agents', agentsRoutes);
```

---

## 5. Migraciones de Base de Datos

```sql
-- backend/migrations/002_add_agent_tables.sql

-- Tabla de interpretaciones (Agent 1)
CREATE TABLE IF NOT EXISTS interpretations_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interpretation_id TEXT UNIQUE NOT NULL,
  objective TEXT NOT NULL,
  clarity INTEGER NOT NULL, -- 0 o 1
  depth TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);

-- Tabla de extracciones (Agent 2)
CREATE TABLE IF NOT EXISTS extractions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  query TEXT NOT NULL,
  extraction_data TEXT NOT NULL, -- JSON
  chunks_used INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Tabla GAP - Memoria de síntesis (Agent 4)
CREATE TABLE IF NOT EXISTS gap_synthesis_memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  synthesis_id TEXT UNIQUE NOT NULL,
  objetivo TEXT NOT NULL,
  tema TEXT NOT NULL,
  profundidad TEXT,
  sintesis_unificada TEXT NOT NULL,
  principios TEXT NOT NULL, -- JSON
  experimentos TEXT NOT NULL, -- JSON
  timestamp INTEGER NOT NULL,
  user_feedback INTEGER, -- 1-5 stars
  feedback_comment TEXT,
  feedback_timestamp INTEGER
);

-- Tabla GAP - Patrones exitosos
CREATE TABLE IF NOT EXISTS gap_success_patterns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pattern_type TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  tema TEXT,
  successful_structure TEXT NOT NULL, -- JSON
  times_used INTEGER DEFAULT 1,
  avg_rating REAL,
  last_updated INTEGER NOT NULL
);

-- Tabla para ML training data
CREATE TABLE IF NOT EXISTS ml_training_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interaction_type TEXT NOT NULL,
  user_input TEXT NOT NULL,
  system_output TEXT NOT NULL,
  user_feedback TEXT,
  feedback_comment TEXT,
  timestamp INTEGER NOT NULL,
  used_for_training INTEGER DEFAULT 0
);

-- Tabla de métricas de calidad
CREATE TABLE IF NOT EXISTS quality_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  synthesis_id TEXT,
  has_bullets INTEGER,
  ends_with_question INTEGER,
  uses_second_person INTEGER,
  avoids_ai_words INTEGER,
  word_count INTEGER,
  readability_score REAL,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (synthesis_id) REFERENCES gap_synthesis_memory(synthesis_id)
);

-- Agregar columna a books para tracking de vector indexing
ALTER TABLE books ADD COLUMN vector_indexed INTEGER DEFAULT 0;
ALTER TABLE books ADD COLUMN chunks_count INTEGER DEFAULT 0;

-- Índices para performance
CREATE INDEX idx_interpretations_timestamp ON interpretations_log(timestamp);
CREATE INDEX idx_extractions_book ON extractions(book_id);
CREATE INDEX idx_gap_feedback ON gap_synthesis_memory(user_feedback);
CREATE INDEX idx_gap_objetivo ON gap_synthesis_memory(objetivo);
CREATE INDEX idx_ml_training_type ON ml_training_data(interaction_type);
CREATE INDEX idx_quality_synthesis ON quality_metrics(synthesis_id);
```

**Script de ejecución:**

```javascript
// backend/scripts/run-migrations.js

const db = require('../database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log('🔄 Ejecutando migraciones...\n');
  
  for (const file of files) {
    console.log(`  - ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    try {
      await db.exec(sql);
      console.log(`    ✅ Ejecutada`);
    } catch (error) {
      console.error(`    ❌ Error:`, error.message);
    }
  }
  
  console.log('\n🎉 Migraciones completadas');
}

runMigrations().catch(console.error);
```

---

## 6. Frontend - Componentes Nuevos

### 6.1 Feedback Component

```jsx
// frontend/src/components/MessageFeedback.jsx

import React, { useState } from 'react';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { Input, Button, message as antMessage } from 'antd';
import './MessageFeedback.css';

export default function MessageFeedback({ synthesisId, onFeedbackSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (rating === 0) {
      antMessage.warning('Por favor selecciona una calificación');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          synthesis_id: synthesisId,
          rating,
          comment: comment.trim() || null
        })
      });
      
      if (!response.ok) throw new Error('Error al enviar feedback');
      
      setSubmitted(true);
      antMessage.success('¡Gracias por tu feedback!');
      
      if (onFeedbackSubmit) {
        onFeedbackSubmit(rating, comment);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      antMessage.error('Error al enviar feedback');
    } finally {
      setLoading(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="feedback-thanks">
        ✅ Gracias por tu feedback. Esto ayuda a mejorar las respuestas.
      </div>
    );
  }
  
  return (
    <div className="message-feedback">
      <div className="feedback-label">¿Qué tan útil fue esta respuesta?</div>
      
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => setRating(star)}
            className={`star ${star <= rating ? 'filled' : ''}`}
          >
            {star <= rating ? <StarFilled /> : <StarOutlined />}
          </span>
        ))}
      </div>
      
      {rating > 0 && (
        <div className="feedback-input">
          <Input.TextArea
            placeholder={
              rating >= 4 
                ? "Opcional: ¿Qué fue lo más útil?" 
                : "Opcional: ¿Qué podría mejorar?"
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            style={{ marginTop: '8px' }}
          >
            Enviar Feedback
          </Button>
        </div>
      )}
    </div>
  );
}
```

```css
/* frontend/src/components/MessageFeedback.css */

.message-feedback {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.feedback-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.rating-stars {
  display: flex;
  gap: 8px;
}

.rating-stars .star {
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  color: #d9d9d9;
}

.rating-stars .star.filled {
  color: #faad14;
}

.rating-stars .star:hover {
  transform: scale(1.1);
}

.feedback-input {
  margin-top: 12px;
}

.feedback-thanks {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #52c41a;
  font-size: 13px;
}
```

### 6.2 Agent Processing Indicator

```jsx
// frontend/src/components/AgentProcessingIndicator.jsx

import React from 'react';
import { Spin, Steps } from 'antd';
import {
  SearchOutlined,
  ExperimentOutlined,
  BulbOutlined,
  EditOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import './AgentProcessingIndicator.css';

export default function AgentProcessingIndicator({ currentStep = 0 }) {
  const steps = [
    {
      title: 'Interpretando',
      description: 'Analizando tu pregunta',
      icon: <SearchOutlined />
    },
    {
      title: 'Extrayendo',
      description: 'Buscando en el libro',
      icon: <ExperimentOutlined />
    },
    {
      title: 'Analizando',
      description: 'Aplicando frameworks',
      icon: <BulbOutlined />
    },
    {
      title: 'Sintetizando',
      description: 'Creando marco mental',
      icon: <EditOutlined />
    },
    {
      title: 'Respondiendo',
      description: 'Generando respuesta',
      icon: <CheckCircleOutlined />
    }
  ];
  
  return (
    <div className="agent-processing">
      <div className="processing-header">
        <Spin />
        <span className="processing-text">Coach AI procesando...</span>
      </div>
      
      <Steps
        current={currentStep}
        size="small"
        items={steps}
        className="agent-steps"
      />
      
      <div className="processing-info">
        {steps[currentStep].description}
      </div>
    </div>
  );
}
```

```css
/* frontend/src/components/AgentProcessingIndicator.css */

.agent-processing {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.processing-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.processing-text {
  font-size: 16px;
  font-weight: 500;
}

.agent-steps {
  margin: 16px 0;
}

.agent-steps :global(.ant-steps-item-title) {
  color: rgba(255, 255, 255, 0.85) !important;
}

.agent-steps :global(.ant-steps-item-description) {
  color: rgba(255, 255, 255, 0.65) !important;
}

.agent-steps :global(.ant-steps-item-finish .ant-steps-item-icon) {
  background-color: #52c41a !important;
  border-color: #52c41a !important;
}

.processing-info {
  text-align: center;
  font-size: 14px;
  opacity: 0.9;
  margin-top: 12px;
}
```

### 6.3 Integrar en ChatMessage

```jsx
// frontend/src/components/ChatMessage.jsx (MODIFICAR)

import React from 'react';
import MessageFeedback from './MessageFeedback';
import './ChatMessage.css';

export default function ChatMessage({ message, isLast }) {
  // Detectar si es respuesta del agente con synthesis_id
  const showFeedback = 
    message.role === 'assistant' && 
    message.metadata?.synthesis_id && 
    isLast;
  
  return (
    <div className={`chat-message ${message.role}`}>
      <div className="message-content">
        {/* Renderizar con formato de párrafos */}
        {message.content.split('\n\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      
      {message.metadata?.voice_profile && (
        <div className="message-meta">
          <span className="voice-profile">
            🎭 Voz: {message.metadata.voice_profile}
          </span>
        </div>
      )}
      
      {showFeedback && (
        <MessageFeedback
          synthesisId={message.metadata.synthesis_id}
          onFeedbackSubmit={(rating, comment) => {
            console.log('Feedback:', rating, comment);
            // Opcional: actualizar estado local
          }}
        />
      )}
    </div>
  );
}
```

---

## 7. Plan de Implementación Gradual

### Fase 1: Fundación (Semana 1-2)

**Objetivo:** Preparar infraestructura sin romper nada

**Tareas:**
1. ✅ Instalar n8n (Docker)
2. ✅ Instalar Chroma (Docker)
3. ✅ Ejecutar migraciones SQL
4. ✅ Crear servicios base (vectorStore, gapMemory)
5. ✅ Feature flag `USE_MULTI_AGENT=false`

**Validación:**
- Sistema actual funciona normal
- n8n accesible en :5678
- Chroma accesible en :8000
- Tablas nuevas creadas en SQLite

### Fase 2: Vector Store (Semana 3)

**Objetivo:** Migrar RAG a Chroma

**Tareas:**
1. ✅ Implementar `vectorStore.js`
2. ✅ Script de migración de libros
3. ✅ Re-indexar libros existentes
4. ✅ Comparar resultados búsqueda (vieja vs nueva)
5. ✅ Ajustar chunking si es necesario

**Validación:**
- Búsqueda en Chroma retorna resultados relevantes
- Tiempo de indexación aceptable (<5 min por libro)
- Similarity scores >0.7 en queries de prueba

### Fase 3: Agent 1 (Interpreter) - Semana 4

**Objetivo:** Clasificación de intenciones funcional

**Tareas:**
1. ✅ Crear workflow n8n para Agent 1
2. ✅ Implementar endpoint `/api/agents/interpret` (via n8n)
3. ✅ Integrar en `/api/chat/book/:id` con feature flag
4. ✅ Testing manual con 20 preguntas variadas
5. ✅ Ajustar prompts según resultados

**Validación:**
- Precisión >80% en clasificación de objetivo
- Detecta correctamente cuando falta claridad
- Preguntas de aclaración son relevantes

### Fase 4: Agents 2-3-4 (Extract-Analyze-Synthesize) - Semana 5-6

**Objetivo:** Pipeline de análisis completo

**Tareas:**
1. ✅ Implementar Agent 2 (Extractor)
2. ✅ Implementar Agent 3 (Analyzer)
3. ✅ Implementar Agent 4 (Synthesizer)
4. ✅ Implementar GAP Memory
5. ✅ Workflow n8n completo (5 agentes)
6. ✅ Testing end-to-end

**Validación:**
- Pipeline ejecuta en <30 segundos
- Síntesis tiene estructura correcta
- GAP almacena correctamente

### Fase 5: Agent 5 (Narrator) - Semana 7

**Objetivo:** Voz humana y personalización

**Tareas:**
1. ✅ Implementar Agent 5 (Narrator)
2. ✅ Configurar voces por autor
3. ✅ Validar que NO usa bullets
4. ✅ Testing de calidad narrativa
5. ✅ Ajustar prompts de voz

**Validación:**
- 0% de respuestas con bullets
- Calidad narrativa >80/100
- Usuarios reportan "suena natural"

### Fase 6: Feedback & Learning - Semana 8

**Objetivo:** Sistema de mejora continua

**Tareas:**
1. ✅ Frontend: componente de feedback
2. ✅ Backend: endpoint de feedback
3. ✅ Almacenamiento en GAP
4. ✅ Dashboard de métricas básico
5. ✅ Documentación

**Validación:**
- Feedback funciona end-to-end
- GAP aprende de ratings altos
- Métricas visibles en dashboard

### Fase 7: Activación & Monitoreo - Semana 9

**Objetivo:** Ir a producción con multi-agente

**Tareas:**
1. ✅ `USE_MULTI_AGENT=true` en producción
2. ✅ Monitoreo de tiempos de respuesta
3. ✅ Análisis de primeros 100 usos
4. ✅ Ajustes basados en feedback real
5. ✅ Documentación de uso

---

## 8. Comandos Útiles

### Instalación de Dependencias

```bash
# Backend
cd backend
npm install chromadb @tensorflow/tfjs-node

# n8n (Docker)
docker run -d --restart=always \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Chroma (Docker)
docker run -d --restart=always \
  --name chromadb \
  -p 8000:8000 \
  -v ./chroma_data:/chroma/chroma \
  chromadb/chroma:latest
```

### Scripts de Desarrollo

```bash
# Ejecutar migraciones
node backend/scripts/run-migrations.js

# Re-indexar todos los libros
node backend/scripts/migrate-to-vector-store.js

# Re-indexar un libro específico
node backend/scripts/reindex-book.js --bookId=abc123

# Testear Agent 1
curl -X POST http://localhost:5678/webhook/interpret \
  -H "Content-Type: application/json" \
  -d '{"message": "Quiero aprender sobre hábitos", "bookId": "123"}'

# Testear pipeline completo
curl -X POST http://localhost:5678/webhook/full-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "interpretation": {...},
    "originalMessage": "...",
    "bookId": "123"
  }'
```

### Monitoreo

```bash
# Ver logs de n8n
docker logs -f n8n

# Ver logs de Chroma
docker logs -f chromadb

# Ver logs del backend
tail -f backend/logs/app.log

# Verificar Ollama
curl http://localhost:11434/api/tags
```

---

## 9. Troubleshooting

### Problema: n8n workflows no ejecutan

**Síntomas:** Timeout, "Workflow not found"

**Solución:**
```bash
# Reiniciar n8n
docker restart n8n

# Verificar logs
docker logs n8n

# Importar workflows manualmente desde UI
# → n8n:5678 → Import Workflow → pegar JSON
```

### Problema: Chroma no indexa correctamente

**Síntomas:** Búsquedas vacías, errores de embedding

**Solución:**
```bash
# Verificar que Chroma esté corriendo
curl http://localhost:8000/api/v1/heartbeat

# Limpiar y re-crear colección
# Ver backend/scripts/reset-chroma.js

# Verificar embeddings de Ollama
curl -X POST http://localhost:11434/api/embeddings \
  -d '{"model": "llama3.1:70b", "prompt": "test"}'
```

### Problema: Respuestas lentas (>30 seg)

**Síntomas:** Pipeline tarda mucho

**Diagnóstico:**
```javascript
// Agregar logging de tiempos en cada agente
console.time('Agent 2 - Extractor');
// ... código ...
console.timeEnd('Agent 2 - Extractor');
```

**Optimizaciones:**
- Reducir `num_ctx` en Ollama (de 8192 a 4096)
- Usar modelo más pequeño para Analyzer (`llama3.1:8b`)
- Limitar chunks en Extractor (de 15 a 10)
- Cachear embeddings frecuentes

---

## 10. Próximos Pasos Post-Implementación

### Versión 2.1 (3 meses)
- [ ] Multi-libro: analizar 2-3 libros simultáneamente
- [ ] Más voces: agregar 10+ autores (Naval, Taleb, etc.)
- [ ] Export a PDF/Notion de síntesis
- [ ] Planes 30/60/90 días automáticos

### Versión 2.2 (6 meses)
- [ ] TensorFlow fine-tuning de voces
- [ ] Modo "debate" (2 autores dialogan)
- [ ] Análisis de PDFs técnicos (papers, docs)
- [ ] API pública para integraciones

### Versión 3.0 (12 meses)
- [ ] Multi-idioma (inglés, portugués)
- [ ] Análisis de videos/podcasts
- [ ] Mobile apps nativas
- [ ] Marketplace de "coaches" especializados

---

## 11. Resumen Ejecutivo

**¿Qué cambia con AMROIS 2.0?**

| Antes (1.0) | Después (2.0) |
|------------|--------------|
| Respuesta tipo resumen | Conversación tipo mentor |
| RAG básico (chunks fijos) | Vector store semántico |
| Un solo flujo de análisis | 5 agentes especializados |
| Sin memoria | GAP aprende de feedback |
| Voz genérica | Voz por autor |
| Sin aprendizaje | Mejora continua con TF |

**¿Qué NO cambia?**
- ✅ Stack base (Node + React + SQLite + Ollama)
- ✅ Funcionalidades actuales (CRUD libros, visualizador)
- ✅ Costo $0 en IA (sigue siendo local)

**¿Cuándo estará listo?**
- MVP multi-agente: 4 semanas
- Con feedback y aprendizaje: 8 semanas
- Producción completa: 9 semanas

---

## 12. Checklist Pre-Deploy

```
BACKEND:
[ ] Migraciones ejecutadas
[ ] Vector store con >5 libros indexados
[ ] n8n workflows importados y testeados
[ ] Ollama con modelo correcto (llama3.1:70b)
[ ] Feature flags configurados (.env)
[ ] Logs funcionando

FRONTEND:
[ ] Componentes de feedback integrados
[ ] Indicador de agentes funcionando
[ ] Build de producción testeado
[ ] Variables de entorno correctas

INFRAESTRUCTURA:
[ ] Docker containers corriendo (n8n, Chroma)
[ ] Backup de BD programado
[ ] Monitoreo básico (logs, tiempos)
[ ] SSL/HTTPS configurado (si aplica)

TESTING:
[ ] 20+ conversaciones de prueba exitosas
[ ] Validación de calidad narrativa (sin bullets)
[ ] Tiempos <30 seg en P95
[ ] Feedback end-to-end funcional
```

---

**Este documento es la especificación completa para evolucionar AMROIS 1.0 → 2.0 manteniendo todo lo que funciona y agregando inteligencia multi-agente.**

¿Quieres que profundice en alguna sección específica, o generamos código adicional para algún componente?
