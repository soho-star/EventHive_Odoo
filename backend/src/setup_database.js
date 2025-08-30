let mysql = require('mysql2');

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123"
});

// Database setup function
async function setupDatabase() {
  return new Promise((resolve, reject) => {
    con.connect(function(err) {
      if (err) {
        console.error("❌ Connection failed:", err);
        reject(err);
        return;
      }
      console.log("✅ Connected to MySQL!");

      // Step 1: Create database
      con.query("CREATE DATABASE IF NOT EXISTS eventhive", function (err, result) {
        if (err) {
          console.error("❌ Database creation failed:", err);
          reject(err);
          return;
        }
        console.log("✅ Database 'eventhive' created or already exists.");

        // Step 2: Use the database
        con.query("USE eventhive", function (err) {
          if (err) {
            console.error("❌ Failed to use database:", err);
            reject(err);
            return;
          }
          console.log("✅ Using 'eventhive' database.");

          // Step 3: Create all tables
          createAllTables()
            .then(() => {
              console.log("🎉 Database setup completed successfully!");
              resolve();
            })
            .catch((error) => {
              console.error("❌ Database setup failed:", error);
              reject(error);
            });
        });
      });
    });
  });
}

// Execute query helper
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    con.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to create all tables in correct order
async function createAllTables() {
  const tables = [
    createUsersTable,
    createOrganizerProfilesTable,
    createEventsTable,
    createTicketsTable,
    createTransactionsTable,
    createAttendeesTable,
    createPromotionsTable,
    createUserSessionsTable,
    createEventReviewsTable,
    createEventTemplatesTable
  ];

  for (const createTable of tables) {
    await createTable();
  }

  // Insert sample data
  await insertSampleData();
}

// Create Users Table
async function createUsersTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(15) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'organizer', 'admin') DEFAULT 'user',
      is_verified BOOLEAN DEFAULT FALSE,
      profile_image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX idx_email (email),
      INDEX idx_phone (phone),
      INDEX idx_role (role),
      INDEX idx_username (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Users table created successfully');
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
    throw error;
  }
}

// Create Events Table
async function createEventsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      event_start DATETIME NOT NULL,
      event_end DATETIME NOT NULL,
      registration_start DATETIME NOT NULL,
      registration_end DATETIME NOT NULL,
      location VARCHAR(300) NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      poster_url VARCHAR(500),
      additional_images JSON,
      organizer_id INT NOT NULL,
      is_published BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_category (category),
      INDEX idx_event_start (event_start),
      INDEX idx_location (latitude, longitude),
      INDEX idx_organizer (organizer_id),
      INDEX idx_published (is_published),
      INDEX idx_registration_period (registration_start, registration_end)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Events table created successfully');
  } catch (error) {
    console.error('❌ Error creating events table:', error.message);
    throw error;
  }
}

// Create Tickets Table
async function createTicketsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_id INT NOT NULL,
      type_name VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      max_per_user INT DEFAULT 1,
      max_total INT DEFAULT 100,
      sold_count INT DEFAULT 0,
      sale_start DATETIME,
      sale_end DATETIME,
      is_active BOOLEAN DEFAULT TRUE,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      INDEX idx_event (event_id),
      INDEX idx_active (is_active),
      INDEX idx_sale_period (sale_start, sale_end),
      INDEX idx_price (price)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Tickets table created successfully');
  } catch (error) {
    console.error('❌ Error creating tickets table:', error.message);
    throw error;
  }
}

// Create Transactions Table
async function createTransactionsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      booking_id VARCHAR(50) UNIQUE NOT NULL,
      user_id INT NOT NULL,
      event_id INT NOT NULL,
      ticket_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
      payment_method VARCHAR(50) DEFAULT 'free',
      payment_gateway_id VARCHAR(100),
      payment_metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
      INDEX idx_user (user_id),
      INDEX idx_event (event_id),
      INDEX idx_ticket (ticket_id),
      INDEX idx_booking_id (booking_id),
      INDEX idx_status (payment_status),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Transactions table created successfully');
  } catch (error) {
    console.error('❌ Error creating transactions table:', error.message);
    throw error;
  }
}

