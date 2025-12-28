const { query } = require("../utils/database");

/**
 * Comment model for managing post comments
 */

/**
 * Create a comment on a post
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Created comment
 */
const createComment = async ({ post_id, user_id, content }) => {
  // First check if comments are enabled on the post
  const postCheck = await query(
    "SELECT comments_enabled FROM posts WHERE id = $1 AND is_deleted = FALSE",
    [post_id]
  );

  if (!postCheck.rows[0]) {
    throw new Error("Post not found");
  }

  if (!postCheck.rows[0].comments_enabled) {
    throw new Error("Comments are disabled for this post");
  }

  const result = await query(
    `INSERT INTO comments (post_id, user_id, content, created_at, is_deleted)
     VALUES ($1, $2, $3, NOW(), FALSE)
     RETURNING *`,
    [post_id, user_id, content]
  );

  return result.rows[0];
};

/**
 * Update a comment
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for ownership verification)
 * @param {string} content - New content
 * @returns {Promise<Object|null>} Updated comment
 */
const updateComment = async (commentId, userId, content) => {
  const result = await query(
    `UPDATE comments 
     SET content = $1
     WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE
     RETURNING *`,
    [content, commentId, userId]
  );

  return result.rows[0] || null;
};

/**
 * Delete a comment (soft delete)
 * @param {number} commentId - Comment ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deleteComment = async (commentId, userId) => {
  const result = await query(
    "UPDATE comments SET is_deleted = TRUE WHERE id = $1 AND user_id = $2",
    [commentId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Get all comments for a post
 * @param {number} postId - Post ID
 * @param {number} limit - Number of comments to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of comments
 */
const getPostComments = async (postId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT 
      c.*,
      u.username,
      u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = $1 AND c.is_deleted = FALSE
     ORDER BY c.created_at ASC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return result.rows;
};

/**
 * Get comment by ID
 * @param {number} commentId - Comment ID
 * @returns {Promise<Object|null>} Comment object or null
 */
const getCommentById = async (commentId) => {
  const result = await query(
    `SELECT 
      c.*,
      u.username,
      u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.id = $1 AND c.is_deleted = FALSE`,
    [commentId]
  );

  return result.rows[0] || null;
};

/**
 * Get comment count for a post
 * @param {number} postId - Post ID
 * @returns {Promise<number>} Comment count
 */
const getPostCommentCount = async (postId) => {
  const result = await query(
    "SELECT COUNT(*) as count FROM comments WHERE post_id = $1 AND is_deleted = FALSE",
    [postId]
  );

  return parseInt(result.rows[0].count);
};

/**
 * Get all comments by a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of comments to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of comments
 */
const getUserComments = async (userId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT 
      c.*,
      p.content as post_content,
      p.user_id as post_user_id
     FROM comments c
     JOIN posts p ON c.post_id = p.id
     WHERE c.user_id = $1 AND c.is_deleted = FALSE AND p.is_deleted = FALSE
     ORDER BY c.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
  getPostCommentCount,
  getUserComments,
};