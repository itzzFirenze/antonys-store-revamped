// server/utils/idGenerator.js

const Product = require('../models/product');

// Custom ID generator function (Prefix + Sequential Number)
const generateProductId = async () => {
    const prefix = 'PROD';
    const latestProduct = await Product.findOne().sort({ _id: -1 });  // Find the latest product by _id
    const latestId = latestProduct ? latestProduct._id.replace(prefix, '') : 0;  // Remove the prefix if exists
    const newId = parseInt(latestId) + 1;  // Increment the ID
    return prefix + newId.toString().padStart(5, '0');  // Format to a 5-digit number, e.g., PROD00001
};

module.exports = { generateProductId };
