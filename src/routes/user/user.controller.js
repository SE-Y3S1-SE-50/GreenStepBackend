const { 
    getUserById, 
    updateUserProfile, 
    addUserAchievement, 
    addUserBadge,
    incrementUserStats 
} = require('../../models/users.model');

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        console.log('Getting profile for user:', req.user._id);
        const userId = req.user._id;
        const user = await getUserById(userId);
        
        if (!user) {
            console.log('User not found for ID:', userId);
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        console.log('Found user:', user.username);

        // Calculate user statistics
        const level = Math.floor((user.totalPoints || 0) / 100) + 1;
        const pointsToNextLevel = (level * 100) - (user.totalPoints || 0);

        const responseData = {
            success: true,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePicture: user.profilePicture || '',
                stats: {
                    totalChallengesJoined: user.challengesJoined ? user.challengesJoined.length : (user.statistics?.challengesJoined || 0),
                    totalChallengesCompleted: user.completedChallenges ? user.completedChallenges.length : (user.statistics?.challengesCompleted || 0),
                    totalPoints: user.totalPoints || 0,
                    currentLevel: level,
                    pointsToNextLevel: pointsToNextLevel
                },
                badges: user.badges || [],
                achievements: user.achievements || []
            }
        };

        console.log('Sending profile response:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch user profile',
            error: error.message 
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { firstName, lastName, email, phoneNumber, profilePicture } = req.body;
        
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (profilePicture) updateData.profilePicture = profilePicture;
        
        const updatedUser = await updateUserProfile(userId, updateData);
        
        if (!updatedUser) {
            return res.status(400).json({ message: 'Failed to update profile' });
        }
        
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
            achievements: user.achievements,
            badges: user.badges,
            statistics: user.statistics,
            totalPoints: user.totalPoints,
            level: user.level
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ message: 'Failed to fetch achievements' });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Calculate additional stats
        const level = Math.floor((user.totalPoints || 0) / 100) + 1; // Level up every 100 points
        const pointsToNextLevel = ((level * 100) - (user.totalPoints || 0));
        
        res.json({
            challengesCompleted: user.statistics?.challengesCompleted || 0,
            challengesJoined: user.statistics?.challengesJoined || 0,
            challengesCreated: user.statistics?.challengesCreated || 0,
            totalDaysActive: user.statistics?.totalDaysActive || 0,
            totalPoints: user.totalPoints || 0,
            level: level,
            pointsToNextLevel: pointsToNextLevel,
            badges: (user.badges || []).length,
            achievements: (user.achievements || []).length
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Failed to fetch user stats' });
    }
};

// Add achievement (internal use)
const addAchievement = async (req, res) => {
    try {
        const userId = req.user._id;
        const { challengeId, challengeTitle, pointsEarned } = req.body;
        
        const achievement = {
            challengeId,
            challengeTitle,
            pointsEarned,
            completedAt: new Date()
        };
        
        const updatedUser = await addUserAchievement(userId, achievement);
        
        if (!updatedUser) {
            return res.status(400).json({ message: 'Failed to add achievement' });
        }
        
        res.json(updatedUser);
    } catch (error) {
        console.error('Error adding achievement:', error);
        res.status(500).json({ message: 'Failed to add achievement' });
    }
};

// Check authenticated user
const checkAuth = async (req, res) => {
    try {
        console.log('Check auth for user:', req.user._id);
        res.json({
            id: req.user._id.toString(),
            role: req.user.role || 'user',
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            authenticated: true
        });
    } catch (error) {
        console.error('Error checking auth:', error);
        res.status(500).json({ message: 'Authentication check failed' });
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    getUserAchievements,
    getUserStats,
    addAchievement,
    checkAuth
};