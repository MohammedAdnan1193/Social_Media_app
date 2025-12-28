const { Pool } = require("pg");
require("dotenv").config();

/**
 * Database setup script
 * This script creates the database tables and seeds initial data
 */

const setupDatabase = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // This will now work correctly
  });

  try {
    console.log("Setting up database...");
    console.log(`Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);

    // Test connection
    await pool.query("SELECT NOW()");
    console.log("Database connection successful!");

    // Read and execute schema file
    const fs = require("fs");
    const path = require("path");

    const schemaPath = path.join(__dirname, "../sql/schema.sql");
    console.log(`Reading schema from: ${schemaPath}`);

    const schemaSQL = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schemaSQL);
    console.log("Database schema created successfully");

    console.log("\n✅ Database setup completed successfully!");
  } catch (error) {
    console.error("\n❌ Database setup failed!");
    console.error("Error details:", error.message);
    
    if (error.code === '28P01') {
      console.error("\n💡 Password authentication failed. Please check:");
      console.error("   1. Your .env file has the correct password");
      console.error("   2. The password is enclosed in quotes if it has special characters");
      console.error('   Example: DB_PASSWORD="Adnan@1193"');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };