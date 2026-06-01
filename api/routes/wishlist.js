const express = require('express');
const router = express.Router();
const User = require('../models/user');


// Add product to wishlist
router.post('/', async (req, res) => {
   const { userId, productId } = req.body;

   if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
   }

   try {
      const user = await User.findById(userId);
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }

      // Check if product is already in wishlist
      if (user.wishlist.includes(productId)) {
         return res.status(400).json({ message: 'Product already in wishlist' });
      }

      user.wishlist.push(productId); // Add product ID to wishlist
      await user.save();

      res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
   } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});


// Fetch user's wishlist
router.get('/', async (req, res) => {
   const userId = req.query.userId;

   if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
   }

   try {
      const user = await User.findById(userId).select('wishlist');
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ wishlist: user.wishlist });
   } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});


// Remove product from wishlist
router.delete('/:productId', async (req, res) => {
   const { userId } = req.body; // User ID passed in the request body
   const { productId } = req.params; // Product ID passed as a URL parameter

   if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
   }

   try {
      const user = await User.findById(userId);
      if (!user) {
         return res.status(404).json({ message: 'User not found' });
      }

      // Check if product is in wishlist
      const productIndex = user.wishlist.indexOf(productId);
      if (productIndex === -1) {
         return res.status(400).json({ message: 'Product not found in wishlist' });
      }

      // Remove product from wishlist
      user.wishlist.splice(productIndex, 1);
      await user.save();

      res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
   } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});


module.exports = router;