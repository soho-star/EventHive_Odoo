const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    const existingUser = await executeQuery(checkQuery, ['admin@eventhive.com']);
    
    if (existingUser.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const insertQuery = `
      INSERT INTO users (username, email, password, role, is_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(insertQuery, [
      'Admin',
      'admin@eventhive.com',
      hashedPassword,
      'admin',
      true
    ]);

    console.log('Admin user created successfully!');
    console.log('Email: admin@eventhive.com');
    console.log('Password: admin123');
    console.log('User ID:', result.insertId);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Run the script
createAdminUser();
