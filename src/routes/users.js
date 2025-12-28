const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { validateRequest, updateProfileSchema } = require("../utils/validation");
const {
  searchUsers,
  getUserProfileById,
  updateProfile,
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getUserFollowing,
  getUserFollowers,
  getFollowStats,
} = require("../controllers/users");

const router = express.Router();

/**
 * User-related routes
 */

// GET /api/users/search - Search users by name or username
router.get("/search", authenticateToken, searchUsers);

// GET /api/users/me/following - Get users that current user follows
router.get("/me/following", authenticateToken, getMyFollowing);

// GET /api/users/me/followers - Get users that follow current user
router.get("/me/followers", authenticateToken, getMyFollowers);

// PUT /api/users/me - Update current user's profile
router.put("/me", authenticateToken, validateRequest(updateProfileSchema), updateProfile);

// GET /api/users/:user_id - Get user profile by ID
router.get("/:user_id", authenticateToken, getUserProfileById);

// POST /api/users/:user_id/follow - Follow a user
router.post("/:user_id/follow", authenticateToken, follow);

// DELETE /api/users/:user_id/follow - Unfollow a user
router.delete("/:user_id/follow", authenticateToken, unfollow);

// GET /api/users/:user_id/following - Get users that a specific user follows
router.get("/:user_id/following", optionalAuth, getUserFollowing);

// GET /api/users/:user_id/followers - Get users that follow a specific user
router.get("/:user_id/followers", optionalAuth, getUserFollowers);

// GET /api/users/:user_id/stats - Get follow stats for a user
router.get("/:user_id/stats", optionalAuth, getFollowStats);

module.exports = router;