/**
 * Logging utility with different verbosity levels and colors
 */

const LOG_LEVELS = {
  VERBOSE: "verbose",
  CRITICAL: "critical",
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
};

// ANSI color codes for terminal output
const COLORS = {
  RESET: "\x1b[0m",
  BRIGHT: "\x1b[1m",
  DIM: "\x1b[2m",
  RED: "\x1b[31m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  WHITE: "\x1b[37m",
};

const currentLogLevel = process.env.LOG_LEVEL || LOG_LEVELS.VERBOSE;
const enableColors = process.env.LOG_COLORS !== "false";

/**
 * Format timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Colorize text if colors are enabled
 * @param {string} text - Text to colorize
 * @param {string} color - Color code
 * @returns {string} Colorized text
 */
const colorize = (text, color) => {
  if (!enableColors) return text;
  return `${color}${text}${COLORS.RESET}`;
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} color - Color for the level
 * @param {...any} args - Arguments to log
 * @returns {string} Formatted message
 */
const formatMessage = (level, color, ...args) => {
  const timestamp = colorize(getTimestamp(), COLORS.DIM);
  const levelTag = colorize(`[${level}]`, color);
  return `${levelTag} ${timestamp}`;
};

/**
 * Log verbose messages (debug, info, etc.)
 * @param {...any} args - Arguments to log
 */
const verbose = (...args) => {
  if (currentLogLevel === LOG_LEVELS.VERBOSE) {
    console.log(formatMessage("VERBOSE", COLORS.CYAN), ...args);
  }
};

/**
 * Log info messages
 * @param {...any} args - Arguments to log
 */
const info = (...args) => {
  if (
    currentLogLevel === LOG_LEVELS.VERBOSE ||
    currentLogLevel === LOG_LEVELS.INFO
  ) {
    console.log(formatMessage("INFO", COLORS.BLUE), ...args);
  }
};

/**
 * Log warning messages
 * @param {...any} args - Arguments to log
 */
const warning = (...args) => {
  console.warn(formatMessage("WARNING", COLORS.YELLOW), ...args);
};

/**
 * Log error messages
 * @param {...any} args - Arguments to log
 */
const error = (...args) => {
  console.error(formatMessage("ERROR", COLORS.RED), ...args);
};

/**
 * Log critical messages (errors, warnings, etc.)
 * @param {...any} args - Arguments to log
 */
const critical = (...args) => {
  console.error(
    formatMessage("CRITICAL", COLORS.BRIGHT + COLORS.RED),
    ...args
  );
};

/**
 * Log HTTP request
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {number} statusCode - Response status code
 * @param {number} duration - Request duration in ms
 */
const httpLog = (method, url, statusCode, duration) => {
  const methodColor =
    method === "GET"
      ? COLORS.GREEN
      : method === "POST"
      ? COLORS.BLUE
      : method === "PUT"
      ? COLORS.YELLOW
      : method === "DELETE"
      ? COLORS.RED
      : COLORS.WHITE;

  const statusColor =
    statusCode < 300
      ? COLORS.GREEN
      : statusCode < 400
      ? COLORS.CYAN
      : statusCode < 500
      ? COLORS.YELLOW
      : COLORS.RED;

  const methodStr = colorize(method.padEnd(7), methodColor);
  const statusStr = colorize(statusCode.toString(), statusColor);
  const durationStr = colorize(`${duration}ms`, COLORS.DIM);

  console.log(
    formatMessage("HTTP", COLORS.MAGENTA),
    methodStr,
    url,
    statusStr,
    durationStr
  );
};

module.exports = {
  verbose,
  info,
  warning,
  error,
  critical,
  httpLog,
  LOG_LEVELS,
};