const Joi = require("joi");

/**
 * Validation schemas for API endpoints
 */

// Auth schemas
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().min(1).max(100).required(),
});

const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const loginWithEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// User schemas
const updateProfileSchema = Joi.object({
  full_name: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
}).min(1); // At least one field must be provided

// Post schemas
const createPostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
  media_url: Joi.string().uri().allow(null, "").optional(),
  comments_enabled: Joi.boolean().default(true),
});

const updatePostSchema = Joi.object({
  content: Joi.string().min(1).max(5000).optional(),
  media_url: Joi.string().uri().allow(null, "").optional(),
  comments_enabled: Joi.boolean().optional(),
}).min(1); // At least one field must be provided

// Comment schemas
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

/**
 * Middleware to validate request body against schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown keys from the validated data
    });

    if (error) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.validatedData = value;
    next();
  };
};

/**
 * Middleware to validate query parameters
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Query validation failed",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.validatedQuery = value;
    next();
  };
};

/**
 * Middleware to validate route parameters
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: "Parameter validation failed",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.validatedParams = value;
    next();
  };
};

module.exports = {
  // Auth schemas
  userRegistrationSchema,
  userLoginSchema,
  loginWithEmailSchema,

  // User schemas
  updateProfileSchema,

  // Post schemas
  createPostSchema,
  updatePostSchema,

  // Comment schemas
  createCommentSchema,
  updateCommentSchema,

  // Validation middleware
  validateRequest,
  validateQuery,
  validateParams,
};