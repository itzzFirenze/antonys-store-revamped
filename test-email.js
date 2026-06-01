require('dotenv').config({ path: './api/.env' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test'
}, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
