import { query } from './src/config/sqlite.js';

async function verify() {
  console.log('Verifying DB queries...');
  try {
    console.log('Checking generated_cards...');
    await query('SELECT COUNT(*) FROM generated_cards');
    console.log('✅ generated_cards exists');

    console.log('Checking agent_performance...');
    await query('SELECT COUNT(*) FROM agent_performance');
    console.log('✅ agent_performance exists');

    console.log('Checking global_chat_messages...');
    await query('SELECT COUNT(*) FROM global_chat_messages');
    console.log('✅ global_chat_messages exists');

    console.log('Running complex query from stats...');
    await query(`
            SELECT 
                COUNT(*) as total_cards,
                COUNT(CASE WHEN type = 'quote' THEN 1 END) as quotes,
                COUNT(CASE WHEN type = 'summary' THEN 1 END) as summaries,
                COUNT(CASE WHEN type = 'key_points' THEN 1 END) as insights
            FROM generated_cards
    `);
    console.log('✅ Complex query generated_cards passed');

  } catch (err) {
    console.error('❌ Check failed:', err.message);
  }
}

verify();
