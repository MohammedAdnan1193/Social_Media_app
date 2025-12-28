const {
  createUser,
  getUserByUsername,
  getUserByEmail,
  verifyPassword,
  getUserProfile,
} = require("../models/user");
const { generateToken } = require("../utils/jwt");
const logger = require("../utils/logger");

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.validatedData;

    // Check if username already exists
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Create user
    const user = await createUser({ username, email, password, full_name });

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    logger.verbose(`New user registered: ${username}`);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    logger.critical("Registration error:", error);
    
    // Handle unique constraint violations from database
    if (error.code === '23505') { // PostgreSQL unique violation code
      if (error.constraint === 'users_username_key') {
        return res.status(409).json({ error: "Username already exists" });
      }
      if (error.constraint === 'users_email_key') {
        return res.status(409).json({ error: "Email already exists" });
      }
    }
    
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.validatedData;

    // Find user by username
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    logger.verbose(`User logged in: ${username}`);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    logger.critical("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Login with email (alternative login method)
 */
const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    logger.verbose(`User logged in with email: ${email}`);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    logger.critical("Login with email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user profile (with stats)
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get full profile with stats (followers, following, posts)
    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: profile,
    });
  } catch (error) {
    logger.critical("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Verify token and get user info (useful for frontend to check if token is valid)
 */
const verifyToken = async (req, res) => {
  try {
    // If we reach here, the auth middleware has already verified the token
    const user = req.user;

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    logger.critical("Verify token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Logout (client-side should delete token, this is just for logging)
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    logger.verbose(`User ${userId} logged out`);

    res.json({
      message: "Logout successful",
    });
  } catch (error) {
    logger.critical("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  loginWithEmail,
  getProfile,
  verifyToken,
  logout,
};