const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// Create a new order
router.post('/', async (req, res) => {
   const {
      userId,
      productId,
      size,
      address,
      pincode,
      phoneNumber,
      additionalDetails,
      wantStitched,
      length,
      chest,
      waist,
      hip,
      armFit,
      sleeveLength,
      sleeveWidth,
      backNeck,
      frontNeck,
   } = req.body;
   try {
      // Validate required fields
      if (!userId || !productId || !address || !phoneNumber || !pincode) {
         return res.status(400).json({ message: "User ID, Product ID, Address, and Phone Number are required." });
      }
      // Create a new order instance
      const newOrder = new Order({
         userId,
         productId,
         size,
         address,
         pincode,
         phoneNumber,
         additionalDetails,
         wantStitched: wantStitched || false,
         length,
         chest,
         waist,
         hip,
         armFit,
         sleeveLength,
         sleeveWidth,
         backNeck,
         frontNeck,
         isPending: true,
      });
      // Save the order to the database
      await newOrder.save();
      res.status(201).json({ message: "Order created successfully", order: newOrder });
   } catch (error) {
      res.status(500).json({ message: "Failed to create order" });
   }
});

module.exports = router;


// Get all orders or a specific order by orderId
router.get('/', async (req, res) => {
   try {
      const { userId } = req.query; // Retrieve userId from query parameters

      // If userId is provided, filter orders by userId
      const orders = userId ? await Order.find({ userId }) : await Order.find();
      res.status(200).json({ orders });
   } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
   }
});


// Get order by orderId
router.get('/:orderId', async (req, res) => {
   try {
      const order = await Order.findById(req.params.orderId)
         .populate('userId', 'name email')
         .populate('productId'); // Get all product fields

      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json({ order });
   } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
   }
});

// Delete an order by orderId
router.delete('/:orderId', async (req, res) => {
   try {
      const orderId = req.params.orderId;

      // Attempt to find and delete the order
      const deletedOrder = await Order.findByIdAndDelete(orderId);

      if (!deletedOrder) {
         return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json({ message: "Order deleted successfully", orderId });
   } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
   }
});


// Request payment for an order
router.put('/:orderId/request-payment', async (req, res) => {
   try {
      const order = await Order.findById(req.params.orderId);
      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }
      if (order.isReqPayment) {
         return res.status(400).json({ message: "Payment already requested for this order" });
      }
      order.isReqPayment = true;
      order.paymentRequestedAt = Date.now();
      const updatedOrder = await order.save();
      res.json({
         message: "Payment requested successfully",
         order: updatedOrder
      });
   } catch (error) {
      res.status(500).json({ message: "Failed to request payment" });
   }
});


// Approve an order
router.put('/:orderId/approve', async (req, res) => {
   try {
      const order = await Order.findById(req.params.orderId);

      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      if (!order.isPending) {
         return res.status(400).json({ message: "Order is already approved" });
      }

      order.isPending = false;
      order.approvedAt = Date.now();

      const updatedOrder = await order.save();

      res.json({
         message: "Order approved successfully",
         order: updatedOrder
      });
   } catch (error) {
      res.status(500).json({ message: "Failed to approve order" });
   }
});


// Mark an order as completed
router.put('/:orderId/complete', async (req, res) => {
   try {
      const order = await Order.findById(req.params.orderId);

      if (!order) {
         return res.status(404).json({ message: "Order not found" });
      }

      if (order.isCompleted) {
         return res.status(400).json({ message: "Order is already completed" });
      }

      order.isCompleted = true;
      const updatedOrder = await order.save();

      res.json({
         message: "Order marked as completed successfully",
         order: updatedOrder
      });
   } catch (error) {
      res.status(500).json({ message: "Failed to complete order" });
   }
});