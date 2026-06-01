require('dotenv').config();
const supabase = require('./supabase');

async function createBucket() {
  console.log('Checking for products bucket...');
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('List Error:', listError);
    return;
  }

  const exists = buckets.find(b => b.name === 'products');
  
  if (!exists) {
    console.log('Creating bucket products...');
    const { data, error } = await supabase.storage.createBucket('products', {
      public: true,
      allowedMimeTypes: ['image/*'],
    });
    if (error) {
       console.error('Create Bucket Error:', error);
    } else {
       console.log('Bucket created successfully!');
    }
  } else {
    console.log('Bucket already exists.');
  }
}

createBucket();
