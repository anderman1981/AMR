import AgentService from '../services/AgentService.js';
import axios from 'axios';

/**
 * InterpreterAgent.js (AMROIS 2.0)
 * Classifies user intent and identifies required specialized agents.
 */
class InterpreterAgent extends AgentService {
  constructor(config = {}) {
    super('Interpreter', config);
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  /**
   * Intent Classification Logic.
   * Uses LLM to determine what the user wants to do.
   */
  async run(input) {
    const { query, history = [] } = input;

    if (!query) {
      throw new Error('Query is required for interpretation');
    }

    console.log(`[Interpreter] Analyzing query: "${query}"`);

    const prompt = `
      System: You are the AMROIS 2.0 Intent Interpreter. Analyze the user query and classify it.
      
      Available Agents:
      1. Extractor: Extracts facts, principles, or summaries from books.
      2. Analyzer: Deep dive into concepts (Feynman technique, First Principles).
      3. Synthesizer: Connects ideas across multiple sources.
      4. Narrator: Generates content in specific voices (Coach, Author).
      5. TaskManager: Executes system actions (scan books, status updates).

      User Query: "${query}"

      Return a JSON object with:
      - intent: (one of the agent names or "General")
      - confidence: (0.0 to 1.0)
      - parameters: (extracted keywords, book names, or topics)
      - claridad_suficiente: (boolean)
      - next_steps: (short description)

      Example Output:
      {
        "intent": "Extractor",
        "confidence": 0.95,
        "parameters": { "topic": "habit formation", "book": "Atomic Habits" },
        "claridad_suficiente": true,
        "next_steps": "Handover to Extractor for concept retrieval."
      }

      JSON:
    `;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: 'llama3.2', // Lightweight model for intent
        prompt: prompt,
        stream: false,
        format: 'json'
      });

      const result = JSON.parse(response.data.response);
      
      return {
        interpretation: result,
        raw_query: query
      };
    } catch (error) {
      console.error('[Interpreter] LLM Error:', error.message);
      // Fallback to basic keyword matching if LLM fails
      return this.fallbackInterpretation(query);
    }
  }

  fallbackInterpretation(query) {
    const q = query.toLowerCase();
    if (q.includes('resumen') || q.includes('extrae') || q.includes('resumir')) {
      return { interpretation: { intent: 'Extractor', confidence: 0.7, claridad_suficiente: true } };
    }
    return { interpretation: { intent: 'General', confidence: 0.5, claridad_suficiente: true } };
  }
}

export default new InterpreterAgent();
