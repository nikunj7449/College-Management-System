const dotenv = require('dotenv');

// 1. Load env vars BEFORE importing other files
dotenv.config(); 

// 2. Handle Uncaught Exceptions (Sync Errors)
// Put this at the top to catch errors in imports
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(err.stack);
  console.log('Shutting down due to uncaught exception');
  process.exit(1);
});

const connectDB = require('./config/db');
const app = require('./app');

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

// 3. Handle Unhandled Promise Rejections (Async Errors like DB connection failure)
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  console.log('Shutting down server due to unhandled promise rejection');
  server.close(() => process.exit(1));
});