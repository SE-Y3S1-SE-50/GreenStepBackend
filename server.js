const http = require('http')
const app = require('./src/app')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const PORT = process.env.PORT || 8000
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/test'

// Set default JWT secret if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-here-make-it-long-and-random-123456789';
}


const server = http.createServer(app)

mongoose.connection.once('open', () => {
  console.log('MongoDB connection is ready!!');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting with MongoDB:', err);
});

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
    console.log('Database name:', mongoose.connection.db.databaseName);

    // Start listening
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...`);
    });

    // Handle port already in use error
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please kill the process using this port or use a different port.`);
        console.error('To kill the process, run: netstat -ano | findstr :' + PORT);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1); // exit process if DB connection fails
  }
}

startServer();