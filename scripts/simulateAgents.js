
import axios from 'axios';

const API_URL = 'http://localhost:3467/api';

async function simulateAgentProgress() {
  console.log('🔄 Starting Agent Simulation...');

  try {
    // 1. Get all pending tasks
    const tasksRes = await axios.get(`${API_URL}/tasks?status=pending&limit=10`);
    const tasks = tasksRes.data.data.tasks;

    console.log(`Found ${tasks.length} pending tasks`);

    for (const task of tasks) {
      console.log(`Processing Task ${task.id} (${task.agent_type})...`);
      
      // Simulate progress 0 -> 100
      for (let i = 0; i <= 100; i += 20) {
        await axios.patch(`${API_URL}/tasks/${task.id}/progress`, { progress: i });
        console.log(`Task ${task.id}: ${i}%`);
        await new Promise(r => setTimeout(r, 500)); // Wait 500ms
      }

      // Mark as complete (simulated, usually agent does this)
      // await axios.patch(`${API_URL}/tasks/${task.id}/complete`, { result: { success: true } });
      console.log(`Task ${task.id} Completed!`);
    }

  } catch (error) {
    console.error('Simulation Error:', error.message);
  }
}

simulateAgentProgress();
