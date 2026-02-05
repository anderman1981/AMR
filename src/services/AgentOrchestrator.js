import interpreter from '../agents/InterpreterAgent.js';
import extractor from '../agents/ExtractorAgent.js';
import analyzer from '../agents/AnalyzerAgent.js';
import synthesizer from '../agents/SynthesizerAgent.js';
import narrator from '../agents/NarratorAgent.js';

/**
 * AgentOrchestrator.js (AMROIS 2.0)
 * Coordinates the execution of the multi-agent pipeline.
 */
class AgentOrchestrator {
  constructor() {
    this.agents = {
      interpreter,
      extractor,
      analyzer,
      synthesizer,
      narrator
    };
  }

  /**
   * Pipeline Execution.
   * Runs the full agent sequence based on user query.
   */
  async processQuery(userInput, options = {}) {
    const { bookIds = [], persona = 'Coach', framework = 'Feynman' } = options;
    const startTime = Date.now();
    const pipelineLog = [];

    try {
      // 1. Interpretation
      console.log('🏁 Starting pipeline: Interpretation stage...');
      const interpretationResult = await this.agents.interpreter.execute({ query: userInput });
      pipelineLog.push({ stage: 'Interpretation', ...interpretationResult });

      if (!interpretationResult.success) throw new Error('Interpretation failed');
      const intent = interpretationResult.interpretation.intent;

      // 2. Knowledge Extraction (RAG)
      console.log('🔍 Extraction stage...');
      const extractionResult = await this.agents.extractor.execute({ 
        query: userInput, 
        bookIds 
      });
      pipelineLog.push({ stage: 'Extraction', ...extractionResult });

      if (!extractionResult.success) throw new Error('Extraction failed');

      // 3. Analysis (optional deep dive)
      console.log('🧠 Analysis stage...');
      const analysisResult = await this.agents.analyzer.execute({
        content: extractionResult.extracted_content,
        framework,
        query: userInput
      });
      pipelineLog.push({ stage: 'Analysis', ...analysisResult });

      // 4. Synthesis (Optional if multiple sources)
      // For now, we synthesize the Analysis + Extraction
      console.log('🧬 Synthesis stage...');
      const synthesisResult = await this.agents.synthesizer.execute({
        items: [extractionResult.extracted_content, analysisResult.analysis_content],
        query: userInput
      });
      pipelineLog.push({ stage: 'Synthesis', ...synthesisResult });

      // 5. Narration
      console.log('🗣️  Narration stage...');
      const narrationResult = await this.agents.narrator.execute({
        content: synthesisResult.unified_content,
        persona,
        query: userInput
      });
      pipelineLog.push({ stage: 'Narration', ...narrationResult });

      const totalTime = Date.now() - startTime;
      console.log(`✅ Pipeline completed in ${totalTime}ms`);

      return {
        success: true,
        final_answer: narrationResult.final_response,
        metadata: {
          execution_time: totalTime,
          stages: pipelineLog,
          intent,
          sources: extractionResult.sources
        }
      };

    } catch (error) {
      console.error('❌ Pipeline Error:', error.message);
      return {
        success: false,
        error: error.message,
        partial_results: pipelineLog
      };
    }
  }
}

export default new AgentOrchestrator();
