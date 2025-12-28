const {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
  getPostLikeCount,
} = require("../models/like");
const { getPostById } = require("../models/post");
const logger = require("../utils/logger");

/**
 * Like a post
 */
const like = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const post = await getPostById(parseInt(post_id));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if already liked
    const alreadyLiked = await hasUserLikedPost(parseInt(post_id), userId);
    if (alreadyLiked) {
      return res.status(400).json({ error: "Post already liked" });
    }

    const result = await likePost(parseInt(post_id), userId);

    logger.verbose(`User ${userId} liked post ${post_id}`);

    res.status(201).json({
      message: "Post liked successfully",
      like: result,
    });
  } catch (error) {
    logger.critical("Like post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unlike a post
 */
const unlike = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await unlikePost(parseInt(post_id), userId);

    if (!success) {
      return res.status(404).json({ error: "Like not found" });
    }

    logger.verbose(`User ${userId} unliked post ${post_id}`);

    res.json({ message: "Post unliked successfully" });
  } catch (error) {
    logger.critical("Unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all likes for a post
 */
const getLikesForPost = async (req, res) => {
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

    const likes = await getPostLikes(parseInt(post_id), limit, offset);
    const totalLikes = await getPostLikeCount(parseInt(post_id));

    res.json({
      likes,
      total: totalLikes,
      pagination: {
        page,
        limit,
        hasMore: likes.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get post likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all posts liked by current user
 */
const getMyLikedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const likedPosts = await getUserLikes(userId, limit, offset);

    res.json({
      posts: likedPosts,
      pagination: {
        page,
        limit,
        hasMore: likedPosts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all posts liked by a specific user
 */
const getUserLikedPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const likedPosts = await getUserLikes(parseInt(user_id), limit, offset);

    res.json({
      posts: likedPosts,
      pagination: {
        page,
        limit,
        hasMore: likedPosts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Check if current user has liked a post
 */
const checkLikeStatus = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const hasLiked = await hasUserLikedPost(parseInt(post_id), userId);

    res.json({ has_liked: hasLiked });
  } catch (error) {
    logger.critical("Check like status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  like,
  unlike,
  getLikesForPost,
  getMyLikedPosts,
  getUserLikedPosts,
  checkLikeStatus,
};