// Create Attendees Table
async function createAttendeesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS attendees (
      id INT PRIMARY KEY AUTO_INCREMENT,
      transaction_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(15),
      gender ENUM('male', 'female', 'other'),
      additional_info JSON,
      has_attended BOOLEAN DEFAULT FALSE,
      check_in_time DATETIME,
      qr_code VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      INDEX idx_transaction (transaction_id),
      INDEX idx_email (email),
      INDEX idx_qr_code (qr_code),
      INDEX idx_attendance (has_attended),
      INDEX idx_check_in (check_in_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Attendees table created successfully');
  } catch (error) {
    console.error('❌ Error creating attendees table:', error.message);
    throw error;
  }
}

// Create Promotions Table
async function createPromotionsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS promotions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_id INT NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      type ENUM('percentage', 'fixed', 'early_bird') DEFAULT 'percentage',
      discount_value DECIMAL(10, 2) NOT NULL,
      usage_limit INT DEFAULT 1,
      used_count INT DEFAULT 0,
      valid_from DATETIME NOT NULL,
      valid_until DATETIME NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      INDEX idx_event (event_id),
      INDEX idx_code (code),
      INDEX idx_active (is_active),
      INDEX idx_validity_period (valid_from, valid_until),
      INDEX idx_usage (used_count, usage_limit)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Promotions table created successfully');
  } catch (error) {
    console.error('❌ Error creating promotions table:', error.message);
    throw error;
  }
}

// Create User Sessions Table
async function createUserSessionsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      session_token VARCHAR(255) UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      device_info TEXT,
      ip_address VARCHAR(45),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user (user_id),
      INDEX idx_token (session_token),
      INDEX idx_expires (expires_at),
      INDEX idx_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ User sessions table created successfully');
  } catch (error) {
    console.error('❌ Error creating user sessions table:', error.message);
    throw error;
  }
}

// Create Organizer Profiles Table
async function createOrganizerProfilesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS organizer_profiles (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      company_name VARCHAR(200),
      bio TEXT,
      website VARCHAR(500),
      social_links JSON,
      business_email VARCHAR(100),
      business_phone VARCHAR(15),
      address TEXT,
      verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
      verification_documents JSON,
      rating DECIMAL(3, 2) DEFAULT 0.00,
      total_events INT DEFAULT 0,
      total_revenue DECIMAL(12, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_organizer (user_id),
      INDEX idx_verification (verification_status),
      INDEX idx_rating (rating)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Organizer profiles table created successfully');
  } catch (error) {
    console.error('❌ Error creating organizer profiles table:', error.message);
    throw error;
  }
}

// Create Event Reviews Table
async function createEventReviewsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS event_reviews (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      transaction_id INT,
      rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT,
      is_verified_attendee BOOLEAN DEFAULT FALSE,
      helpful_count INT DEFAULT 0,
      is_flagged BOOLEAN DEFAULT FALSE,
      admin_response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
      UNIQUE KEY unique_review (event_id, user_id),
      INDEX idx_event_rating (event_id, rating),
      INDEX idx_user (user_id),
      INDEX idx_verified (is_verified_attendee),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Event reviews table created successfully');
  } catch (error) {
    console.error('❌ Error creating event reviews table:', error.message);
    throw error;
  }
}

// Create Event Templates Table
async function createEventTemplatesTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS event_templates (
      id INT PRIMARY KEY AUTO_INCREMENT,
      organizer_id INT NOT NULL,
      template_name VARCHAR(200) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      default_duration_hours INT DEFAULT 2,
      default_location VARCHAR(300),
      default_ticket_types JSON,
      default_settings JSON,
      usage_count INT DEFAULT 0,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_organizer (organizer_id),
      INDEX idx_category (category),
      INDEX idx_public (is_public),
      INDEX idx_usage (usage_count)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  
  try {
    await executeQuery(query);
    console.log('✅ Event templates table created successfully');
  } catch (error) {
    console.error('❌ Error creating event templates table:', error.message);
    throw error;
  }
}

