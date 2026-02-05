import AgentService from '../services/AgentService.js';
import axios from 'axios';

/**
 * AnalyzerAgent.js (AMROIS 2.0)
 * Deep dives into concepts using thinking frameworks (Feynman, First Principles).
 */
class AnalyzerAgent extends AgentService {
  constructor(config = {}) {
    super('Analyzer', config);
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  /**
   * Analysis Logic.
   * Takes extracted content and applies a specific framework.
   */
  async run(input) {
    const { content, framework = 'Feynman', query } = input;

    if (!content) {
      throw new Error('Content is required for analysis');
    }

    console.log(`[Analyzer] Applying ${framework} framework to content.`);

    const prompts = {
      'Feynman': `Explain the following concept like I am 5 years old. Use simple analogies and avoid jargon. Identify any "gaps" in the provided content that would require further explanation.`,
      'First Principles': `Break down the following concept into its most fundamental truths. Strip away assumptions and analogies. What are the core components that make this true?`,
      'Socratic': `Challenge the following content with critical questions. Identify potential weaknesses or contradictions in the logic presented.`
    };

    const instruction = prompts[framework] || prompts['Feynman'];

    const prompt = `
      System: You are the AMROIS 2.0 Concept Analyzer. Apply the requested thinking framework to the provided content.
      
      User Query/Context: "${query || "Analyze these concepts"}"
      Framework: ${framework}

      Content to Analyze:
      ${content}

      Instruction:
      ${instruction}

      Analysis:
    `;

    try {
      const response = await axios.post(`${this.ollamaHost}/api/generate`, {
        model: 'llama3.2', 
        prompt: prompt,
        stream: false
      });

      return {
        analysis_content: response.data.response,
        framework_used: framework
      };
    } catch (error) {
      console.error('[Analyzer] LLM Error:', error.message);
      return {
        analysis_content: "Error analyzing the content with the requested framework.",
        error: error.message
      };
    }
  }
}

export default new AnalyzerAgent();
