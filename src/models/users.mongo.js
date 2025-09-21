

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
        required: true
    },
    createdTimestamp: {
        default: Date.now(),
        type: Date
    }
})

module.exports = mongoose.model('User', userSchema);