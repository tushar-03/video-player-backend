// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../mailer');

// Generate password from firstName, lastName, and phoneNumber
const generatePassword = (firstName, lastName, phoneNumber) => {
    const firstPart = firstName.slice(0, 2).toLowerCase();
    const lastPart = lastName.slice(-2).toLowerCase();
    const middleDigits = phoneNumber.slice(3, 6);
    return `${firstPart}${lastPart}${middleDigits}`;
};

// Register and log in user
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate password
        const password = generatePassword(firstName, lastName, phoneNumber);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save new user
        user = new User({ firstName, lastName, email, phoneNumber, password: hashedPassword });
        await user.save();

        // Send confirmation email
        const emailSubject = 'Thanks for creating an account with us!';
        const emailText = `Hi ${firstName} ${lastName},

Thank you for creating an account with us!

Name: ${firstName} ${lastName}
Phone Number: ${phoneNumber}
Password: ${password}

Best regards,
Your Company`;
        sendEmail(email, emailSubject, emailText);

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registered and logged in successfully',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePic: user.profilePic,
                videos: user.videos // Include videos
            },
            token,
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    const { firstName, password } = req.body;

    if (!firstName || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user exists
        const user = await User.findOne({ firstName });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Login successful',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profilePic: user.profilePic,
                videos: user.videos
            },
            token,
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
