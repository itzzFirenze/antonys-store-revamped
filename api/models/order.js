const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
   orderId: { type: String },
   userId: { type: String, required: true },
   productId: { type: String, required: true },
   size: { type: String },
   isPending: { type: Boolean, default: true },
   isCompleted: { type: Boolean, default: false },
   isReqPayment: { type: Boolean, default: false },
   address: { type: String, required: true },
   pincode: { type: Number, required: true },
   phoneNumber: { type: String, required: true },
   additionalDetails: { type: String, default: '' },
   wantStitched: { type: Boolean, default: false },

   // Measurement fields
   length: { type: Number },
   chest: { type: Number },
   waist: { type: Number },
   hip: { type: Number },
   armFit: { type: Number },
   sleeveLength: { type: Number },
   sleeveWidth: { type: Number },
   backNeck: { type: Number },
   frontNeck: { type: Number },
},
   {
      timestamps: true
   });

// Middleware to generate orderId
orderSchema.pre('save', async function (next) {
   if (this.isNew) {
       const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');

       const latestOrder = await this.constructor
           .findOne({ orderId: new RegExp(`^ANTY${currentDate}`) }, { orderId: 1 })
           .sort({ orderId: -1 });

       const latestNumber = latestOrder
           ? parseInt(latestOrder.orderId.slice(12), 10)
           : 0;

       this.orderId = `ANTY${currentDate}${(latestNumber + 1).toString().padStart(4, '0')}`;
   }
   next();
});


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;