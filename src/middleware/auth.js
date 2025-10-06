const jwt = require('jsonwebtoken');
const User = require('../models/users.mongo');

const authenticateToken = async (req, res, next) => {
    try {
        // Try to get token from multiple sources
        let token = req.cookies?.token || 
                   req.headers.authorization?.replace('Bearer ', '') ||
                   req.headers['x-auth-token'];
        
        console.log('Auth check - Token source:', {
            cookies: !!req.cookies?.token,
            authorization: !!req.headers.authorization,
            xAuthToken: !!req.headers['x-auth-token']
        });
        
        if (!token) {
            console.log('No token found in request');
            return res.status(401).json({ 
                success: false,
                message: 'Access token required' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully for user:', decoded.id);
        
        // Fetch user details
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            console.log('User not found in database for ID:', decoded.id);
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        console.log('User authenticated:', user.username);
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ 
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = { authenticateToken };