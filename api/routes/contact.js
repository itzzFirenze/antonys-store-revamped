const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message, mobile } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.RECIPIENT_EMAIL || process.env.EMAIL_USER,
    subject: `Contact Form Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMobile Number: ${mobile}\nMessage: ${message}`,
  };

  try {
    // Access transporter from the request object
    await req.transporter.sendMail(mailOptions);  // Send the email
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

module.exports = router;