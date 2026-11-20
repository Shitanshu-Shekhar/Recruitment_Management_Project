const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');
const app = require('./app');
const seedDemoAccounts = require('./utils/seedDemoAccounts');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  if (process.env.SEED_DEMO_ACCOUNTS === 'true') {
    await seedDemoAccounts();
  }

  const server = app.listen(PORT, () => {
    console.log(`[RMS Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`[RMS API] Health check endpoint: http://localhost:${PORT}/api/health`);
  });

  return server;
};

startServer().catch((error) => {
  console.error(`[RMS Startup Error]: ${error.message}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
  // Keep server running in dev
});
