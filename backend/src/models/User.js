const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.phone = data.phone;
    this.role = data.role;
    this.isVerified = data.is_verified;
    this.profileImageUrl = data.profile_image_url;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, phone, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(query, [username, email, phone, passwordHash, role]);
    
    if (result.insertId) {
      return await User.findById(result.insertId);
    }
    
    throw new Error('Failed to create user');
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    const users = await executeQuery(query, [id]);
    
    return users.length > 0 ? new User(users[0]) : null;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const users = await executeQuery(query, [email]);
    
    return users.length > 0 ? new User(users[0]) : null;
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const users = await executeQuery(query, [username]);
    
    return users.length > 0 ? new User(users[0]) : null;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get password hash for user
  static async getPasswordHash(userId) {
    const query = 'SELECT password_hash FROM users WHERE id = ?';
    const result = await executeQuery(query, [userId]);
    
    return result.length > 0 ? result[0].password_hash : null;
  }

  // Update user
  static async updateById(id, updateData) {
    const allowedFields = ['username', 'phone', 'profile_image_url', 'is_verified'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      const dbKey = key === 'profileImageUrl' ? 'profile_image_url' : 
                   key === 'isVerified' ? 'is_verified' : key;
      
      if (allowedFields.includes(dbKey)) {
        updates.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);

    return await User.findById(id);
  }

  // Change password
  static async changePassword(userId, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const query = `
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await executeQuery(query, [passwordHash, userId]);
    return true;
  }

  // Get all users (admin only)
  static async findAll(options = {}) {
    const { page = 1, limit = 10, role = null } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = ?';
      countQuery += ' WHERE role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [users, countResult] = await Promise.all([
      executeQuery(query, params),
      executeQuery(countQuery, role ? [role] : [])
    ]);

    return {
      users: users.map(user => new User(user)),
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  // Delete user
  static async deleteById(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    
    return result.affectedRows > 0;
  }

  // Check if email exists
  static async emailExists(email, excludeId = null) {
    let query = 'SELECT id FROM users WHERE email = ?';
    const params = [email];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await executeQuery(query, params);
    return result.length > 0;
  }

  // Check if username exists
  static async usernameExists(username, excludeId = null) {
    let query = 'SELECT id FROM users WHERE username = ?';
    const params = [username];

    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }

    const result = await executeQuery(query, params);
    return result.length > 0;
  }

  // Get user statistics
  static async getStats() {
    const queries = [
      'SELECT COUNT(*) as totalUsers FROM users',
      'SELECT COUNT(*) as totalOrganizers FROM users WHERE role = "organizer"',
      'SELECT COUNT(*) as totalAdmins FROM users WHERE role = "admin"',
      'SELECT COUNT(*) as verifiedUsers FROM users WHERE is_verified = 1'
    ];

    const results = await Promise.all(queries.map(query => executeQuery(query)));

    return {
      totalUsers: results[0][0].totalUsers,
      totalOrganizers: results[1][0].totalOrganizers,
      totalAdmins: results[2][0].totalAdmins,
      verifiedUsers: results[3][0].verifiedUsers
    };
  }

  // Convert to JSON (exclude sensitive data)
  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
