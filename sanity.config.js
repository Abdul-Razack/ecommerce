'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schema } from './sanity/schema';

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'E-Commerce Store',
  apiVersion: '2024-01-01',
  basePath: '/studio',
  plugins: [structureTool()],
  schema,
});

export default config;
