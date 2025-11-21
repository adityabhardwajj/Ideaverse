import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Database configuration
const dbConfig = {
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  username: process.env.DB_USER || process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  dialect: process.env.DB_DIALECT || "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Support for DATABASE_URL (common in production)
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === "true" ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
  });
} else {
  if (!dbConfig.database || !dbConfig.username || !dbConfig.password) {
    throw new Error(
      "Database configuration is incomplete. Please provide DB_NAME, DB_USER, and DB_PASSWORD, or DATABASE_URL in environment variables"
    );
  }
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool,
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ SQL Database Connected: ${dbConfig.dialect}://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    
    // Import all models to initialize them
    await import("../models/index.js");
    
    // Sync database (set to false in production, use migrations instead)
    // Note: alter: true can cause issues with MySQL index limits, use with caution
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: false }); // Changed to false to avoid index conflicts
    }
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;

