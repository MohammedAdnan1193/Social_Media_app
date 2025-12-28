const { query } = require("../utils/database");

/**
 * Like model for managing post likes
 */

/**
 * Like a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Created like
 */
const likePost = async (postId, userId) => {
  const result = await query(
    `INSERT INTO likes (post_id, user_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (post_id, user_id) DO NOTHING
     RETURNING *`,
    [postId, userId]
  );

  return result.rows[0] || null;
};

/**
 * Unlike a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const unlikePost = async (postId, userId) => {
  const result = await query(
    "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
    [postId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Get all likes for a post
 * @param {number} postId - Post ID
 * @param {number} limit - Number of likes to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of likes with user info
 */
const getPostLikes = async (postId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT 
      l.id,
      l.post_id,
      l.user_id,
      l.created_at,
      u.username,
      u.full_name
     FROM likes l
     JOIN users u ON l.user_id = u.id
     WHERE l.post_id = $1
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return result.rows;
};

/**
 * Get all posts liked by a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of likes to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of liked posts
 */
const getUserLikes = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT 
      l.id as like_id,
      l.created_at as liked_at,
      p.*,
      u.username,
      u.full_name
     FROM likes l
     JOIN posts p ON l.post_id = p.id
     JOIN users u ON p.user_id = u.id
     WHERE l.user_id = $1 AND p.is_deleted = FALSE
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Check if user has liked a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Like status
 */
const hasUserLikedPost = async (postId, userId) => {
  const result = await query(
    "SELECT id FROM likes WHERE post_id = $1 AND user_id = $2",
    [postId, userId]
  );

  return result.rows.length > 0;
};

/**
 * Get like count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<number>} Like count
 */
const getPostLikeCount = async (postId) => {
  const result = await query(
    "SELECT COUNT(*) as count FROM likes WHERE post_id = $1",
    [postId]
  );

  return parseInt(result.rows[0].count);
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
  getPostLikeCount,
};