const { executeQuery } = require('./src/config/database');

async function testEvents() {
  try {
    console.log('🔄 Testing events in database...');
    
    // Check if events table exists and has data
    console.log('📊 Checking events table...');
    const events = await executeQuery('SELECT COUNT(*) as count FROM events');
    console.log('📈 Total events:', events[0].count);
    
    // Check published events
    const publishedEvents = await executeQuery('SELECT COUNT(*) as count FROM events WHERE is_published = 1');
    console.log('✅ Published events:', publishedEvents[0].count);
    
    // Check unpublished events
    const unpublishedEvents = await executeQuery('SELECT COUNT(*) as count FROM events WHERE is_published = 0');
    console.log('📝 Draft events:', unpublishedEvents[0].count);
    
    // Show all events with their published status
    const allEvents = await executeQuery(`
      SELECT id, name, category, location, is_published, event_start, organizer_id
      FROM events 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.log('🎪 All events:', allEvents);
    
    // Check if there are any users (organizers)
    const users = await executeQuery('SELECT id, username, email, role FROM users LIMIT 5');
    console.log('👥 Users:', users);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testEvents();


