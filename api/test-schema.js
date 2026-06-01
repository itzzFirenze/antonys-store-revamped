require('dotenv').config();
const supabase = require('./supabase');

async function testSchema() {
   const { data, error } = await supabase.rpc('get_products_schema'); // Not available probably
   // Instead we can just fetch a product and look at the id
   const { data: products } = await supabase.from('products').select('id, category').limit(2);
   console.log('Products:', products);
}

testSchema();
