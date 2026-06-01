const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const userModel = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
   let token;

   if (req.cookies && req.cookies.jwt) {
      try {
         token = req.cookies.jwt;
         const decoded = jwt.verify(token, process.env.JWT_SECRET);

         // Look up user in Supabase; exclude sensitive fields by not including password
         const user = await userModel.findById(decoded._id);

         if (!user) {
            res.status(401);
            throw new Error('User not found');
         }

         // Attach user row (snake_case) to request — routes can access it directly
         // Also attach a convenience isAdmin flag in camelCase
         req.user = {
            ...user,
            _id:     user.id,
            isAdmin: user.is_admin,
         };

         next();
      } catch (error) {
         console.error('Token verification error:', error);
         res.status(401);
         throw new Error('Not authorized, token failed');
      }
   }

   if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
   }
});

module.exports = protect;