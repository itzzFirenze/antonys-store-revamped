const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
   _id: { type: String },
   name: { type: String, required: true },
   brand: { type: String, required: true },
   price: { type: Number, required: true },
   color: { type: String, required: true },
   category: { type: String, required: true },
   countInStock: { type: Number, required: true },
   image: { type: String },
   sizes: {
      S: { type: Number, default: 0 },
      M: { type: Number, default: 0 },
      L: { type: Number, default: 0 },
      XL: { type: Number, default: 0 },
      XXL: { type: Number, default: 0 }
   }
});

// Counter schema to keep track of the last used number
const counterSchema = new mongoose.Schema({
   _id: { type: String, default: 'productCounter' },
   seq: { type: Number, default: 0 }
});

// Create the Counter model
const Counter = mongoose.model('Counter', counterSchema);

// Updated ID generation logic using sequential numbers
productSchema.pre('save', async function(next) {
   if (this.isNew) {
      try {
         // Get and update the counter
         const counter = await Counter.findByIdAndUpdate(
            'productCounter',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
         );

         // Get the first 4 letters of the color and convert to uppercase
         const colorPrefix = this.color.slice(0, 4).toUpperCase();
         
         // Generate new ID: COLOR + 5 digits using the global counter
         this._id = colorPrefix + counter.seq.toString().padStart(5, '0');
         
         next();
      } catch (error) {
         next(error);
      }
   } else {
      next();
   }
});

// Create the Product model
const Product = mongoose.model('Product', productSchema);

// Export both models
module.exports = Product;