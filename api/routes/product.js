const express = require("express");
const productRoute = express.Router();
const asyncHandler = require("express-async-handler");
const Product = require("../models/product");
const multer = require("multer");
const path = require("path");


// Multer configuration
const multerConfig = multer({
   storage: multer.memoryStorage(),
   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
   fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
         cb(null, true);
      } else {
         cb(new Error("Only image files are allowed!"), false);
      }
   },
});

const upload = multer(multerConfig);


// Serve uploaded files
productRoute.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Get all categories
productRoute.get('/categories', async (req, res) => {
   try {
      const categories = await Product.distinct('category');
      res.status(200).json(categories);
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
   }
});


// Get all colors
productRoute.get('/colors', async (req, res) => {
   try {
      const colors = await Product.distinct('color');
      res.status(200).json(colors);
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch colors' });
   }
});


// Get all products
productRoute.get(
   "/",
   asyncHandler(async (req, res) => {
      const products = await Product.find({});
      res.json(products);
   })
);


// Get a product by ID
productRoute.get(
   "/:id",
   asyncHandler(async (req, res) => {
      const product = await Product.findById(req.params.id);
      if (!product) {
         res.status(404).json({ message: "Product not found!" });
         return;
      }
      res.json(product);
   })
);


// Add a product with an image
productRoute.post(
   "/",
   upload.single("image"),
   asyncHandler(async (req, res) => {
      const { name, brand, price, color, countInStock, category, image: imageUrl, sizes } = req.body;

      if (!name || !brand || !price || !color || !countInStock || !category) {
         res.status(400).json({ message: "All fields are required." });
         return;
      }

      let finalImage;

      // Check if we have a direct file upload
      if (req.file) {
         const imageBuffer = req.file.buffer;
         finalImage = imageBuffer.toString("base64");
      }
      // Check if we have an image URL
      else if (imageUrl) {
         finalImage = imageUrl;
      } else {
         res.status(400).json({ message: "Image is required (either as file or URL)." });
         return;
      }

      const parsedSizes = sizes || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };


      // Create new product
      const newProduct = new Product({
         name,
         brand,
         price,
         color,
         countInStock,
         category,
         image: finalImage,
         sizes: parsedSizes,
      });

      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
   })
);


// Update a product by ID
productRoute.put('/:id', async (req, res) => {
   try {
      const productId = req.params.id;
      const { name, brand, price, color, countInStock, category, sizes, image } = req.body;

      // Find the existing product
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
         return res.status(404).json({ message: 'Product not found' });
      }

      // Create update object
      const updateFields = {
         name,
         brand,
         price,
         color,
         countInStock,
         category,
         image
      };

      // Handle sizes update
      if (sizes !== undefined) {
         updateFields.sizes = sizes;
      }

      const updateOperation = sizes === undefined
         ? { $set: updateFields, $unset: { sizes: '' } }
         : { $set: updateFields };

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
         productId,
         updateOperation,
         { new: true, runValidators: true }
      );

      res.json(updatedProduct);
   } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: error.message });
   }
});


// Delete a product by ID
productRoute.delete(
   "/:id",
   asyncHandler(async (req, res) => {
      const productId = req.params.id;

      // Find and delete the product
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
         return res.status(404).json({ message: "Product not found!" });
      }

      res.status(200).json({ message: "Product deleted successfully" });
   })
);


// Decrement the product count by 1 
productRoute.put(
   "/decrease-quantity/:id",
   asyncHandler(async (req, res) => {
      const productId = req.params.id;
      const { quantity, size, category } = req.body;

      try {
         const product = await Product.findById(productId);
         if (!product) {
            return res.status(404).json({ message: "Product not found" });
         }

         if ((category === "Ready-made churidar" || category === "Leggings/Pants") && size) {
            if (!product.sizes || !product.sizes[size]) {
               return res.status(400).json({ message: "Size not found for this product" });
            }

            product.sizes[size] = Math.max(0, product.sizes[size] - quantity);
         } else {
            product.countInStock = Math.max(0, product.countInStock - quantity);
         }

         const updatedProduct = await product.save();
         res.json(updatedProduct);
      } catch (error) {
         res.status(500).json({ message: "Error updating product quantity", error: error.message });
      }
   })
);


module.exports = productRoute;