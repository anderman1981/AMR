import AgentService from '../services/AgentService.js';
import vectorStore from '../services/VectorStoreService.js';
import axios from 'axios';

/**
 * ExtractorAgent.js (AMROIS 2.0)
 * Performs RAG-based extraction of facts, principles, and insights.
 */
class ExtractorAgent extends AgentService {
  constructor(config = {}) {
    super('Extractor', config);
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  /**
   * Extraction Logic.
   * 1. Query Vector Store for relevant chunks.
   * 2. Use LLM to extract specific information from chunks.
   */
  async run(input) {
    const { query, bookIds = [], limit = 5 } = input;

    if (!query) {
      throw new Error('Query is required for extraction');
    }

    console.log(`[Extractor] Querying knowledge base for: "${query}"`);

    // 1. Semantic Search
    const contextResults = await vectorStore.query(query, limit, bookIds);
    
    if (contextResults.length === 0) {
      return {
        success: true,
        extracted_content: "No relevant information found in the current knowledge base.",
        source_count: 0
      };
    }

    const contextText = contextResults.map(res => `[Source: ${res.metadata.book_name}, Chunk: ${res.metadata.chunk_index}]\n${res.text}`).join('\n\n---\n\n');

    // 2. Extraction Prompt
    const prompt = `
      System: You are the AMROIS 2.0 Knowledge Extractor. Extract relevant information from the provided context to answer the user query.
      
      User Query: "${query}"

      Context:
      ${contextText}

      Instructions:
      - Answer the query accurately based ONLY on the provided context.
      - If multiple perspectives are present, mention them.
      - List key principles or facts if appropriate.
      - Cite sources using [Book Name].

      Extracted Insight:
    `;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: 'llama3.2', 
        prompt: prompt,
        stream: false
      });

      return {
        extracted_content: response.data.response,
        sources: contextResults.map(r => ({ book: r.metadata.book_name, score: r.similarity })),
        source_count: contextResults.length
      };
    } catch (error) {
      console.error('[Extractor] LLM Error:', error.message);
      return {
        extracted_content: "Error extracts knowledge from the provided context.",
        error: error.message
      };
    }
  }
}

export default new ExtractorAgent();
