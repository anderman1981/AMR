import AgentService2 from '../services/AgentService2.js';
import axios from 'axios';

/**
 * Analyzer Agent (AMROIS 2.0)
 * Responsible for applying deep analytical frameworks (First Principles, Feynman).
 */
class Analyzer extends AgentService2 {
  constructor(config) {
    super('Analyzer', config);
  }

  async run(input) {
    const { extraction } = input;

    const prompt = `
Eres un filósofo analítico y mentor socrático. Tu tarea es profundizar en el conocimiento extraído.

CONOCIMIENTO EXTRAÍDO:
${JSON.stringify(extraction)}

APLICA ESTOS FRAMEWORKS EN JSON:
1. "primeros_principios": Identifica las verdades fundamentales irreductibles.
2. "tecnica_feynman": Propón una explicación ultra-simple (para un niño) y detecta vacíos de conocimiento.
3. "tensiones": Detecta contradicciones o puntos de debate entre autores.

RESPONDE SOLO EN JSON:
{
  "primeros_principios": [{"principio": "...", "base": "..."}],
  "tecnica_feynman": [{"concepto": "...", "explicacion_simple": "...", "analogia": "..."}],
  "tensiones_y_debates": ["..."]
}
`;

    try {
      const response = await axios.post('http://localhost:11434/api/chat', {
        model: this.config.model || 'llama3:latest',
        messages: [{ role: 'system', content: prompt }],
        stream: false,
        format: 'json'
      });

      const result = JSON.parse(response.data.message.content);
      return { analysis: result };
    } catch (error) {
      throw new Error(`Ollama Analyzer call failed: ${error.message}`);
    }
  }
}

export default Analyzer;
