const express = require('express');
const adminRoute = express.Router();
const asyncHandler = require('express-async-handler');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const supabase = require('../supabase');


// ─── Get all products ─────────────────────────────────────────────────────────
adminRoute.get('/products', asyncHandler(async (req, res) => {
   const products = await productModel.findAll();
   res.json(products.map(productModel.toClientShape));
}));


// ─── Get a specific product ───────────────────────────────────────────────────
adminRoute.get('/products/:id', asyncHandler(async (req, res) => {
   const product = await productModel.findById(req.params.id);
   if (product) {
      res.json(productModel.toClientShape(product));
   } else {
      res.status(404);
      throw new Error('Product not found!');
   }
}));


// ─── Add a new product (admin shortcut — no image upload) ────────────────────
adminRoute.post('/products', asyncHandler(async (req, res) => {
   const { name, brand, price, color, countInStock, category, image, sizes } = req.body;
   const newProduct = await productModel.create({ name, brand, price, color, countInStock, category, image, sizes });
   res.status(201).json(productModel.toClientShape(newProduct));
}));


// ─── Delete a product ─────────────────────────────────────────────────────────
adminRoute.delete('/products/:id', asyncHandler(async (req, res) => {
   const product = await productModel.findById(req.params.id);
   if (product) {
      await productModel.deleteById(req.params.id);
      res.status(200).json({ message: 'Product removed' });
   } else {
      res.status(404);
      throw new Error('Product not found!');
   }
}));


// ─── Dashboard stats ──────────────────────────────────────────────────────────
adminRoute.get('/dashboard-stats', asyncHandler(async (req, res) => {
   try {
      // Count users
      const { count: totalUsers, error: usersErr } = await supabase
         .from('users')
         .select('*', { count: 'exact', head: true });
      if (usersErr) throw usersErr;

      // Active orders: approved but not yet completed
      const activeOrders = await orderModel.countWhere({ is_completed: false, is_pending: false });

      // Products in stock
      const productsInStock = await productModel.countAll();

      // Orders awaiting approval
      const ordersToApprove = await orderModel.countWhere({ is_pending: true });

      res.json({
         totalUsers,
         activeOrders,
         productsInStock,
         ordersToApprove,
      });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
}));


module.exports = adminRoute;