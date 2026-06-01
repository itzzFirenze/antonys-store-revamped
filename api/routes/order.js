const express = require('express');
const router = express.Router();
const orderModel = require('../models/orderModel');


// ─── Create a new order ───────────────────────────────────────────────────────
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
      if (!userId || !productId || !address || !phoneNumber || !pincode) {
         return res.status(400).json({ message: 'User ID, Product ID, Address, and Phone Number are required.' });
      }

      const newOrder = await orderModel.create({
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
      });

      res.status(201).json({
         message: 'Order created successfully',
         order: orderModel.toClientShape(newOrder),
      });
   } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Failed to create order' });
   }
});


// ─── Create a manual admin order ────────────────────────────────────────────────
router.post('/admin-create', async (req, res) => {
   const {
      customerName,
      customerEmail,
      address,
      pincode,
      phoneNumber,
      additionalDetails,
      orderItems // Expecting an array of selected products
   } = req.body;

   try {
      if (!orderItems || !orderItems.length || !customerName || !phoneNumber) {
         return res.status(400).json({ message: 'Order items, Customer Name, and Phone Number are required.' });
      }

      // Fetch guest user
      const supabase = require('../supabase');
      const { data: guestUser } = await supabase.from('users').select('id').eq('email', 'guest@antonys.com').single();
      const guestUserId = guestUser?.id;

      if (!guestUserId) {
         return res.status(500).json({ message: 'Guest user not found in database.' });
      }

      // Pack custom details and order items
      const customDetails = JSON.stringify({
         customerName,
         customerEmail,
         additionalDetails: additionalDetails || '',
         orderItems
      });

      const newOrder = await orderModel.create({
         userId: guestUserId,
         productId: orderItems[0].productId,
         size: orderItems[0].size || "",
         address: address || 'Not Provided',
         pincode: pincode || '000000',
         phoneNumber,
         additionalDetails: customDetails,
         wantStitched: orderItems[0].wantStitched || false,
      });

      res.status(201).json({
         message: 'Admin Order created successfully',
         order: orderModel.toClientShape(newOrder),
      });
   } catch (error) {
      console.error('Create admin order error:', error);
      res.status(500).json({ message: 'Failed to create order' });
   }
});


// ─── Get all orders (or filter by userId) ────────────────────────────────────
router.get('/', async (req, res) => {
   try {
      const { userId } = req.query;
      const orders = userId
         ? await orderModel.findByUserId(userId)
         : await orderModel.findAll();

      res.status(200).json({ orders: orders.map(orderModel.toClientShape) });
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch orders' });
   }
});


// ─── Get order by ID ──────────────────────────────────────────────────────────
router.get('/:orderId', async (req, res) => {
   try {
      const order = await orderModel.findById(req.params.orderId);

      if (!order) {
         return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ order: orderModel.toClientShape(order) });
   } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order' });
   }
});


// ─── Delete order ─────────────────────────────────────────────────────────────
router.delete('/:orderId', async (req, res) => {
   try {
      const deleted = await orderModel.deleteById(req.params.orderId);

      if (!deleted) {
         return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ message: 'Order deleted successfully', orderId: req.params.orderId });
   } catch (error) {
      res.status(500).json({ message: 'Failed to delete order' });
   }
});


// ─── Request payment ──────────────────────────────────────────────────────────
router.put('/:orderId/request-payment', async (req, res) => {
   try {
      const order = await orderModel.findById(req.params.orderId);
      if (!order) {
         return res.status(404).json({ message: 'Order not found' });
      }
      if (order.is_req_payment) {
         return res.status(400).json({ message: 'Payment already requested for this order' });
      }

      const updatedOrder = await orderModel.update(req.params.orderId, {
         is_req_payment:       true,
         payment_requested_at: new Date().toISOString(),
      });

      res.json({
         message: 'Payment requested successfully',
         order: orderModel.toClientShape(updatedOrder),
      });
   } catch (error) {
      res.status(500).json({ message: 'Failed to request payment' });
   }
});


// ─── Approve order ────────────────────────────────────────────────────────────
router.put('/:orderId/approve', async (req, res) => {
   try {
      const order = await orderModel.findById(req.params.orderId);

      if (!order) {
         return res.status(404).json({ message: 'Order not found' });
      }
      if (!order.is_pending) {
         return res.status(400).json({ message: 'Order is already approved' });
      }

      const updatedOrder = await orderModel.update(req.params.orderId, {
         is_pending:  false,
         approved_at: new Date().toISOString(),
      });

      res.json({
         message: 'Order approved successfully',
         order: orderModel.toClientShape(updatedOrder),
      });
   } catch (error) {
      res.status(500).json({ message: 'Failed to approve order' });
   }
});


// ─── Complete order ───────────────────────────────────────────────────────────
router.put('/:orderId/complete', async (req, res) => {
   try {
      const order = await orderModel.findById(req.params.orderId);

      if (!order) {
         return res.status(404).json({ message: 'Order not found' });
      }
      if (order.is_completed) {
         return res.status(400).json({ message: 'Order is already completed' });
      }

      const updatedOrder = await orderModel.update(req.params.orderId, { is_completed: true });

      res.json({
         message: 'Order marked as completed successfully',
         order: orderModel.toClientShape(updatedOrder),
      });
   } catch (error) {
      res.status(500).json({ message: 'Failed to complete order' });
   }
});


module.exports = router;