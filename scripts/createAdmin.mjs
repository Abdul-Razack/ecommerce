import { createClient } from '@sanity/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  const email = 'admin@shopverse.com';
  const password = 'admin-password-2026';
  const name = 'Admin User';

  console.log(`Creating admin user: ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 12);

  const doc = {
    _type: 'adminUser',
    _id: 'admin-primary',
    name,
    email,
    password: hashedPassword,
  };

  try {
    await client.createOrReplace(doc);
    console.log('✓ Admin user created successfully!');
    console.log('--- Credentials ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------');
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
  }
}

main();
