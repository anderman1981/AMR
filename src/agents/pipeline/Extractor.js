import AgentService2 from '../services/AgentService2.js';
import axios from 'axios';

/**
 * Extractor Agent (AMROIS 2.0)
 * Responsible for knowledge extraction from book contexts.
 */
class Extractor extends AgentService2 {
  constructor(config) {
    super('Extractor', config);
  }

  async run(input) {
    const { contextChunks, interpretation } = input;

    const prompt = `
Eres un experto en extracción de conocimiento profundo. Tu tarea es analizar los siguientes fragmentos de libros y extraer una estructura rica de conocimiento.

CONTEXTO DE LOS LIBROS:
${contextChunks.join('\n\n')}

INTENCIÓN DETECTADA:
${JSON.stringify(interpretation)}

EXTRAE Y ESTRUCTURA EN JSON:
{
  "ideas_centrales": [{"idea": "...", "relevancia": 0.9}],
  "principios": [{"nombre": "...", "descripcion": "..."}],
  "modelos_mentales": [{"nombre": "...", "descripcion": "..."}],
  "argumentos_clave": ["..."],
  "supuestos_autor": ["..."],
  "citas_relevantes": [{"texto": "...", "fuente": "..."}]
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
      return { extraction: result };
    } catch (error) {
      throw new Error(`Ollama Extractor call failed: ${error.message}`);
    }
  }
}

export default Extractor;
