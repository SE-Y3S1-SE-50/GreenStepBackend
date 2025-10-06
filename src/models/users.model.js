const User = require("./users.mongo");

const CreateUser = async (user) => {
    try {
        const user1 = await User.create({
            username: user.username,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
        })

        return user1._id
    } catch (error) {
        console.log("error", error)
        throw error; // Re-throw the error so it can be handled by the controller
    }
}

const getUserById = async (userId) => {
    try {
        return await User.findById(userId).select('-password').populate('achievements.challengeId');
    } catch (error) {
        console.log("Error fetching user:", error);
        return null;
    }
}

const updateUserProfile = async (userId, updateData) => {
    try {
        return await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');
    } catch (error) {
        console.log("Error updating user:", error);
        return null;
    }
}

const addUserAchievement = async (userId, achievement) => {
    try {
        return await User.findByIdAndUpdate(
            userId,
            { 
                $push: { achievements: achievement },
                $inc: { 
                    totalPoints: achievement.pointsEarned,
                    'statistics.challengesCompleted': 1
                }
            },
            { new: true }
        ).select('-password');
    } catch (error) {
        console.log("Error adding achievement:", error);
        return null;
    }
}

const addUserBadge = async (userId, badge) => {
    try {
        return await User.findByIdAndUpdate(
            userId,
            { $push: { badges: badge } },
            { new: true }
        ).select('-password');
    } catch (error) {
        console.log("Error adding badge:", error);
        return null;
    }
}

const incrementUserStats = async (userId, statType) => {
    try {
        const updateObj = {};
        updateObj[`statistics.${statType}`] = 1;
        
        return await User.findByIdAndUpdate(
            userId,
            { $inc: updateObj },
            { new: true }
        ).select('-password');
    } catch (error) {
        console.log("Error updating stats:", error);
        return null;
    }
}

module.exports = {
    CreateUser,
    getUserById,
    updateUserProfile,
    addUserAchievement,
    addUserBadge,
    incrementUserStats
}