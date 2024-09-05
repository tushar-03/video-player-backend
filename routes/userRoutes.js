// routes/userRoutes.js

const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware'); // Import the authenticate middleware
const User = require('../models/User'); // Import the User model

// Set up Multer storage
const storage = multer.diskStorage({
    destination: './uploads/', // Destination folder for profile pics
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

// Route to upload profile picture
router.post('/profile/upload-pic', authenticate, upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user's profile picture URL
        user.profilePic = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ message: 'Profile picture updated successfully', profilePic: user.profilePic });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Set up Multer storage for videos
const videoStorage = multer.diskStorage({
    destination: './videos/', // Destination folder for video files
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 300 * 1024 * 1024 }, // Limit file size to 300 MB
});

// Route to upload video
router.post('/profile/upload-video', authenticate, uploadVideo.single('video'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add video metadata
        const video = {
            title: req.body.title,
            description: req.body.description,
            videoUrl: `/videos/${req.file.filename}`,
        };

        // Add video to user’s videos array
        user.videos.push(video);
        await user.save();

        res.json({ message: 'Video uploaded successfully', video });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/videos', async (req, res) => {
    try {
        const users = await User.find({}, 'firstName lastName profilePic videos'); // Select fields to return
        const videos = users.flatMap(user =>
            user.videos.map(video => ({
                ...video,
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profilePic: user.profilePic,
                }
            }))
        );
        res.json(videos);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
