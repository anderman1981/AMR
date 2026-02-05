import AgentService2 from '../services/AgentService2.js';
import axios from 'axios';

/**
 * Interpreter Agent (AMROIS 2.0)
 * Responsible for intent classification and flow decision.
 */
class Interpreter extends AgentService2 {
  constructor(config) {
    super('Interpreter', config);
  }

  async run(input) {
    const { message, history = [], bookContext = "" } = input;

    const prompt = `
Eres un experto en análisis de intenciones conversacionales sobre libros (Super-Agente Coach).

CONTEXTO DEL USUARIO:
- Historial de conversaciones: ${JSON.stringify(history.slice(-4))}
- Libros disponibles/Contexto: ${bookContext}

MENSAJE DEL USUARIO:
"${message}"

ANALIZA Y CLASIFICA:
1. ¿Cuál es el OBJETIVO principal? (aprender, decidir, crear, aplicar, investigar, reflexionar)
2. ¿Qué FUENTES necesita consultar? (específicos o biblioteca general)
3. ¿Qué PROFUNDIDAD espera? (rápida, práctica, profunda, estratégica)
4. ¿Hay SUFICIENTE CONTEXTO para responder bien?
5. Si NO, ¿qué 2-4 PREGUNTAS CORTAS necesitas para aclarar?

RESPONDE SOLO EN JSON:
{
  "objetivo": "...",
  "fuentes_requeridas": [],
  "profundidad": "...",
  "claridad_suficiente": true,
  "preguntas_aclaracion": [],
  "contexto_detectado": {
    "tema_principal": "...",
    "subtemas": [],
    "nivel_usuario": "principiante|intermedio|avanzado"
  }
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
      return { interpretation: result };
    } catch (error) {
      throw new Error(`Ollama Interpreter call failed: ${error.message}`);
    }
  }
}

export default Interpreter;
