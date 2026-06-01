const express = require('express');
const router = express.Router();
const supabase = require('../supabase');


// ─── Add product to wishlist ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
   const { userId, productId } = req.body;

   if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
   }

   try {
      // Check if already in wishlist
      const { data: existing } = await supabase
         .from('wishlist')
         .select('id')
         .eq('user_id', userId)
         .eq('product_id', productId)
         .maybeSingle();

      if (existing) {
         return res.status(400).json({ message: 'Product already in wishlist' });
      }

      await supabase.from('wishlist').insert({ user_id: userId, product_id: productId });

      // Return the current wishlist product IDs for this user
      const { data: wishlistRows, error } = await supabase
         .from('wishlist')
         .select('product_id')
         .eq('user_id', userId);

      if (error) throw error;

      const wishlist = wishlistRows.map(r => r.product_id);
      res.status(200).json({ message: 'Product added to wishlist', wishlist });
   } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});


// ─── Fetch user's wishlist ────────────────────────────────────────────────────
router.get('/', async (req, res) => {
   const userId = req.query.userId;

   if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
   }

   try {
      const { data, error } = await supabase
         .from('wishlist')
         .select('product_id')
         .eq('user_id', userId);

      if (error) throw error;

      const wishlist = data.map(r => r.product_id);
      res.status(200).json({ wishlist });
   } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});


// ─── Remove product from wishlist ─────────────────────────────────────────────
router.delete('/:productId', async (req, res) => {
   const { userId } = req.body;
   const { productId } = req.params;

   if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
   }

   try {
      const { data: existing } = await supabase
         .from('wishlist')
         .select('id')
         .eq('user_id', userId)
         .eq('product_id', productId)
         .maybeSingle();

      if (!existing) {
         return res.status(400).json({ message: 'Product not found in wishlist' });
      }

      await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId);

      // Return updated wishlist
      const { data: wishlistRows, error } = await supabase
         .from('wishlist')
         .select('product_id')
         .eq('user_id', userId);

      if (error) throw error;

      const wishlist = wishlistRows.map(r => r.product_id);
      res.status(200).json({ message: 'Product removed from wishlist', wishlist });
   } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
   }
});


module.exports = router;