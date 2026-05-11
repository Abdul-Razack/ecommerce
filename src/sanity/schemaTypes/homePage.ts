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
        { name: "image", type: "image", title: "Background Image", options: { hotspot: true } },
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
  ],
});
