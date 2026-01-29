const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorMiddleware');

// Route files
const authRoutes = require('./routes/authRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', authRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;