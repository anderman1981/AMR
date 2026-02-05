import { ChromaClient } from 'chromadb'
import axios from 'axios'

class VectorStoreService {
  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMADB_URL || 'http://localhost:8000'
    })
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434'
    this.collection = null
    this.collectionName = 'amrois_knowledge'
  }

  /**
   * Initialize the vector store collection
   */
  async initialize() {
    try {
      console.log(`[VectorStore] Initializing collection: ${this.collectionName}`)
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { "hnsw:space": "cosine" }
      })
      console.log(`[VectorStore] Collection ready`)
    } catch (error) {
      console.error('[VectorStore] Initialization error:', error)
      throw error
    }
  }

  /**
   * Generate embeddings using Ollama
   */
  async generateEmbedding(text) {
    try {
      const response = await axios.post(`${this.ollamaHost}/api/embeddings`, {
        model: 'nomic-embed-text',
        prompt: text
      })
      return response.data.embedding
    } catch (error) {
      console.error('[VectorStore] Embedding error:', error.message)
      // Fallback or retry logic could go here
      throw new Error(`Failed to generate embedding: ${error.message}`)
    }
  }

  /**
   * Add a document to the vector store
   * @param {string} id Unique identifier for the chunk
   * @param {string} text Content of the chunk
   * @param {object} metadata Metadata associated with the chunk (bookId, page, section, etc.)
   */
  async addDocument(id, text, metadata = {}) {
    if (!this.collection) await this.initialize()

    try {
      const embedding = await this.generateEmbedding(text)
      await this.collection.add({
        ids: [id],
        embeddings: [embedding],
        metadatas: [metadata],
        documents: [text]
      })
      return true
    } catch (error) {
      console.error('[VectorStore] Error adding document:', error)
      return false
    }
  }

  /**
   * Bulk add documents
   */
  async addDocuments(documents) {
    if (!this.collection) await this.initialize()

    try {
      const ids = documents.map(doc => doc.id)
      const metadatas = documents.map(doc => doc.metadata || {})
      const content = documents.map(doc => doc.text)
      
      // Generate embeddings in parallel with some throttling if needed
      const embeddings = await Promise.all(
        content.map(text => this.generateEmbedding(text))
      )

      await this.collection.add({
        ids,
        embeddings,
        metadatas,
        documents: content
      })
      return true
    } catch (error) {
      console.error('[VectorStore] Bulk add error:', error)
      return false
    }
  }

  /**
   * Search for similar documents
   * @param {string} query Search query
   * @param {number} limit Number of results to return
   * @param {object} filter Metadata filter
   */
  async query(query, limit = 5, filter = {}) {
    if (!this.collection) await this.initialize()

    try {
      const queryEmbedding = await this.generateEmbedding(query)
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: Object.keys(filter).length > 0 ? filter : undefined
      })

      // Format results for easier consumption
      return results.ids[0].map((id, index) => ({
        id,
        text: results.documents[0][index],
        metadata: results.metadatas[0][index],
        distance: results.distances[0][index]
      }))
    } catch (error) {
      console.error('[VectorStore] Query error:', error)
      return []
    }
  }

  /**
   * Utility for intelligent chunking (section-based)
   * Basically a refined split that looks for headers or double newlines
   */
  chunkText(text, maxChunkSize = 1000, overlap = 200) {
    // This is a simplified version, can be improved with regex for headers
    const chunks = []
    let currentPos = 0
    
    while (currentPos < text.length) {
      let endPos = currentPos + maxChunkSize
      
      if (endPos < text.length) {
        // Find the last newline or sentence end to avoid cutting mid-sentence
        const lastNewline = text.lastIndexOf('\n', endPos)
        const lastPeriod = text.lastIndexOf('. ', endPos)
        
        if (lastNewline > currentPos + (maxChunkSize / 2)) {
          endPos = lastNewline
        } else if (lastPeriod > currentPos + (maxChunkSize / 2)) {
          endPos = lastPeriod + 1
        }
      }
      
      chunks.push(text.substring(currentPos, endPos).trim())
      currentPos = endPos - overlap
      
      // Safety break to avoid infinite loops if overlap >= maxChunkSize
      if (overlap >= maxChunkSize) currentPos = endPos
    }
    
    return chunks.filter(c => c.length > 50) // Filter out very small chunks
  }
}

export default new VectorStoreService()
