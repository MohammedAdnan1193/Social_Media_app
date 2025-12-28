const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  like,
  unlike,
  getLikesForPost,
  getMyLikedPosts,
  getUserLikedPosts,
  checkLikeStatus,
} = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 */

// GET /api/likes/my - Get posts liked by current user
router.get("/my", authenticateToken, getMyLikedPosts);

// POST /api/likes/:post_id - Like a post
router.post("/:post_id", authenticateToken, like);

// DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id", authenticateToken, unlike);

// GET /api/likes/:post_id - Get all likes for a post
router.get("/:post_id", optionalAuth, getLikesForPost);

// GET /api/likes/:post_id/status - Check if current user liked a post
router.get("/:post_id/status", authenticateToken, checkLikeStatus);

// GET /api/likes/user/:user_id - Get posts liked by a specific user
router.get("/user/:user_id", optionalAuth, getUserLikedPosts);

module.exports = router;