// Insert sample data
async function insertSampleData() {
  try {
    console.log('📝 Inserting sample data...');

    // Insert sample users (password is 'password' hashed with bcrypt)
    const users = [
      ['admin', 'admin@eventhive.com', '+1234567890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true, null],
      ['john_organizer', 'john@eventhive.com', '+1234567891', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'organizer', true, null],
      ['jane_user', 'jane@eventhive.com', '+1234567892', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true, null]
    ];

    for (const user of users) {
      await executeQuery(
        'INSERT IGNORE INTO users (username, email, phone, password_hash, role, is_verified, profile_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }

    // Insert sample events
    const events = [
      [
        'Tech Conference 2024',
        'Annual technology conference featuring the latest in web development, AI, and cloud computing.',
        'technology',
        '2024-12-15 09:00:00',
        '2024-12-15 18:00:00',
        '2024-11-01 00:00:00',
        '2024-12-10 23:59:59',
        'San Francisco Convention Center',
        37.7749,
        -122.4194,
        null,
        null,
        2,
        true
      ],
      [
        'Summer Music Festival',
        'A vibrant outdoor music festival featuring local and international artists.',
        'music',
        '2024-12-20 16:00:00',
        '2024-12-20 23:00:00',
        '2024-11-01 00:00:00',
        '2024-12-18 23:59:59',
        'Golden Gate Park, San Francisco',
        37.7694,
        -122.4862,
        null,
        null,
        2,
        true
      ],
      [
        'Food & Wine Tasting',
        'Explore the finest local cuisine and wines from renowned chefs and vintners.',
        'food',
        '2024-12-25 18:00:00',
        '2024-12-25 22:00:00',
        '2024-11-01 00:00:00',
        '2024-12-23 23:59:59',
        'Napa Valley Wine Country',
        38.2975,
        -122.2869,
        null,
        null,
        2,
        true
      ]
    ];

    for (const event of events) {
      await executeQuery(
        'INSERT IGNORE INTO events (name, description, category, event_start, event_end, registration_start, registration_end, location, latitude, longitude, poster_url, additional_images, organizer_id, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        event
      );
    }

    // Insert sample tickets
    const tickets = [
      [1, 'General Admission', 0.00, 4, 200, 0, '2024-11-01 00:00:00', '2024-12-10 23:59:59', true, null],
      [1, 'VIP Access', 0.00, 2, 50, 0, '2024-11-01 00:00:00', '2024-12-10 23:59:59', true, null],
      [2, 'Early Bird', 0.00, 6, 300, 0, '2024-11-01 00:00:00', '2024-12-01 23:59:59', true, null],
      [2, 'Regular', 0.00, 4, 500, 0, '2024-12-02 00:00:00', '2024-12-18 23:59:59', true, null],
      [3, 'Standard', 0.00, 2, 100, 0, '2024-11-01 00:00:00', '2024-12-23 23:59:59', true, null]
    ];

    for (const ticket of tickets) {
      await executeQuery(
        'INSERT IGNORE INTO tickets (event_id, type_name, price, max_per_user, max_total, sold_count, sale_start, sale_end, is_active, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ticket
      );
    }

    console.log('✅ Sample data inserted successfully');
  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
    throw error;
  }
}

// Function to test the database
async function testDatabase() {
  try {
    console.log('\n🔍 Testing database...');
    
    // Test users table
    const users = await executeQuery('SELECT id, username, email, role FROM users LIMIT 5');
    console.log('👥 Users:', users);
    
    // Test events table
    const events = await executeQuery('SELECT id, name, category, location FROM events LIMIT 5');
    console.log('🎪 Events:', events);
    
    // Test tickets table
    const tickets = await executeQuery('SELECT id, event_id, type_name, price FROM tickets LIMIT 5');
    console.log('🎫 Tickets:', tickets);
    
    console.log('✅ Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

// Main execution
async function main() {
  try {
    await setupDatabase();
    await testDatabase();
    
    console.log('\n🎉 EventHive database is ready!');
    console.log('📊 Database: eventhive');
    console.log('🔗 Connection: localhost:3306');
    console.log('👤 User: root');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    con.end();
  }
}

// Run the setup
main();
