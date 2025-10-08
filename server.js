const http = require('http')
const app = require('./src/app')
const mongoose = require('mongoose')
const dotenv = require('dotenv')


dotenv.config()

const PORT = process.env.PORT || 8000
const MONGO_URL = process.env.MONGO_URL


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
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Start listening
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1); // exit process if DB connection fails
  }
}

startServer();