const { query } = require("../utils/database");

/**
 * Follow model for managing user relationships
 */

/**
 * Follow a user
 * @param {number} followerId - ID of user who is following
 * @param {number} followingId - ID of user being followed
 * @returns {Promise<Object>} Created follow relationship
 */
const followUser = async (followerId, followingId) => {
  // Prevent self-follow
  if (followerId === followingId) {
    throw new Error("Users cannot follow themselves");
  }

  const result = await query(
    `INSERT INTO follows (follower_id, following_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (follower_id, following_id) DO NOTHING
     RETURNING *`,
    [followerId, followingId]
  );

  return result.rows[0] || null;
};

/**
 * Unfollow a user
 * @param {number} followerId - ID of user who is unfollowing
 * @param {number} followingId - ID of user being unfollowed
 * @returns {Promise<boolean>} Success status
 */
const unfollowUser = async (followerId, followingId) => {
  const result = await query(
    "DELETE FROM follows WHERE follower_id = $1 AND following_id = $2",
    [followerId, followingId]
  );

  return result.rowCount > 0;
};

/**
 * Get list of users that a user is following
 * @param {number} userId - User ID
 * @param {number} limit - Number of results to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of users
 */
const getFollowing = async (userId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT 
      f.id as follow_id,
      f.created_at as followed_at,
      u.id,
      u.username,
      u.email,
      u.full_name
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1 AND u.is_deleted = FALSE
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get list of users following a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of results to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of users
 */
const getFollowers = async (userId, limit = 50, offset = 0) => {
  const result = await query(
    `SELECT 
      f.id as follow_id,
      f.created_at as followed_at,
      u.id,
      u.username,
      u.email,
      u.full_name
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1 AND u.is_deleted = FALSE
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
};

/**
 * Get follower and following counts for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Follower and following counts
 */
const getFollowCounts = async (userId) => {
  const result = await query(
    `SELECT 
      (SELECT COUNT(*) FROM follows WHERE following_id = $1) as follower_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count`,
    [userId]
  );

  return result.rows[0];
};

/**
 * Check if user is following another user
 * @param {number} followerId - ID of user who might be following
 * @param {number} followingId - ID of user who might be followed
 * @returns {Promise<boolean>} Follow status
 */
const isFollowing = async (followerId, followingId) => {
  const result = await query(
    "SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2",
    [followerId, followingId]
  );

  return result.rows.length > 0;
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
  isFollowing,
};