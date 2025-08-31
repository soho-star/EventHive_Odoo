const { executeQuery } = require('./src/config/database');

async function testDatabase() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const connection = await executeQuery('SELECT 1 as test');
    console.log('✅ Database connection successful:', connection);
    
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
    
    // Show some event details
    const eventDetails = await executeQuery(`
      SELECT id, name, category, location, is_published, event_start 
      FROM events 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('🎪 Recent events:', eventDetails);
    
    // Check tickets table
    console.log('🎫 Checking tickets table...');
    const tickets = await executeQuery('SELECT COUNT(*) as count FROM tickets');
    console.log('🎫 Total tickets:', tickets[0].count);
    
    // Check users table
    console.log('👥 Checking users table...');
    const users = await executeQuery('SELECT COUNT(*) as count FROM users');
    console.log('👥 Total users:', users[0].count);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDatabase();


