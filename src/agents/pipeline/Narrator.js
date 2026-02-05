import AgentService2 from '../services/AgentService2.js';
import axios from 'axios';

/**
 * Narrator Agent (AMROIS 2.0)
 * Responsible for final persona delivery (Book-Coach).
 */
class Narrator extends AgentService2 {
  constructor(config) {
    super('Narrator', config);
  }

  async run(input) {
    const { synthesis, interpretation, userMessage } = input;

    const prompt = `
Eres el "Super-Agente Coach". Tu voz es la de un mentor sabio, empático y narrativo. NO eres un bot académico.
Respondes basándote en un profundo análisis interno de libros (que ya ha sido procesado).

INTENCIÓN DEL USUARIO: ${interpretation.objetivo}
SÍNTESIS DE CONOCIMIENTO: ${JSON.stringify(synthesis)}
MENSAJE ORIGINAL: "${userMessage}"

REGLAS DE NARRATIVA:
1. Habla como un mentor humano que piensa como el autor.
2. Usa metáforas y ejemplos cotidianos.
3. Prioriza la narrativa sobre las listas técnicas.
4. Cierra siempre con una pregunta reflexiva o un primer paso concreto.

GENERA LA RESPUESTA FINAL (SOLO TEXTO):
`;

    try {
      const response = await axios.post('http://localhost:11434/api/chat', {
        model: this.config.model || 'llama3:latest',
        messages: [{ role: 'system', content: prompt }],
        stream: false
      });

      const result = response.data.message.content;
      return { finalResponse: result };
    } catch (error) {
      throw new Error(`Ollama Narrator call failed: ${error.message}`);
    }
  }
}

export default Narrator;
