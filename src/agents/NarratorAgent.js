import AgentService from '../services/AgentService.js';
import axios from 'axios';

/**
 * NarratorAgent.js (AMROIS 2.0)
 * Applies specific personas (Author Voice, Life Coach) to the final output.
 */
class NarratorAgent extends AgentService {
  constructor(config = {}) {
    super('Narrator', config);
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  /**
   * Narration Logic.
   * Transforms unified content into a specific persona's voice.
   */
  async run(input) {
    const { content, persona = 'Coach', query } = input;

    if (!content) {
      throw new Error('Content is required for narration');
    }

    console.log(`[Narrator] Applying ${persona} persona to output.`);

    const personas = {
      'Coach': `You are the AMROIS Strategic Coach. Your tone is supportive, direct, and actionable. Focus on "Next Steps" and "Personal Growth". Use "we" to build Rapport.`,
      'Author': `You are the Original Author of the analyzed material. Your tone is authoritative, reflective, and matches the stylistic nuances of a published writer. Focus on the "Vision" and "Context".`,
      'Analyst': `You are a highly objective Research Analyst. Your tone is academic, precise, and detached. Focus on "Data", "Evidence", and "Structural Logic".`
    };

    const instruction = personas[persona] || personas['Coach'];

    const prompt = `
      System: ${instruction}
      
      User Context/Query: "${query || "Final report"}"

      Material to Narrate:
      ${content}

      Instruction: Rewrite the provided material using your specific persona. Ensure the core message remains intact but the expression reflects your identity.

      Narrated Response:
    `;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: 'llama3.2', 
        prompt: prompt,
        stream: false
      });

      return {
        final_response: response.data.response,
        persona_applied: persona
      };
    } catch (error) {
      console.error('[Narrator] LLM Error:', error.message);
      return {
        final_response: content, // Return original content if narration fails
        error: error.message
      };
    }
  }
}

export default new NarratorAgent();
