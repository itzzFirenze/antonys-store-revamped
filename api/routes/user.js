const express = require('express');
const userRoute = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const Verification = require('../models/verificationSchema');
const generateToken = require('../tokenGenerate');
const protect = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');


// User login
userRoute.post('/login', asyncHandler(async (req, res) => {
   try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
         return res.status(401).json({ message: "Invalid email or password" });
      }

      const isPasswordValid = await user.matchPassword(password);

      if (!isPasswordValid) {
         return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token with user data
      const token = generateToken(user);

      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
         isAdmin: user.isAdmin,
         token,
         mobNum: user.mobNum,
         address: user.address,
         pincode: user.pincode,
         createdAt: user.createdAt
      });
   } catch (error) {
      console.error('Login error:', {
         message: error.message,
         stack: error.stack
      });
      res.status(500).json({
         message: "An error occurred during login",
         error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
   }
}));


// Logout route to invalidate refresh token
userRoute.post('/logout', protect, async (req, res) => {
   const user = await User.findById(req.user._id);
   user.refreshToken = null;
   await user.save();

   res.json({ message: 'Logged out successfully' });
});


// Check if email exists
userRoute.post("/check-email", asyncHandler(async (req, res) => {

   const { email } = req.body;

   if (!email) {
      return res.status(400).json({ message: "Email is required" });
   }

   const existUser = await User.findOne({ email });
   if (existUser) {
      return res.status(400).json({ message: "Email is already registered" });
   }

   // Email doesn't exist
   res.status(200).json({ message: "Email is available" });
}));


