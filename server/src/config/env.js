const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/ecommerce',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

for (const varName of requiredVars) {
  if (!env[varName]) {
    console.error(`FATAL: Environment variable ${varName} is not set.`);
    process.exit(1);
  }
}

module.exports = env;
