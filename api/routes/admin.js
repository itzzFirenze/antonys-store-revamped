const express = require('express');
const adminRoute = express.Router();
const asyncHandler = require('express-async-handler');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order')

// Admin Route to Get All Products
adminRoute.get("/products", asyncHandler(async (req, res) => {
   const products = await Product.find({});
   res.json(products);
}));

// Admin Route to Get a Specific Product
adminRoute.get("/products/:id", asyncHandler(async (req, res) => {
   const product = await Product.findById(req.params.id);
   if (product) {
      res.json(product);
   } else {
      res.status(404);
      throw new Error("Product not found!");
   }
}));

// Admin Route to Add a New Product
adminRoute.post("/products", asyncHandler(async (req, res) => {
   const { name, description, price, stock } = req.body;
   const newProduct = new Product({ name, description, price, stock });

   await newProduct.save();
   res.status(201).json(newProduct);
}));

// Admin Route to Delete a Product
adminRoute.delete("/products/:id", asyncHandler(async (req, res) => {
   const product = await Product.findById(req.params.id);
   if (product) {
      await product.remove();
      res.status(200).json({ message: "Product removed" });
   } else {
      res.status(404);
      throw new Error("Product not found!");
   }
}));

adminRoute.get("/dashboard-stats", asyncHandler(async (req, res) => {
   try {
      // Get total users
      const totalUsers = await User.countDocuments();

      // Get incomplete orders
      const activeOrders = await Order.countDocuments({ isCompleted: false, isPending: false});

      // Get total products
      const productsInStock = await Product.countDocuments();

      // Get Orders to approve
      const ordersToApprove = await Order.countDocuments({ isPending: true });;

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