const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

router.post('/send', async (req, res) => {
    const { orderId, userId, type, message, channels } = req.body;

    try {
        // Get user details
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const notifications = [];

        // Send email if requested
        if (channels.includes('email') && user.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `Order ${orderId} Update`,
                text: message
            });
            notifications.push('email');
        }

        // Send WhatsApp if requested
        if (channels.includes('whatsapp') && user.phoneNumber) {
            await twilioClient.messages.create({
                body: message,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${user.phoneNumber}`
            });
            notifications.push('whatsapp');
        }

        res.json({ 
            message: "Notifications sent successfully", 
            sentTo: notifications 
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to send notifications" });
    }
});

module.exports = router;