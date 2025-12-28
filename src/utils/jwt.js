const jwt = require("jsonwebtoken");
const logger = require("./logger");

/**
 * Generate JWT token for user authentication
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    logger.critical("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT configuration error");
  }

  return jwt.sign(payload, secret, { 
    expiresIn: "24h",
    issuer: "social-media-api",
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      logger.critical("JWT_SECRET is not defined in environment variables");
      throw new Error("JWT configuration error");
    }

    // BUG FIX: Was using 'token' as secret instead of process.env.JWT_SECRET
    return jwt.verify(token, secret, {
      issuer: "social-media-api",
    });
  } catch (error) {
    logger.critical("Token verification failed:", error.message);
    throw new Error("Invalid token");
  }
};

/**
 * Decode token without verification (useful for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.critical("Token decode failed:", error.message);
    return null;
  }
};

/**
 * Generate refresh token with longer expiration
 * @param {Object} payload - User data to encode in token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    logger.critical("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT configuration error");
  }

  return jwt.sign(payload, secret, { 
    expiresIn: "7d",
    issuer: "social-media-api",
  });
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  generateRefreshToken,
};