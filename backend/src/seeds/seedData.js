const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/database');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@eventhive.com',
    phone: '+1234567890',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'organizer1',
    email: 'organizer1@example.com',
    phone: '+1234567891',
    password: 'organizer123',
    role: 'organizer'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    phone: '+1234567892',
    password: 'user123',
    role: 'user'
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    phone: '+1234567893',
    password: 'user123',
    role: 'user'
  }
];

const sampleEvents = [
  {
    name: 'Tech Conference 2024',
    description: 'Annual technology conference featuring the latest innovations in software development, AI, and cloud computing.',
    category: 'technology',
    event_start: '2024-08-15 09:00:00',
    event_end: '2024-08-15 18:00:00',
    registration_start: '2024-06-01 00:00:00',
    registration_end: '2024-08-10 23:59:59',
    location: 'Convention Center, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    organizer_id: 2, // organizer1
    is_published: true
  },
  {
    name: 'Summer Music Festival',
    description: 'Outdoor music festival featuring live performances from local and international artists.',
    category: 'music',
    event_start: '2024-07-20 16:00:00',
    event_end: '2024-07-20 23:00:00',
    registration_start: '2024-05-01 00:00:00',
    registration_end: '2024-07-15 23:59:59',
    location: 'Central Park, New York, NY',
    latitude: 40.7829,
    longitude: -73.9654,
    organizer_id: 2, // organizer1
    is_published: true
  },
  {
    name: 'Business Networking Event',
    description: 'Connect with industry professionals and expand your business network.',
    category: 'business',
    event_start: '2024-09-10 18:00:00',
    event_end: '2024-09-10 21:00:00',
    registration_start: '2024-07-01 00:00:00',
    registration_end: '2024-09-05 23:59:59',
    location: 'Downtown Hotel, Chicago, IL',
    latitude: 41.8781,
    longitude: -87.6298,
    organizer_id: 2, // organizer1
    is_published: false
  }
];

const sampleTickets = [
  // Tech Conference tickets
  {
    event_id: 1,
    type_name: 'General Admission',
    price: 0.00,
    max_per_user: 2,
    max_total: 200,
    sale_start: '2024-06-01 00:00:00',
    sale_end: '2024-08-10 23:59:59'
  },
  {
    event_id: 1,
    type_name: 'VIP Access',
    price: 0.00,
    max_per_user: 1,
    max_total: 50,
    sale_start: '2024-06-01 00:00:00',
    sale_end: '2024-08-10 23:59:59'
  },
  // Music Festival tickets
  {
    event_id: 2,
    type_name: 'General Admission',
    price: 0.00,
    max_per_user: 4,
    max_total: 500,
    sale_start: '2024-05-01 00:00:00',
    sale_end: '2024-07-15 23:59:59'
  },
  {
    event_id: 2,
    type_name: 'Premium Access',
    price: 0.00,
    max_per_user: 2,
    max_total: 100,
    sale_start: '2024-05-01 00:00:00',
    sale_end: '2024-07-15 23:59:59'
  },
  // Business Event tickets
  {
    event_id: 3,
    type_name: 'Standard',
    price: 0.00,
    max_per_user: 1,
    max_total: 100,
    sale_start: '2024-07-01 00:00:00',
    sale_end: '2024-09-05 23:59:59'
  }
];

// Seed functions
async function seedUsers() {
  console.log('🔄 Seeding users...');
  
  for (const user of sampleUsers) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      const query = `
        INSERT INTO users (username, email, phone, password_hash, role, is_verified)
        VALUES (?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        role = VALUES(role),
        is_verified = VALUES(is_verified)
      `;
      
      await executeQuery(query, [
        user.username,
        user.email,
        user.phone,
        hashedPassword,
        user.role
      ]);
      
      console.log(`✅ User created: ${user.username} (${user.role})`);
    } catch (error) {
      console.error(`❌ Error creating user ${user.username}:`, error.message);
    }
  }
}

async function seedEvents() {
  console.log('🔄 Seeding events...');
  
  for (const event of sampleEvents) {
    try {
      const query = `
        INSERT INTO events (
          name, description, category, event_start, event_end,
          registration_start, registration_end, location,
          latitude, longitude, organizer_id, is_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        is_published = VALUES(is_published)
      `;
      
      await executeQuery(query, [
        event.name,
        event.description,
        event.category,
        event.event_start,
        event.event_end,
        event.registration_start,
        event.registration_end,
        event.location,
        event.latitude,
        event.longitude,
        event.organizer_id,
        event.is_published
      ]);
      
      console.log(`✅ Event created: ${event.name}`);
    } catch (error) {
      console.error(`❌ Error creating event ${event.name}:`, error.message);
    }
  }
}

async function seedTickets() {
  console.log('🔄 Seeding tickets...');
  
  for (const ticket of sampleTickets) {
    try {
      const query = `
        INSERT INTO tickets (
          event_id, type_name, price, max_per_user, max_total,
          sale_start, sale_end, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
      `;
      
      await executeQuery(query, [
        ticket.event_id,
        ticket.type_name,
        ticket.price,
        ticket.max_per_user,
        ticket.max_total,
        ticket.sale_start,
        ticket.sale_end
      ]);
      
      console.log(`✅ Ticket created: ${ticket.type_name} for event ${ticket.event_id}`);
    } catch (error) {
      console.error(`❌ Error creating ticket:`, error.message);
    }
  }
}

async function seedSampleBooking() {
  console.log('🔄 Creating sample booking...');
  
  try {
    const bookingId = `EVT-${Date.now()}`;
    
    // Create transaction
    const transactionQuery = `
      INSERT INTO transactions (
        booking_id, user_id, event_id, ticket_id, quantity,
        amount, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, 'completed', 'free')
    `;
    
    const result = await executeQuery(transactionQuery, [
      bookingId, 3, 1, 1, 1, 0.00
    ]);
    
    const transactionId = result.insertId;
    
    // Create attendee
    const qrCode = uuidv4();
    const attendeeQuery = `
      INSERT INTO attendees (
        transaction_id, name, email, phone, gender, qr_code
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await executeQuery(attendeeQuery, [
      transactionId,
      'John Doe',
      'user1@example.com',
      '+1234567892',
      'male',
      qrCode
    ]);
    
    console.log(`✅ Sample booking created: ${bookingId}`);
  } catch (error) {
    console.error('❌ Error creating sample booking:', error.message);
  }
}

async function runSeeds() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    await seedUsers();
    console.log();
    
    await seedEvents();
    console.log();
    
    await seedTickets();
    console.log();
    
    await seedSampleBooking();
    console.log();
    
    console.log('🎉 Database seeding completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return false;
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { runSeeds };
