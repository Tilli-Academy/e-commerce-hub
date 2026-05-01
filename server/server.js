const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const { closeDB } = require('./src/db');

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await closeDB();
      console.log('PostgreSQL connection closed.');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();