// Send verification code
userRoute.post('/send-verification-code', async (req, res) => {
   try {
      const { email } = req.body;

      // Email validation
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ message: 'Please enter a valid email address.' });
      }

      // Check if email exists in User model
      const existUser = await User.findOne({ email });
      if (existUser) {
         return res.status(400).json({ message: 'Email is already registered' });
      }

      // Generate verification code
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Create or update verification record
      try {
         await Verification.findOneAndUpdate(
            { email },
            {
               email,
               code: verificationCode,
               expiresAt: Date.now() + 600000 // 10 min expiry
            },
            { upsert: true, new: true }
         );
      } catch (dbError) {
         return res.status(500).json({
            success: false,
            message: 'Database error occurred',
            error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
         });
      }

      // Setup email transporter
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
         },
      });

      const mailOptions = {
         from: `"${process.env.APP_NAME || 'Antony`s Boutique'}" <${process.env.EMAIL_USER}>`,
         to: email,
         subject: 'Verify Your Account',
         html: `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
             <h2 style="color: #5a287d;">Complete Your Registration</h2>
             <p>Thanks for signing up! To complete your registration, please use the verification code below:</p>
             <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
               <h3 style="font-size: 24px; letter-spacing: 5px; margin: 0;">${verificationCode}</h3>
             </div>
             <p>This code will expire in 10 minutes.</p>
             <p>If you didn't request this code, you can safely ignore this email.</p>
             <p style="margin-top: 30px; font-size: 12px; color: #666;">
               This is an automated message from ${process.env.APP_NAME || 'Antony`s Boutique'}. Please do not reply to this email.
             </p>
           </div>
         `,
         text: `Complete Your Registration
         
       Thanks for signing up! To complete your registration, please use this verification code: ${verificationCode}
       
       This code will expire in 10 minutes.
       
       If you didn't request this code, you can safely ignore this email.
       
       This is an automated message from ${process.env.APP_NAME || 'Your App'}. Please do not reply to this email.`
      };

      try {
         await transporter.sendMail(mailOptions);
      } catch (emailError) {
         return res.status(500).json({
            success: false,
            message: 'Email sending failed',
            error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
         });
      }

      res.status(200).json({
         success: true,
         message: 'Verification code sent successfully'
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'An error occurred while sending verification code.',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
   }
});

// Verify code and register user
userRoute.post('/verify-code', async (req, res) => {
   try {
      const { email, code, name, password } = req.body;

      // Find the verification record
      const verification = await Verification.findOne({
         email,
         code,
         expiresAt: { $gt: Date.now() }
      });

      if (!verification) {
         return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      // Create the new user
      const user = await User.create({
         name,
         email,
         password
      });

      if (!user) {
         return res.status(400).json({ message: 'Failed to create user account' });
      }

      // Delete the verification record
      await Verification.deleteOne({ _id: verification._id });

      // Generate token and send user info
      const token = generateToken(user);

      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         isAdmin: user.isAdmin,
         token,
         createdAt: user.createdAt
      });

   } catch (error) {
      console.error('Error verifying code:', error);
      res.status(500).json({
         success: false,
         message: 'An error occurred while verifying the code.',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
   }
});


//register route
userRoute.post("/", asyncHandler(async (req, res) => {
   const { name, email, password } = req.body;

   const existUser = await User.findOne({ email });
   if (existUser) {
      return res.status(400).json({ message: "Email is already registered" });
   }

   const user = await User.create({
      name,
      email,
      password,
   });

   if (user) {
      const token = generateToken(user);

      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         isAdmin: user.isAdmin,
         token,
         createdAt: user.createdAt
      });
   } else {
      res.status(400);
      throw new Error("Invalid user data");
   }
}));


//get auth profile data
userRoute.put("/profile", protect, asyncHandler(async (req, res) => {
   const user = await User.findById(req.user._id);
   if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobNum = req.body.mobNum || user.mobNum;
      user.address = req.body.address || user.address;
      user.pincode = req.body.pincode || user.pincode;

      if (req.body.password) {
         user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const token = generateToken(updatedUser);

      res.json({
         _id: updatedUser._id,
         name: updatedUser.name,
         email: updatedUser.email,
         mobNum: updatedUser.mobNum,
         address: updatedUser.address,
         pincode: updatedUser.pincode,
         isAdmin: updatedUser.isAdmin,
         token,
         createdAt: updatedUser.createdAt
      });
   } else {
      res.status(404);
      throw new Error("User not found");
   }
}));


// Forgot password
userRoute.post('/forgot-password', async (req, res) => {
   try {
      const { email } = req.body;

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ message: 'Please enter a valid email address.' });
      }

      const user = await User.findOne({ email });
      if (!user) {
         return res.status(404).json({ message: 'Email does not exist in our records.' });
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetCode = resetCode;
      user.resetCodeExpires = Date.now() + 900000; // 15 min expiry
      await user.save();

      const mailOptions = {
         from: process.env.EMAIL_USER,
         to: email,
         subject: 'Password Reset Code',
         html: `
            <h1>Password Reset Request</h1>
            <p>Your password reset code is: <strong>${resetCode}</strong></p>
            <p>This code will expire in 15 minutes.</p>
            <p>If you did not request this reset, please ignore this email.</p>
         `,
      };

      await req.transporter.sendMail(mailOptions);

      res.json({
         success: true,
         message: 'Reset code sent successfully'
      });
   } catch (error) {
      console.error('Detailed forgot-password error:', {
         error: error,
         stack: error.stack,
         transporterExists: !!req.transporter
      });

      res.status(500).json({
         success: false,
         message: 'An error occurred while processing your request.',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
   }
});


// Reset password
userRoute.post('/reset-password', async (req, res) => {
   try {
      const { email, resetCode, newPassword } = req.body;

      const user = await User.findOne({
         email,
         resetCode,
         resetCodeExpires: { $gt: Date.now() }
      });

      if (!user) {
         console.log('Reset failed - Invalid details:', {
            userFound: !!user,
            email,
            codeMatched: user?.resetCode === resetCode,
            codeExpired: user?.resetCodeExpires < Date.now()
         });
         return res.status(400).json({
            message: 'Invalid or expired reset code',
            details: 'Please request a new reset code'
         });
      }

      // Update password
      user.password = newPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();

      res.json({
         success: true,
         message: 'Password reset successful'
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message || 'An error occurred during password reset'
      });
   }
});


// Change password (for logged-in users)
userRoute.put('/change-password', protect, async (req, res) => {
   try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
         return res.status(400).json({
            success: false,
            message: 'Both current and new password are required'
         });
      }

      // Important: Explicitly select password field
      const user = await User.findById(req.user._id).select('+password');

      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'User not found'
         });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
         return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
         });
      }

      // Update password directly
      user.password = newPassword;
      await user.save();

      return res.status(200).json({
         success: true,
         message: 'Password changed successfully'
      });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message || 'An error occurred while changing password'
      });
   }
});


// Get all users (Admin only)
userRoute.get(
   '/',
   protect,
   asyncHandler(async (req, res) => {
      if (!req.user.isAdmin) {
         res.status(403);
         throw new Error("Access denied. Admins only.");
      }

      const users = await User.find({}).select('_id name email createdAt isAdmin');
      res.json(users);
   })
);


// Toggle admin status
userRoute.put(
   '/:id',
   protect,
   asyncHandler(async (req, res) => {
      const user = await User.findById(req.params.id);

      if (!user) {
         res.status(404);
         throw new Error("User not found");
      }

      user.isAdmin = req.body.isAdmin;
      const updatedUser = await user.save();

      res.status(200).json({
         _id: updatedUser._id,
         isAdmin: updatedUser.isAdmin,
      });
   })
);


// Delete User (Admin only)
userRoute.delete('/:id', protect, asyncHandler(async (req, res) => {
   if (!req.user.isAdmin) {
      res.status(403);
      throw new Error("Access denied. Admins only.");
   }

   const user = await User.findById(req.params.id);
   if (!user) {
      res.status(404);
      throw new Error("User not found");
   }

   if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot delete your own account");
   }

   await User.deleteOne({ _id: user._id });
   res.status(200).json({ message: "User deleted successfully" });
}));


module.exports = userRoute;