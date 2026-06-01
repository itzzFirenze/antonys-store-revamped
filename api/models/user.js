const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true
      },
      email: {
         type: String,
         required: true,
         unique: true
      },
      mobNum: {
         type: String,
         default: "Not added"
      },
      address: {
         type: String,
         default: "Not added"
      },
      pincode: {
         type: String,
         default: "Not added"
      },
      password: {
         type: String,
         required: true,
         select: false
      },
      isAdmin: {
         type: Boolean,
         default: false
      },
      wishlist: [{
         type: String
      }],
      orders: [{
         type: String
      }],
      resetCode: {
         type: String
      },
      resetCodeExpires: {
         type: Date
      },
   },
   {
      timestamps: true
   }
);

// Password validation
userSchema.methods.matchPassword = async function (enteredPassword) {
   try {
      const isMatch = await bcrypt.compare(enteredPassword, this.password);
      return isMatch;
   } catch (error) {
      console.error('Error in password comparison:', error);
      throw new Error('Error comparing passwords');
   }
};

// Password hashing middleware
userSchema.pre("save", async function (next) {
   try {
      if (!this.isModified('password')) {
         return next();
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
   } catch (error) {
      next(error);
   }
});

module.exports = mongoose.model("User", userSchema);