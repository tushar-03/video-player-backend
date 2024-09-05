// src/mailer.js
const nodemailer = require('nodemailer');

// Create a transporter object using Mandrill
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: process.env.MANDRILL_API_KEY, // Mandrill API key
        pass: process.env.MANDRILL_API_SECRET // Mandrill API secret
    }
});

// Function to send an email
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.MANDRILL_FROM_EMAIL, // Sender's email address
        to: to, // Recipient's email address
        subject: subject, // Subject line
        text: text // Plain text body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = sendEmail;
