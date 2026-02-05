import AgentService2 from '../services/AgentService2.js';
import axios from 'axios';

/**
 * Synthesizer Agent (AMROIS 2.0)
 * Responsible for unifying knowledge into a coherent mentor framework.
 */
class Synthesizer extends AgentService2 {
  constructor(config) {
    super('Synthesizer', config);
  }

  async run(input) {
    const { extraction, analysis } = input;

    const prompt = `
Eres un arquitecto de conocimiento. Tu tarea es sintetizar la extracción y el análisis en un marco mental unificado para el usuario.

ENTRADAS:
- Extracción: ${JSON.stringify(extraction)}
- Análisis: ${JSON.stringify(analysis)}

CREA UNA SÍNTESIS ESTRUCTURADA EN JSON:
{
  "marco_mental": {
    "nombre": "...",
    "vision_unificada": "...",
    "principios_rectores": ["..."]
  },
  "acciones_practicas": ["..."],
  "experimentos_sugeridos": ["..."]
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
      return { synthesis: result };
    } catch (error) {
      throw new Error(`Ollama Synthesizer call failed: ${error.message}`);
    }
  }
}

export default Synthesizer;
