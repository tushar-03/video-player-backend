// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your JWT secret key
        const user = await User.findOne({ _id: decoded.id });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate.' });
    }
};

module.exports = authenticate;
