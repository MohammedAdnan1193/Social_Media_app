const {
  findUsersByName,
  getUserProfile,
  updateUserProfile,
} = require("../models/user");
const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
  isFollowing,
} = require("../models/follow");
const logger = require("../utils/logger");

/**
 * Search users by name or username
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const users = await findUsersByName(q, limit, offset);

    res.json({
      users,
      pagination: {
        page,
        limit,
        hasMore: users.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user profile by ID
 */
const getUserProfileById = async (req, res) => {
  try {
    const { user_id } = req.params;
    const currentUserId = req.user.id;

    const profile = await getUserProfile(parseInt(user_id));

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if current user is following this user
    const following = await isFollowing(currentUserId, parseInt(user_id));

    res.json({
      user: {
        ...profile,
        is_following: following,
      },
    });
  } catch (error) {
    logger.critical("Get user profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update current user's profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, email } = req.validatedData;

    const updatedUser = await updateUserProfile(userId, {
      full_name,
      email,
    });

    if (!updatedUser) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    logger.verbose(`User ${userId} updated profile`);

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    logger.critical("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Follow a user
 */
const follow = async (req, res) => {
  try {
    const { user_id } = req.params;
    const followerId = req.user.id;
    const followingId = parseInt(user_id);

    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const result = await followUser(followerId, followingId);

    if (!result) {
      return res.status(400).json({ error: "Already following this user" });
    }

    logger.verbose(`User ${followerId} followed user ${followingId}`);

    res.status(201).json({
      message: "Successfully followed user",
      follow: result,
    });
  } catch (error) {
    if (error.message === "Users cannot follow themselves") {
      return res.status(400).json({ error: error.message });
    }
    logger.critical("Follow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unfollow a user
 */
const unfollow = async (req, res) => {
  try {
    const { user_id } = req.params;
    const followerId = req.user.id;
    const followingId = parseInt(user_id);

    const success = await unfollowUser(followerId, followingId);

    if (!success) {
      return res.status(404).json({ error: "Follow relationship not found" });
    }

    logger.verbose(`User ${followerId} unfollowed user ${followingId}`);

    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    logger.critical("Unfollow user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that the current user is following
 */
const getMyFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const following = await getFollowing(userId, limit, offset);

    res.json({
      following,
      pagination: {
        page,
        limit,
        hasMore: following.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users following the current user
 */
const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const followers = await getFollowers(userId, limit, offset);

    res.json({
      followers,
      pagination: {
        page,
        limit,
        hasMore: followers.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that a specific user is following
 */
const getUserFollowing = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const following = await getFollowing(parseInt(user_id), limit, offset);

    res.json({
      following,
      pagination: {
        page,
        limit,
        hasMore: following.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users following a specific user
 */
const getUserFollowers = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const followers = await getFollowers(parseInt(user_id), limit, offset);

    res.json({
      followers,
      pagination: {
        page,
        limit,
        hasMore: followers.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get follow stats for a user
 */
const getFollowStats = async (req, res) => {
  try {
    const { user_id } = req.params;

    const stats = await getFollowCounts(parseInt(user_id));

    res.json({ stats });
  } catch (error) {
    logger.critical("Get follow stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
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
};