const express = require('express');
const cors = require('cors');
const path = require('path'); // Required to serve uploaded files
const { errorHandler } = require('./middleware/errorMiddleware'); // Ensure folder name matches (middleware vs middlewares)

// 1. Import all Route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const remarkRoutes = require('./routes/remarkRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const courseRoutes = require('./routes/courseRoutes');
const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// 2. Make the 'uploads' folder static
// This allows you to access files via URL like: http://localhost:5000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// 3. Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/faculty', facultyRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/remarks', remarkRoutes);
app.use('/api/v1/performance', performanceRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Error Handler (Must be last)
app.use(errorHandler);

module.exports = app;