const express = require('express');
const userRoute = express.Router();
const asyncHandler = require('express-async-handler');
const userModel = require('../models/userModel');
const verificationModel = require('../models/verificationModel');
const generateToken = require('../tokenGenerate');
const protect = require('../middleware/auth');


// ─── User login ───────────────────────────────────────────────────────────────
userRoute.post('/login', asyncHandler(async (req, res) => {
   try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email, { includePassword: true });

      if (!user) {
         return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await userModel.matchPassword(password, user.password);

      if (!isPasswordValid) {
         return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken({ _id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin });

      res.json({
         _id:       user.id,
         name:      user.name,
         email:     user.email,
         isAdmin:   user.is_admin,
         token,
         mobNum:    user.mob_num,
         address:   user.address,
         pincode:   user.pincode,
         createdAt: user.created_at,
      });
   } catch (error) {
      console.error('Login error:', { message: error.message, stack: error.stack });
      res.status(500).json({
         message: 'An error occurred during login',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
}));


// ─── Logout ───────────────────────────────────────────────────────────────────
// Supabase is stateless — JWT invalidation is handled client-side.
// This endpoint is kept for API compatibility.
userRoute.post('/logout', protect, async (req, res) => {
   res.json({ message: 'Logged out successfully' });
});


// ─── Check if email exists ────────────────────────────────────────────────────
userRoute.post('/check-email', asyncHandler(async (req, res) => {
   const { email } = req.body;

   if (!email) {
      return res.status(400).json({ message: 'Email is required' });
   }

   const existUser = await userModel.findByEmail(email);
   if (existUser) {
      return res.status(400).json({ message: 'Email is already registered' });
   }

   res.status(200).json({ message: 'Email is available' });
}));


// ─── Send verification code ───────────────────────────────────────────────────
userRoute.post('/send-verification-code', async (req, res) => {
   try {
      const { email } = req.body;

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ message: 'Please enter a valid email address.' });
      }

      const existUser = await userModel.findByEmail(email);
      if (existUser) {
         return res.status(400).json({ message: 'Email is already registered' });
      }

      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

      try {
         await verificationModel.upsert(email, verificationCode, Date.now() + 600000);
      } catch (dbError) {
         return res.status(500).json({
            success: false,
            message: 'Database error occurred',
            error: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
         });
      }

      const mailOptions = {
         from: `"${process.env.APP_NAME || "Antony's Boutique"}" <${process.env.EMAIL_USER}>`,
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
               This is an automated message from ${process.env.APP_NAME || "Antony's Boutique"}. Please do not reply to this email.
             </p>
           </div>
         `,
         text: `Complete Your Registration\n\nThanks for signing up! Your verification code is: ${verificationCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
      };

      try {
         await req.transporter.sendMail(mailOptions);
      } catch (emailError) {
         console.error('Email send error:', emailError);
         return res.status(500).json({
            success: false,
            message: 'Email sending failed',
            error: process.env.NODE_ENV === 'development' ? emailError.message : undefined,
         });
      }

      res.status(200).json({ success: true, message: 'Verification code sent successfully' });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'An error occurred while sending verification code.',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
});


// ─── Verify code and register user ───────────────────────────────────────────
userRoute.post('/verify-code', async (req, res) => {
   try {
      const { email, code, name, password } = req.body;

      const verification = await verificationModel.findValid(email, code);

      if (!verification) {
         return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      const user = await userModel.create({ name, email, password });

      if (!user) {
         return res.status(400).json({ message: 'Failed to create user account' });
      }

      await verificationModel.deleteById(verification.id);

      const token = generateToken({ _id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin });

      res.status(201).json({
         _id:       user.id,
         name:      user.name,
         email:     user.email,
         isAdmin:   user.is_admin,
         token,
         createdAt: user.created_at,
      });
   } catch (error) {
      console.error('Error verifying code:', error);
      res.status(500).json({
         success: false,
         message: 'An error occurred while verifying the code.',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
});


// ─── Register (direct, without verification) ──────────────────────────────────
userRoute.post('/', asyncHandler(async (req, res) => {
   const { name, email, password } = req.body;

   const existUser = await userModel.findByEmail(email);
   if (existUser) {
      return res.status(400).json({ message: 'Email is already registered' });
   }

   const user = await userModel.create({ name, email, password });

   if (user) {
      const token = generateToken({ _id: user.id, name: user.name, email: user.email, isAdmin: user.is_admin });

      res.status(201).json({
         _id:       user.id,
         name:      user.name,
         email:     user.email,
         isAdmin:   user.is_admin,
         token,
         createdAt: user.created_at,
      });
   } else {
      res.status(400);
      throw new Error('Invalid user data');
   }
}));


// ─── Update profile ───────────────────────────────────────────────────────────
userRoute.put('/profile', protect, asyncHandler(async (req, res) => {
   const user = await userModel.findById(req.user._id);
   if (!user) {
      res.status(404);
      throw new Error('User not found');
   }

   const updates = {};
   if (req.body.name)     updates.name     = req.body.name;
   if (req.body.email)    updates.email    = req.body.email;
   if (req.body.mobNum)   updates.mobNum   = req.body.mobNum;
   if (req.body.address)  updates.address  = req.body.address;
   if (req.body.pincode)  updates.pincode  = req.body.pincode;
   if (req.body.password) updates.password = req.body.password;

   const updatedUser = await userModel.update(req.user._id, updates);
   const token = generateToken({
      _id:     updatedUser.id,
      name:    updatedUser.name,
      email:   updatedUser.email,
      isAdmin: updatedUser.is_admin,
   });

   res.json({
      _id:       updatedUser.id,
      name:      updatedUser.name,
      email:     updatedUser.email,
      mobNum:    updatedUser.mob_num,
      address:   updatedUser.address,
      pincode:   updatedUser.pincode,
      isAdmin:   updatedUser.is_admin,
      token,
      createdAt: updatedUser.created_at,
   });
}));


// ─── Forgot password ──────────────────────────────────────────────────────────
userRoute.post('/forgot-password', async (req, res) => {
   try {
      const { email } = req.body;

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ message: 'Please enter a valid email address.' });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
         return res.status(404).json({ message: 'Email does not exist in our records.' });
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetCodeExpires = new Date(Date.now() + 900000).toISOString(); // 15 min

      await userModel.update(user.id, {
         reset_code:         resetCode,
         reset_code_expires: resetCodeExpires,
      });

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

      res.json({ success: true, message: 'Reset code sent successfully' });
   } catch (error) {
      console.error('Detailed forgot-password error:', { error, stack: error.stack });
      res.status(500).json({
         success: false,
         message: 'An error occurred while processing your request.',
         error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
});


// ─── Reset password ───────────────────────────────────────────────────────────
userRoute.post('/reset-password', async (req, res) => {
   try {
      const { email, resetCode, newPassword } = req.body;

      const user = await userModel.findByResetCode(email, resetCode);

      if (!user) {
         return res.status(400).json({
            message: 'Invalid or expired reset code',
            details: 'Please request a new reset code',
         });
      }

      await userModel.update(user.id, {
         password:           newPassword,
         reset_code:         null,
         reset_code_expires: null,
      });

      res.json({ success: true, message: 'Password reset successful' });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: error.message || 'An error occurred during password reset',
      });
   }
});


// ─── Change password (logged-in) ──────────────────────────────────────────────
userRoute.put('/change-password', protect, async (req, res) => {
   try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
         return res.status(400).json({
            success: false,
            message: 'Both current and new password are required',
         });
      }

      const user = await userModel.findById(req.user._id, { includePassword: true });

      if (!user) {
         return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await userModel.matchPassword(currentPassword, user.password);

      if (!isMatch) {
         return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      await userModel.update(user.id, { password: newPassword });

      return res.status(200).json({ success: true, message: 'Password changed successfully' });
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: error.message || 'An error occurred while changing password',
      });
   }
});


// ─── Get all users (Admin only) ───────────────────────────────────────────────
userRoute.get('/', protect, asyncHandler(async (req, res) => {
   if (!req.user.isAdmin) {
      res.status(403);
      throw new Error('Access denied. Admins only.');
   }

   const users = await userModel.findAll();
   // Map to camelCase for frontend
   res.json(users.map(u => ({
      _id:       u.id,
      name:      u.name,
      email:     u.email,
      isAdmin:   u.is_admin,
      createdAt: u.created_at,
   })));
}));


// ─── Toggle admin status ──────────────────────────────────────────────────────
userRoute.put('/:id', protect, asyncHandler(async (req, res) => {
   if (!req.user.isAdmin) {
      res.status(403);
      throw new Error('Access denied. Admins only.');
   }
   
   const user = await userModel.findById(req.params.id);

   if (!user) {
      res.status(404);
      throw new Error('User not found');
   }

   const updatedUser = await userModel.update(req.params.id, { is_admin: req.body.isAdmin });

   res.status(200).json({
      _id:     updatedUser.id,
      isAdmin: updatedUser.is_admin,
   });
}));


// ─── Delete user (Admin only) ─────────────────────────────────────────────────
userRoute.delete('/:id', protect, asyncHandler(async (req, res) => {
   if (!req.user.isAdmin) {
      res.status(403);
      throw new Error('Access denied. Admins only.');
   }

   const user = await userModel.findById(req.params.id);
   if (!user) {
      res.status(404);
      throw new Error('User not found');
   }

   if (user.id === req.user._id) {
      res.status(400);
      throw new Error('You cannot delete your own account');
   }

   await userModel.deleteById(req.params.id);
   res.status(200).json({ message: 'User deleted successfully' });
}));


module.exports = userRoute;