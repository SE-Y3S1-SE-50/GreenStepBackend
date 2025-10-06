

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true   
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    badges: [{
        name: String,
        icon: String,
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    achievements: [{
        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Challenge'
        },
        challengeTitle: String,
        completedAt: {
            type: Date,
            default: Date.now
        },
        pointsEarned: Number
    }],
    challengesJoined: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    }],
    completedChallenges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    }],
    statistics: {
        challengesCompleted: {
            type: Number,
            default: 0
        },
        challengesJoined: {
            type: Number,
            default: 0
        },
        challengesCreated: {
            type: Number,
            default: 0
        },
        totalDaysActive: {
            type: Number,
            default: 0
        }
    },
    createdTimestamp: {
        default: Date.now(),
        type: Date
    }
})

module.exports = mongoose.model('User', userSchema);