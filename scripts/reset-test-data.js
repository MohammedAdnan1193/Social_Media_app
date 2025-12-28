const { Pool } = require("pg");
const path = require("path");

// Load .env from root directory
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const resetTestData = async () => {
  // Debug: Check if env vars are loaded
  console.log("=== Environment Check ===");
  console.log(`DB_HOST: ${process.env.DB_HOST || "NOT SET"}`);
  console.log(`DB_PORT: ${process.env.DB_PORT || "NOT SET"}`);
  console.log(`DB_NAME: ${process.env.DB_NAME || "NOT SET"}`);
  console.log(`DB_USER: ${process.env.DB_USER || "NOT SET"}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? "***SET***" : "NOT SET"}`);
  console.log("========================\n");

  if (!process.env.DB_PASSWORD) {
    console.error("❌ DB_PASSWORD not set!");
    console.error("Make sure .env file exists in project root");
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log("Resetting test data...");
    
    // Delete test users and all related data (CASCADE handles relations)
    const result = await pool.query(
      "DELETE FROM users WHERE username IN ($1, $2, $3)",
      ['alice', 'bob', 'charlie']
    );
    
    console.log(`✅ Deleted ${result.rowCount} test users`);
    console.log("✅ Test data reset successfully\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

resetTestData();