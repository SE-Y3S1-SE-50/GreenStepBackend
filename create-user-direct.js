const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/users.mongo');

async function createUserDirect() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');
    
    // Create a user directly
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = new User({
      username: 'testuser5',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      email: 'test5@example.com',
      phoneNumber: '1234567890'
    });
    
    console.log('Creating user...');
    const savedUser = await user.save();
    console.log('User created successfully:', {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email
    });
    
    // Test login
    console.log('Testing login...');
    const foundUser = await User.findOne({ username: 'testuser5' });
    if (foundUser) {
      const isMatch = await bcrypt.compare('password123', foundUser.password);
      console.log('Password match:', isMatch);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createUserDirect();
