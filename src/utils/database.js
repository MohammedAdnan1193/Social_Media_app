const { Pool } = require("pg");
const logger = require("./logger");

let pool;

/**
 * Initialize database connection pool
 */
const initializePool = () => {
  if (!pool) {
    let config;

    if (process.env.DATABASE_URL) {
      // For Render or other cloud providers
      const connectionString = process.env.DATABASE_URL;
      const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1') || connectionString.includes('::1');

      config = {
        connectionString: connectionString,
        ssl: isLocal ? false : {
          rejectUnauthorized: false, // REQUIRED for Render
        },
      };
    } else {
      // For local development using individual env vars
      config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: false, // Local PostgreSQL typically doesn't require SSL
      };
    }

    pool = new Pool({
      ...config,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on("connect", () => {
      logger.verbose("New database connection established");
    });

    pool.on("error", (err) => {
      logger.critical("Unexpected error on idle client", err);
    });
  }
  return pool;
};

/**
 * Connect to the database and test connection
 */
const connectDB = async () => {
  try {
    const dbPool = initializePool();
    const client = await dbPool.connect();
    await client.query("SELECT NOW()");
    logger.verbose("Connected to PostgreSQL database successfully");
    client.release();
  } catch (error) {
    logger.critical("Failed to connect to database:", error);
    throw error;
  }
};

/**
 * Execute a database query
 */
const query = async (text, params = []) => {
  const dbPool = initializePool();
  const start = Date.now();
  try {
    const result = await dbPool.query(text, params);
    const duration = Date.now() - start;
    logger.verbose(`Executed query in ${duration}ms`);
    return result;
  } catch (error) {
    logger.critical("Database query error:", error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  query,
  initializePool, // Exporting this can be helpful for debugging
};