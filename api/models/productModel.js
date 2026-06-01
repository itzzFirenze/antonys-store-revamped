const supabase = require('../supabase');
const crypto = require('crypto');

// ─── Field mapping ────────────────────────────────────────────────────────────

function toClientShape(row) {
   if (!row) return null;
   return {
      _id:          row.id,
      productCode:  row.product_code,
      name:         row.name,
      brand:        row.brand,
      price:        row.price,
      color:        row.color,
      category:     row.category,
      countInStock: row.count_in_stock,
      image:        row.image,
      sizes:        row.sizes,
      createdAt:    row.created_at,
   };
}

// ─── ID Generation ────────────────────────────────────────────────────────────
// Mirrors the Mongoose pre-save hook: COLOR(4) + zero-padded counter

async function generateProductCode(category) {
   let catCode = 'OTH';
   const catLower = (category || '').toLowerCase();
   
   if (catLower.includes('churidar')) {
      catCode = 'CHR';
   } else if (catLower.includes('shawl') || catLower.includes('dupatta')) {
      catCode = 'SWL';
   } else if (catLower.includes('legging') || catLower.includes('pant')) {
      catCode = 'LEG';
   }

   const prefix = `BTQ-${catCode}-`;

   // Fetch the latest product code with this prefix
   const { data, error } = await supabase
      .from('products')
      .select('product_code')
      .like('product_code', `${prefix}%`)
      .order('product_code', { ascending: false })
      .limit(1)
      .maybeSingle();

   if (error) throw error;

   let nextNum = 1;
   if (data && data.product_code) {
      const parts = data.product_code.split('-');
      if (parts.length === 3) {
         nextNum = parseInt(parts[2], 10) + 1;
      }
   }

   return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

async function findAll() {
   const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
   if (error) throw error;
   return data;
}

async function findById(id) {
   const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
   if (error) throw error;
   return data;
}

async function distinctCategories() {
   // Supabase doesn't have DISTINCT helper; use RPC or raw query
   const { data, error } = await supabase.from('products').select('category');
   if (error) throw error;
   return [...new Set(data.map(r => r.category))].filter(Boolean);
}

async function distinctColors() {
   const { data, error } = await supabase.from('products').select('color');
   if (error) throw error;
   return [...new Set(data.map(r => r.color))].filter(Boolean);
}

async function create({ name, brand, price, color, countInStock, category, image, sizes }) {
   const id = crypto.randomUUID();
   const product_code = await generateProductCode(category);
   const parsedSizes = sizes || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

   const { data, error } = await supabase
      .from('products')
      .insert({
         id,
         product_code,
         name,
         brand,
         price,
         color,
         category,
         count_in_stock: countInStock,
         image,
         sizes: parsedSizes,
      })
      .select()
      .single();
   if (error) throw error;
   return data;
}

async function update(id, fields) {
   const dbFields = {};
   if (fields.name         !== undefined) dbFields.name           = fields.name;
   if (fields.brand        !== undefined) dbFields.brand          = fields.brand;
   if (fields.price        !== undefined) dbFields.price          = fields.price;
   if (fields.color        !== undefined) dbFields.color          = fields.color;
   if (fields.countInStock !== undefined) dbFields.count_in_stock = fields.countInStock;
   if (fields.category     !== undefined) dbFields.category       = fields.category;
   if (fields.image        !== undefined) dbFields.image          = fields.image;
   if (fields.sizes        !== undefined) dbFields.sizes          = fields.sizes;

   const { data, error } = await supabase
      .from('products')
      .update(dbFields)
      .eq('id', id)
      .select()
      .single();
   if (error) throw error;
   return data;
}

async function deleteById(id) {
   const { error } = await supabase.from('products').delete().eq('id', id);
   if (error) throw error;
}

async function decreaseQuantity(id, quantity, size, category) {
   const product = await findById(id);
   if (!product) return null;

   const sizedCategories = ['Ready-made churidar', 'Leggings/Pants'];

   if (sizedCategories.includes(category) && size) {
      // Decrement the specific size inside the JSONB column
      const sizes = product.sizes || {};
      if (!sizes[size] && sizes[size] !== 0) return null; // size not found
      const updatedSizes = { ...sizes, [size]: Math.max(0, (sizes[size] || 0) - quantity) };
      const { data, error } = await supabase
         .from('products')
         .update({ sizes: updatedSizes })
         .eq('id', id)
         .select()
         .single();
      if (error) throw error;
      return data;
   } else {
      const newStock = Math.max(0, product.count_in_stock - quantity);
      const { data, error } = await supabase
         .from('products')
         .update({ count_in_stock: newStock })
         .eq('id', id)
         .select()
         .single();
      if (error) throw error;
      return data;
   }
}

async function countAll() {
   const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
   if (error) throw error;
   return count;
}

module.exports = {
   toClientShape,
   findAll,
   findById,
   distinctCategories,
   distinctColors,
   create,
   update,
   deleteById,
   decreaseQuantity,
   countAll,
};
