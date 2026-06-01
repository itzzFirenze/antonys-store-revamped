const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT;
const contactRoute = require('./routes/contact');
const databaseSeeder = require('./databaseSeeder');
const userRoute = require('./routes/user');
const productRoute = require('./routes/product');
const adminRoute = require('./routes/admin');
const wishlistRoutes = require('./routes/wishlist');
const orderRoute = require('./routes/order');

// Connect to the database
mongoose.connect(process.env.MONGOOSEDB_URL)
   .then(() => console.log("DB connected"))
   .catch((err) => console.error(err));

app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
   },
});

app.use((req, res, next) => {
   req.transporter = transporter;
   next();
});

// Pass the transporter to the contact route
app.use('/api/contact', (req, res, next) => {
   req.transporter = transporter; // Attach the transporter to the request object
   next();
}, contactRoute);

// Database seeder route
app.use('/api/seed', databaseSeeder);

// User routes
app.use('/api/users', userRoute);

// Product routes
app.use('/api/products', productRoute);

// Admin routes
app.use('/api/admin', adminRoute);

// Wishlist routes
app.use('/api/wishlist', wishlistRoutes);

// Register the order route
app.use('/api/orders', orderRoute);

app.listen(PORT, () => {
   console.log(`Server listening on port ${PORT}`);
});