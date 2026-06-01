const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require("../models/user");

const protect = asyncHandler(async (req, res, next) => {
   let token;

   if (req.headers.authorization?.startsWith("Bearer")) {
      try {
         token = req.headers.authorization.split(" ")[1];
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         
         // Change from decoded.id to decoded._id
         req.user = await User.findById(decoded._id).select('-password -resetCode -resetCodeExpires');

         if (!req.user) {
            res.status(401);
            throw new Error("User not found");
         }

         next();
      } catch (error) {
         console.error('Token verification error:', error);
         res.status(401);
         throw new Error("Not authorized, token failed");
      }
   }

   if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
   }
});

module.exports = protect;