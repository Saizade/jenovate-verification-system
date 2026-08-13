const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { sequelize } = require('./models');
const seedAdmin = require('./seeders/adminSeed');
const seedStudents = require('./seeders/studentSeed');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed for origin: ' + origin));
  },
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading uploaded files in UI
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
app.use('/uploads', express.static(uploadDir));

// Import Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const submissionRoutes = require('./routes/submissions');
const verificationRoutes = require('./routes/verification');
const dashboardRoutes = require('./routes/dashboard');
const employeeRoutes = require('./routes/employees');
const notificationRoutes = require('./routes/notifications');
const exportRoutes = require('./routes/export');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy and running.' });
});

// Error handling middleware
app.use(errorHandler);

// Database connection & Server Startup
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // Seed default admin and sample students
    await seedAdmin();
    await seedStudents();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1);
  }
}

startServer();
