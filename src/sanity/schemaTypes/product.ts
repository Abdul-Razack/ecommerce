import { defineType, defineField } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price (INR)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "comparePrice",
      title: "Compare at Price",
      type: "number",
      description: "Original price for strike-through",
    }),
    defineField({
      name: "costPrice",
      title: "Cost Price (Internal)",
      type: "number",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "mainImage",
      title: "Featured Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Image Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "variants",
      title: "Product Variants (Colors/Sizes)",
      type: "array",
      of: [{ type: "variant" }],
    }),
    defineField({
      name: "stock",
      title: "Total Stock Quantity",
      type: "number",
      description: "Fallback if variants aren't used",
    }),
    defineField({
      name: "flags",
      title: "Product Badges",
      type: "object",
      fields: [
        { name: "isTrending", type: "boolean", title: "Trending", initialValue: false },
        { name: "isNewArrival", type: "boolean", title: "New Arrival", initialValue: false },
        { name: "isFeatured", type: "boolean", title: "Featured", initialValue: false },
      ]
    }),
    defineField({
      name: "gridConfig",
      title: "Bento Grid Configuration",
      type: "object",
      fields: [
        { 
          name: "colSpan", 
          title: "Column Span (1-4)", 
          type: "number", 
          initialValue: 1,
          validation: Rule => Rule.min(1).max(4)
        },
        { 
          name: "rowSpan", 
          title: "Row Span (1-4)", 
          type: "number", 
          initialValue: 1,
          validation: Rule => Rule.min(1).max(4)
        },
      ]
    }),
    defineField({
      name: "seo",
      title: "SEO Metadata",
      type: "object",
      fields: [
        { name: "metaTitle", type: "string" },
        { name: "metaDescription", type: "text" },
      ]
    }),
  ],
});
