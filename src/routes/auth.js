const express = require("express");
const {
  validateRequest,
  userRegistrationSchema,
  userLoginSchema,
  loginWithEmailSchema,
} = require("../utils/validation");
const {
  register,
  login,
  loginWithEmail,
  getProfile,
  verifyToken,
  logout,
} = require("../controllers/auth");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * Authentication routes
 */

// POST /api/auth/register - Register a new user
router.post("/register", validateRequest(userRegistrationSchema), register);

// POST /api/auth/login - Login user with username
router.post("/login", validateRequest(userLoginSchema), login);

// POST /api/auth/login/email - Login user with email
router.post("/login/email", validateRequest(loginWithEmailSchema), loginWithEmail);

// GET /api/auth/profile - Get current user profile (protected)
router.get("/profile", authenticateToken, getProfile);

// GET /api/auth/verify - Verify token validity
router.get("/verify", authenticateToken, verifyToken);

// POST /api/auth/logout - Logout user (mainly for logging purposes)
router.post("/logout", authenticateToken, logout);

module.exports = router;