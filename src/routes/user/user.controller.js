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
        console.log('Getting profile for user:', req.user.id);
        const userId = req.user.id;
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

        // Ensure achievements and badges are arrays
        const achievements = Array.isArray(user.achievements) ? user.achievements : [];
        const badges = Array.isArray(user.badges) ? user.badges : [];

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
                badges: badges.map(badge => ({
                    name: badge.name || '',
                    icon: badge.icon || '🏆',
                    description: badge.description || '',
                    earnedAt: badge.earnedAt || new Date().toISOString()
                })),
                achievements: achievements.map(achievement => ({
                    challengeTitle: achievement.challengeTitle || '',
                    pointsEarned: achievement.pointsEarned || 0,
                    completedAt: achievement.completedAt || new Date().toISOString(),
                    challengeId: achievement.challengeId
                }))
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
        const userId = req.user.id;
        const { firstName, lastName, email, phoneNumber, profilePicture } = req.body;
        
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (profilePicture) updateData.profilePicture = profilePicture;
        
        const updatedUser = await updateUserProfile(userId, updateData);
        
        if (!updatedUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Failed to update profile' 
            });
        }
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update profile',
            error: error.message 
        });
    }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            achievements: user.achievements || [],
            badges: user.badges || [],
            statistics: user.statistics || {},
            totalPoints: user.totalPoints || 0,
            level: Math.floor((user.totalPoints || 0) / 100) + 1
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch achievements',
            error: error.message 
        });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        // Calculate additional stats
        const level = Math.floor((user.totalPoints || 0) / 100) + 1;
        const pointsToNextLevel = ((level * 100) - (user.totalPoints || 0));
        
        res.json({
            success: true,
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
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch user stats',
            error: error.message 
        });
    }
};

// Add achievement (internal use)
const addAchievement = async (req, res) => {
    try {
        const userId = req.user.id;
        const { challengeId, challengeTitle, pointsEarned } = req.body;
        
        const achievement = {
            challengeId,
            challengeTitle,
            pointsEarned,
            completedAt: new Date()
        };
        
        const updatedUser = await addUserAchievement(userId, achievement);
        
        if (!updatedUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Failed to add achievement' 
            });
        }
        
        res.json({
            success: true,
            message: 'Achievement added successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error adding achievement:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to add achievement',
            error: error.message 
        });
    }
};

// Check authenticated user
const checkAuth = async (req, res) => {
    try {
        console.log('Check auth for user:', req.user.id);
        const user = await getUserById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            authenticated: true,
            user: {
                id: user._id.toString(),
                role: req.user.role || 'user',
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error checking auth:', error);
        res.status(500).json({ 
            success: false,
            message: 'Authentication check failed',
            error: error.message 
        });
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
