import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path';
import pool from './config/db.js';
import authRoutes from './routes/auth.route.js'
import doctorRoutes from './routes/doctor.route.js'
import patientRoutes from './routes/patient.route.js'
import appointmentRoutes from './routes/appointment.route.js'
import departmentroutes from './routes/department.route.js'
import dashboardRoutes from './routes/dashboard.route.js'
import medicalRecordsRoutes from './routes/medicalRecord.route.js'
import userRoutes from './routes/user.route.js'
import notificationRoutes from './routes/notifications.route.js'

dotenv.config();
const app = express()

// Log environment variables (safely)
console.log('=== ENVIRONMENT CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('DB_HOST:', process.env.DB_HOST ? '✓ set' : '✗ NOT SET');
console.log('DB_USER:', process.env.DB_USER ? '✓ set' : '✗ NOT SET');
console.log('DB_PASS:', process.env.DB_PASS ? '✓ set' : '✗ NOT SET');
console.log('DB_NAME:', process.env.DB_NAME ? '✓ set' : '✗ NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ set' : '✗ NOT SET');
console.log('======================');

// Basic middleware
app.use(express.json());

// CORS configuration - FIXED
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://hospital-management-system-46dx.onrender.com',
      'https://www.hospital-management-system-46dx.onrender.com'
    ]
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/departments', departmentroutes)
app.use('/dashboard', dashboardRoutes)
app.use('/api/medical-records', medicalRecordsRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

const PORT = process.env.PORT || 10000;

// Test database connection before starting server
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
    
    // Start server only after DB connection is confirmed
    app.listen(PORT, () => {
      console.log(`✅ Server is running on PORT ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Allowed origins:`, allowedOrigins);
    });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Full error:', err);
    console.error('Cannot start server without database connection');
    process.exit(1);
  });