const { Pool } = require("pg");
const logger = require("./logger");

let pool;

/**
 * Initialize database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
const initializePool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on("connect", () => {
      logger.verbose("New database connection established");
    });

    pool.on("error", (err) => {
      logger.critical("Unexpected error on idle client", err);
    });

    pool.on("remove", () => {
      logger.verbose("Database connection removed from pool");
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
    
    // Test query
    await client.query("SELECT NOW()");
    
    logger.verbose("Connected to PostgreSQL database");
    logger.verbose(`Database: ${process.env.DB_NAME}`);
    logger.verbose(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    
    client.release();
  } catch (error) {
    logger.critical("Failed to connect to database:", error);
    throw error;
  }
};

/**
 * Execute a database query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params = []) => {
  const dbPool = initializePool();
  const start = Date.now();

  try {
    const result = await dbPool.query(text, params);
    const duration = Date.now() - start;
    
    logger.verbose("Executed query", {
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });
    
    return result;
  } catch (error) {
    logger.critical("Database query error:", {
      error: error.message,
      query: text.substring(0, 100),
      params: params,
    });
    throw error;
  }
};

/**
 * Get a database client for transactions
 * @returns {Promise<Object>} Database client
 */
const getClient = async () => {
  const dbPool = initializePool();
  return await dbPool.connect();
};

/**
 * Execute queries within a transaction
 * @param {Function} callback - Async function that receives client
 * @returns {Promise<any>} Result of callback function
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query("BEGIN");
    logger.verbose("Transaction started");
    
    const result = await callback(client);
    
    await client.query("COMMIT");
    logger.verbose("Transaction committed");
    
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    logger.critical("Transaction rolled back:", error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Close all database connections
 */
const closePool = async () => {
  if (pool) {
    await pool.end();
    logger.verbose("Database connection pool closed");
    pool = null;
  }
};

/**
 * Get pool statistics
 * @returns {Object} Pool statistics
 */
const getPoolStats = () => {
  if (!pool) {
    return null;
  }

  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
};

module.exports = {
  connectDB,
  query,
  getClient,
  transaction,
  closePool,
  getPoolStats,
};