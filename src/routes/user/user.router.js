const express = require('express');
const { 
    getUserProfile, 
    updateProfile, 
    getUserAchievements, 
    getUserStats,
    addAchievement,
    checkAuth
} = require('./user.controller');
const { authenticateToken } = require('../../middleware/auth');

const userRouter = express.Router();

// All user routes require authentication
userRouter.use(authenticateToken);

// User profile routes
userRouter.get('/profile', getUserProfile);
userRouter.put('/profile', updateProfile);

// User achievements and stats
userRouter.get('/achievements', getUserAchievements);
userRouter.get('/stats', getUserStats);
userRouter.post('/achievements', addAchievement);

// Check authentication
userRouter.get('/check-auth', checkAuth);

module.exports = userRouter;