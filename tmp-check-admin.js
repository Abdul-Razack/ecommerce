const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

client.fetch('*[_type == "adminUser"]{_id,name,email,password}').then((docs) => {
  console.log(JSON.stringify(docs, null, 2));
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
