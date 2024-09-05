// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: { type: String }, // URL of the profile picture
    videos: [{ // Array to store video data
        title: String,
        description: String,
        videoUrl: String
    }]
});

module.exports = mongoose.model('User', userSchema);