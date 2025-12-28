const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  validateRequest,
  createCommentSchema,
  updateCommentSchema,
} = require("../utils/validation");
const {
  create,
  update,
  remove,
  getCommentsForPost,
  getById,
  getMyComments,
  getUserCommentsById,
} = require("../controllers/comments");

const router = express.Router();

/**
 * Comments routes
 */

// GET /api/comments/my - Get comments by current user
router.get("/my", authenticateToken, getMyComments);

// POST /api/comments/:post_id - Create a comment on a post
router.post(
  "/:post_id",
  authenticateToken,
  validateRequest(createCommentSchema),
  create
);

// GET /api/comments/:comment_id - Get a specific comment
router.get("/:comment_id", optionalAuth, getById);

// PUT /api/comments/:comment_id - Update a comment
router.put(
  "/:comment_id",
  authenticateToken,
  validateRequest(updateCommentSchema),
  update
);

// DELETE /api/comments/:comment_id - Delete a comment
router.delete("/:comment_id", authenticateToken, remove);

// GET /api/comments/post/:post_id - Get all comments for a post
router.get("/post/:post_id", optionalAuth, getCommentsForPost);

// GET /api/comments/user/:user_id - Get comments by a specific user
router.get("/user/:user_id", optionalAuth, getUserCommentsById);

module.exports = router;