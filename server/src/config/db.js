const { initDB } = require('../db');

const connectDB = async () => {
  try {
    await initDB(process.env.DATABASE_URL);
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error(`PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
