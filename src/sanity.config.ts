import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';
import { deskStructure } from './sanity/deskStructure';
import { BulkUploadTool } from './sanity/components/BulkUploadTool';

export default defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'E-Commerce Store',
  apiVersion: '2024-01-01',
  basePath: '/studio',
  plugins: [
    structureTool({
      structure: deskStructure,
      title: 'Desk',
    }),
  ],
  tools: [
    {
      name: 'bulk-upload',
      title: 'Bulk Upload',
      component: BulkUploadTool,
      // Icon can be added here if available
    }
  ],
  schema: {
    types: schemaTypes,
  },
});
