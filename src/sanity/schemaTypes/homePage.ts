import { defineType, defineField } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Homepage CMS",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        { name: "heading", type: "string", title: "Heading" },
        { name: "subtext", type: "string", title: "Subtext" },
        { name: "buttonText", type: "string", title: "Button Text" },
        { 
          name: "images", 
          type: "array", 
          of: [{ type: "image", options: { hotspot: true } }], 
          title: "Background Images (Slider)" 
        },
      ]
    }),
    defineField({
      name: "featuredCollections",
      title: "Featured Collections",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "title", type: "string" },
          { name: "category", type: "reference", to: [{ type: "category" }] },
          { name: "image", type: "image" },
        ]
      }]
    }),
    defineField({
      name: "trendingProducts",
      title: "Trending Products Section",
      type: "object",
      fields: [
        { name: "heading", type: "string", initialValue: "TRENDING NOW" },
        { name: "products", type: "array", of: [{ type: "reference", to: [{ type: "product" }] }] }
      ]
    }),
    defineField({
      name: "editorial",
      title: "Editorial Section",
      type: "object",
      fields: [
        { name: "heading", type: "string" },
        { name: "description", type: "text" },
        { name: "mainImage", type: "image" },
        { name: "secondaryImage", type: "image" },
      ]
    }),
    defineField({
      name: "announcement",
      title: "Top Announcement Bar",
      type: "array",
      of: [{ type: "string" }]
    }),
    defineField({
      name: "pageBuilder",
      title: "Page Builder (2026)",
      type: "array",
      of: [
        { type: "bentoGrid" }
      ]
    }),
    defineField({
      name: "featuresBar",
      title: "Store Features (USPs)",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "title", type: "string" },
          { name: "subtext", type: "string" },
          { name: "icon", type: "string", description: "SVG path or identifier" },
        ]
      }]
    }),
    defineField({
      name: "promotionalBanner",
      title: "Promotional Banner",
      type: "object",
      fields: [
        { name: "isActive", type: "boolean", initialValue: true },
        { name: "heading", type: "string" },
        { name: "subtext", type: "string" },
        { name: "discount", type: "string" },
        { name: "image", type: "image", options: { hotspot: true } },
      ]
    }),
    defineField({
      name: "dynamicProductRows",
      title: "Dynamic Product Rows",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "title", type: "string", title: "Row Title" },
          { name: "category", type: "reference", to: [{ type: "category" }] },
        ]
      }]
    }),
    defineField({
      name: "globalCta",
      title: "Global CTA",
      type: "object",
      fields: [
        { name: "heading", type: "string" },
        { name: "buttonText", type: "string" },
        { name: "buttonLink", type: "string" },
      ]
    }),
  ],
});
