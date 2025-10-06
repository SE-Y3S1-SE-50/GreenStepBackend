const { CreateUser } = require('../../models/users.model');
const User = require('../../models/users.mongo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.username);
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('🔐 Missing credentials');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      console.log('🔐 User not found:', username);
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('🔐 Invalid password for:', username);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // 7 days
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log('🔐 Login successful for:', username);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      role: user.role || 'user',
      userId: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (err) {
    console.error('🔐 Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const register = async (req, res) => {
  try {
    console.log('📝 Registration attempt for:', req.body.username);
    
    const { username, password, firstName, lastName, email, phoneNumber } = req.body;

    // Validation
    if (!username || !password || !firstName || !lastName || !email || !phoneNumber) {
      console.log('📝 Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('📝 Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('📝 Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await CreateUser({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      phoneNumber,
    });

    console.log('📝 Registration successful for:', username, 'ID:', userId);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    console.error('📝 Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

module.exports = {
  login,
  register
};