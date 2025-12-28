const { query } = require("../utils/database");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
const createPost = async ({
  user_id,
  content,
  media_url,
  comments_enabled = true,
}) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, NOW(), FALSE)
     RETURNING id, user_id, content, media_url, comments_enabled, created_at`,
    [user_id, content, media_url, comments_enabled]
  );

  return result.rows[0];
};

/**
 * Get post by ID with like and comment counts
 * @param {number} postId - Post ID
 * @returns {Promise<Object|null>} Post object or null
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT 
      p.*,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = FALSE) as comment_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.is_deleted = FALSE`,
    [postId]
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT 
      p.*,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = FALSE) as comment_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.is_deleted = FALSE
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get feed posts (posts from followed users + own posts)
 * @param {number} userId - User ID
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT 
      p.*,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = FALSE) as comment_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.is_deleted = FALSE
     AND (
       p.user_id = $1
       OR p.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = $1
       )
     )
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Update a post
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated post
 */
const updatePost = async (postId, userId, updates) => {
  const { content, media_url, comments_enabled } = updates;
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (content !== undefined) {
    fields.push(`content = $${paramCount}`);
    values.push(content);
    paramCount++;
  }

  if (media_url !== undefined) {
    fields.push(`media_url = $${paramCount}`);
    values.push(media_url);
    paramCount++;
  }

  if (comments_enabled !== undefined) {
    fields.push(`comments_enabled = $${paramCount}`);
    values.push(comments_enabled);
    paramCount++;
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(postId, userId);

  const result = await query(
    `UPDATE posts 
     SET ${fields.join(", ")}
     WHERE id = $${paramCount} AND user_id = $${paramCount + 1} AND is_deleted = FALSE
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Delete a post (soft delete)
 * @param {number} postId - Post ID
 * @param {number} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} Success status
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = TRUE WHERE id = $1 AND user_id = $2",
    [postId, userId]
  );

  return result.rowCount > 0;
};

/**
 * Search posts by content
 * @param {string} searchTerm - Search term
 * @param {number} limit - Number of posts to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of posts
 */
const searchPosts = async (searchTerm, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT 
      p.*,
      u.username,
      u.full_name,
      (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = FALSE) as comment_count
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE LOWER(p.content) LIKE LOWER($1) AND p.is_deleted = FALSE
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [`%${searchTerm}%`, limit, offset]
  );

  return result.rows;
};

module.exports = {
  createPost,
  getPostById,
  getPostsByUserId,
  getFeedPosts,
  updatePost,
  deletePost,
  searchPosts,
};