const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByUsername = async (username) => {
  const result = await query(
    "SELECT * FROM users WHERE username = $1 AND is_deleted = FALSE",
    [username]
  );

  return result.rows[0] || null;
};

/**
 * Find user by email
 * @param {string} email - Email to search for
 * @returns {Promise<Object|null>} User object or null
 */
const getUserByEmail = async (email) => {
  const result = await query(
    "SELECT * FROM users WHERE email = $1 AND is_deleted = FALSE",
    [email]
  );

  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} User object or null
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1 AND is_deleted = FALSE",
    [id]
  );

  return result.rows[0] || null;
};

/**
 * Find users by name (partial matching)
 * @param {string} searchTerm - Search term for name/username
 * @param {number} limit - Number of results to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of users
 */
const findUsersByName = async (searchTerm, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, email, full_name, created_at
     FROM users
     WHERE (LOWER(full_name) LIKE LOWER($1) OR LOWER(username) LIKE LOWER($1))
     AND is_deleted = FALSE
     ORDER BY username
     LIMIT $2 OFFSET $3`,
    [`%${searchTerm}%`, limit, offset]
  );

  return result.rows;
};

/**
 * Get user profile with follower/following counts
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User profile with stats
 */
const getUserProfile = async (userId) => {
  const result = await query(
    `SELECT 
      u.id,
      u.username,
      u.email,
      u.full_name,
      u.created_at,
      (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as follower_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
      (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND is_deleted = FALSE) as post_count
     FROM users u
     WHERE u.id = $1 AND u.is_deleted = FALSE`,
    [userId]
  );

  return result.rows[0] || null;
};

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user
 */
const updateUserProfile = async (userId, updates) => {
  const { full_name, email } = updates;
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (full_name !== undefined) {
    fields.push(`full_name = $${paramCount}`);
    values.push(full_name);
    paramCount++;
  }

  if (email !== undefined) {
    fields.push(`email = $${paramCount}`);
    values.push(email);
    paramCount++;
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(userId);

  const result = await query(
    `UPDATE users 
     SET ${fields.join(", ")}
     WHERE id = $${paramCount} AND is_deleted = FALSE
     RETURNING id, username, email, full_name, created_at`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Soft delete user
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const deleteUser = async (userId) => {
  const result = await query(
    "UPDATE users SET is_deleted = TRUE WHERE id = $1",
    [userId]
  );

  return result.rowCount > 0;
};

/**
 * Verify user password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  findUsersByName,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  verifyPassword,
};