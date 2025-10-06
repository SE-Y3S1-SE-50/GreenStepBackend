const express = require('express')
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");


const UserRouter = require('./routes/auth/auth.router');
const DashboardRouter = require('./routes/dashboard/dashboard.router');


const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:8081');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use('/api/auth', UserRouter);
app.use('/api/dashboard', DashboardRouter);


// Auth helpers (root)
app.get('/check-cookie', (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ role: decoded.role, id: decoded.id });
  } catch (err) {
    console.error('Error verifying token:', err.message);
    return res
      .status(401)
      .json({ message: 'Unauthorized: Invalid or expired token' });
  }
});


app.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // allow cookies across frontend/backend domains
  });
  res.json({ message: 'Logged out successfully!' });
});

// Auth helpers under /api for frontend consistency
app.get('/api/check-cookie', (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ role: decoded.role, id: decoded.id });
  } catch (err) {
    console.error('Error verifying token:', err.message);
    return res
      .status(401)
      .json({ message: 'Unauthorized: Invalid or expired token' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // allow cookies across frontend/backend domains
  });
  res.json({ message: 'Logged out successfully!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GreenStep API!' });
});


app.use((req, res) => {
  console.warn(`404 Error: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;