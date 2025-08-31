const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'eventhive',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Create database if it doesn't exist
async function createDatabase() {
  try {
    // Connect without specifying database
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    const tempConnection = await mysql.createConnection(tempConfig);
    
    // Create database
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' created/verified`);
    
    await tempConnection.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    return false;
  }
}

// Initialize database
async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    process.exit(1);
  }
  
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }
  
  console.log('✅ Database initialization complete');
}

// Execute query with error handling
async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Query execution failed:', error.message);
    throw error;
  }
}

// Get database connection from pool
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('❌ Failed to get database connection:', error.message);
    throw error;
  }
}

// Execute transaction
async function executeTransaction(callback) {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
  createDatabase,
  initializeDatabase,
  executeQuery,
  getConnection,
  executeTransaction
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}
