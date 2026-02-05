import AgentService from '../services/AgentService.js';
import axios from 'axios';

/**
 * SynthesizerAgent.js (AMROIS 2.0)
 * Unifies insights across multiple sources and ensures overall coherence.
 */
class SynthesizerAgent extends AgentService {
  constructor(config = {}) {
    super('Synthesizer', config);
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  /**
   * Synthesis Logic.
   * Takes multiple insights/analyses and creates a unified response.
   */
  async run(input) {
    const { items = [], query } = input;

    if (items.length === 0) {
      return {
        success: true,
        unified_content: "No items provided for synthesis.",
        item_count: 0
      };
    }

    console.log(`[Synthesizer] Unifying ${items.length} items for query: "${query}"`);

    const sourcesText = items.map((item, i) => `[Item ${i+1}]\n${item.content || item}`).join('\n\n---\n\n');

    const prompt = `
      System: You are the AMROIS 2.0 Knowledge Synthesizer. Your goal is to unify distinct insights into a cohesive, non-redundant perspective.
      
      User Query: "${query || "Synthesize these ideas"}"

      Insights/Data to Synthesize:
      ${sourcesText}

      Instructions:
      1. Identify common themes or direct connections between these items.
      2. Resolve any contradictions if possible, or highlight them as differing perspectives.
      3. Structure the final output logically (e.g., Introduction -> Unified Concepts -> Strategic Implications).
      4. Ensure a smooth narrative flow.

      Unified Synthesis:
    `;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: process.env.OLLAMA_MODEL || 'llama3', 
        prompt: prompt,
        stream: false
      });

      return {
        unified_content: response.data.response,
        item_count: items.length
      };
    } catch (error) {
      console.error('[Synthesizer] LLM Error:', error.message);
      return {
        unified_content: "Error synthesizing the provided items.",
        error: error.message
      };
    }
  }
}

export default new SynthesizerAgent();
