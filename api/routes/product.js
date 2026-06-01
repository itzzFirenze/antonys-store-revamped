const express = require('express');
const productRoute = express.Router();
const asyncHandler = require('express-async-handler');
const productModel = require('../models/productModel');
const multer = require('multer');
const path = require('path');
const supabase = require('../supabase');


// ─── Multer configuration ─────────────────────────────────────────────────────
const upload = multer({
   storage: multer.memoryStorage(),
   limits: { fileSize: 10 * 1024 * 1024 }, // 2MB
   fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
         cb(null, true);
      } else {
         cb(new Error('Only image files are allowed!'), false);
      }
   },
});


// ─── Serve uploaded files (kept for backward compat) ──────────────────────────
productRoute.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// ─── Get all categories ───────────────────────────────────────────────────────
productRoute.get('/categories', async (req, res) => {
   try {
      const categories = await productModel.distinctCategories();
      res.status(200).json(categories);
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
   }
});


// ─── Get all colors ───────────────────────────────────────────────────────────
productRoute.get('/colors', async (req, res) => {
   try {
      const colors = await productModel.distinctColors();
      res.status(200).json(colors);
   } catch (error) {
      res.status(500).json({ error: 'Failed to fetch colors' });
   }
});


// ─── Get all products ─────────────────────────────────────────────────────────
productRoute.get('/', asyncHandler(async (req, res) => {
   const products = await productModel.findAll();
   res.json(products.map(productModel.toClientShape));
}));


// ─── Get product by ID ────────────────────────────────────────────────────────
productRoute.get('/:id', asyncHandler(async (req, res) => {
   const product = await productModel.findById(req.params.id);
   if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
   }
   res.json(productModel.toClientShape(product));
}));


// ─── Add a product ────────────────────────────────────────────────────────────
productRoute.post('/', upload.array('images', 5), asyncHandler(async (req, res) => {
   const { name, brand, price, color, countInStock, category, image: imageUrl, sizes } = req.body;

   if (!name || !brand || !price || !color || !countInStock || !category) {
      return res.status(400).json({ message: 'All fields are required.' });
   }

   const finalImages = [];
   
   if (req.files && req.files.length > 0) {
      for (const file of req.files) {
         const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
         const { data, error } = await supabase.storage
            .from('products')
            .upload(`public/${fileName}`, file.buffer, {
               contentType: file.mimetype,
               upsert: false
            });

         if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ message: 'Image upload failed' });
         }

         const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(`public/${fileName}`);
         finalImages.push(publicUrl);
      }
   }
   
   // Handle case where images were provided as strings (URLs)
   if (req.body.images) {
      if (Array.isArray(req.body.images)) {
         finalImages.push(...req.body.images);
      } else {
         finalImages.push(req.body.images);
      }
   }
   
   // Fallback to legacy single image URL
   if (imageUrl) {
      finalImages.push(imageUrl);
   }

   if (finalImages.length === 0) {
      return res.status(400).json({ message: 'At least one image is required.' });
   }

   const parsedSizes = sizes
      ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes)
      : { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

   const savedProduct = await productModel.create({
      name,
      brand,
      price: Number(price),
      color,
      countInStock: Number(countInStock),
      category,
      image: finalImages,
      sizes: parsedSizes,
   });

   res.status(201).json(productModel.toClientShape(savedProduct));
}));


// ─── Update a product ─────────────────────────────────────────────────────────
productRoute.put('/:id', upload.array('images', 5), asyncHandler(async (req, res) => {
   try {
      const { name, brand, price, color, countInStock, category, sizes, existingImages } = req.body;

      const existingProduct = await productModel.findById(req.params.id);
      if (!existingProduct) {
         return res.status(404).json({ message: 'Product not found' });
      }

      let finalImages = [];
      
      // Parse existing images sent back from client
      if (existingImages) {
         try {
            finalImages = JSON.parse(existingImages);
            if (!Array.isArray(finalImages)) {
               finalImages = [finalImages];
            }
         } catch (e) {
            finalImages = Array.isArray(existingImages) ? existingImages : [existingImages];
         }
      }

      if (req.files && req.files.length > 0) {
         for (const file of req.files) {
            const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const { data, error } = await supabase.storage
               .from('products')
               .upload(`public/${fileName}`, file.buffer, {
                  contentType: file.mimetype,
                  upsert: false
               });

            if (error) {
               console.error('Supabase upload error:', error);
               return res.status(500).json({ message: 'Image upload failed' });
            }

            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(`public/${fileName}`);
            finalImages.push(publicUrl);
         }
      }

      const parsedSizes = sizes
         ? (typeof sizes === 'string' ? JSON.parse(sizes) : sizes)
         : undefined;

      const updatedProduct = await productModel.update(req.params.id, {
         name,
         brand,
         price,
         color,
         countInStock,
         category,
         image: finalImages,
         sizes: parsedSizes,
      });

      res.json(productModel.toClientShape(updatedProduct));
   } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: error.message });
   }
}));


// ─── Delete a product ─────────────────────────────────────────────────────────
productRoute.delete('/:id', asyncHandler(async (req, res) => {
   const product = await productModel.findById(req.params.id);

   if (!product) {
      return res.status(404).json({ message: 'Product not found!' });
   }

   await productModel.deleteById(req.params.id);
   res.status(200).json({ message: 'Product deleted successfully' });
}));


// ─── Decrement product quantity ───────────────────────────────────────────────
productRoute.put('/decrease-quantity/:id', asyncHandler(async (req, res) => {
   const { quantity, size, category } = req.body;

   try {
      const updatedProduct = await productModel.decreaseQuantity(
         req.params.id,
         Number(quantity) || 1,
         size,
         category
      );

      if (!updatedProduct) {
         return res.status(404).json({ message: 'Product not found or size not available' });
      }

      res.json(productModel.toClientShape(updatedProduct));
   } catch (error) {
      res.status(500).json({ message: 'Error updating product quantity', error: error.message });
   }
}));


module.exports = productRoute;