const {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
  getPostCommentCount,
  getUserComments,
} = require("../models/comment");
const { getPostById } = require("../models/post");
const logger = require("../utils/logger");

/**
 * Create a comment on a post
 */
const create = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { content } = req.validatedData;
    const userId = req.user.id;

    // Check if post exists
    const post = await getPostById(parseInt(post_id));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await createComment({
      post_id: parseInt(post_id),
      user_id: userId,
      content,
    });

    logger.verbose(`User ${userId} commented on post ${post_id}`);

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    if (error.message === "Comments are disabled for this post") {
      return res.status(403).json({ error: error.message });
    }
    logger.critical("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a comment
 */
const update = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.validatedData;
    const userId = req.user.id;

    const updatedComment = await updateComment(
      parseInt(comment_id),
      userId,
      content
    );

    if (!updatedComment) {
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    logger.verbose(`User ${userId} updated comment ${comment_id}`);

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    logger.critical("Update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a comment
 */
const remove = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const userId = req.user.id;

    const success = await deleteComment(parseInt(comment_id), userId);

    if (!success) {
      return res
        .status(404)
        .json({ error: "Comment not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted comment ${comment_id}`);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.critical("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all comments for a post
 */
const getCommentsForPost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Check if post exists
    const post = await getPostById(parseInt(post_id));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await getPostComments(parseInt(post_id), limit, offset);
    const totalComments = await getPostCommentCount(parseInt(post_id));

    res.json({
      comments,
      total: totalComments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get post comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a specific comment by ID
 */
const getById = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const comment = await getCommentById(parseInt(comment_id));

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ comment });
  } catch (error) {
    logger.critical("Get comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all comments by current user
 */
const getMyComments = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const comments = await getUserComments(userId, limit, offset);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all comments by a specific user
 */
const getUserCommentsById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const comments = await getUserComments(parseInt(user_id), limit, offset);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  update,
  remove,
  getCommentsForPost,
  getById,
  getMyComments,
  getUserCommentsById,
};