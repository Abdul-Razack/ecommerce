import { defineType, defineField } from "sanity";

export const bentoGrid = defineType({
  name: "bentoGrid",
  title: "Bento Grid (2026)",
  type: "object",
  fields: [
    defineField({
      name: "theme",
      title: "Grid Theme",
      type: "string",
      options: {
        list: [
          { title: "Light (Clean)", value: "light" },
          { title: "Dark (Performance)", value: "dark" },
          { title: "Liquid Glass (Tactile)", value: "liquid-glass" },
        ],
      },
      initialValue: "light",
    }),
    defineField({
      name: "items",
      title: "Grid Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "item",
          fields: [
            { name: "title", type: "string", title: "Item Title" },
            { 
              name: "colSpan", 
              type: "number", 
              title: "Column Span (1-4)",
              validation: Rule => Rule.min(1).max(4)
            },
            { 
              name: "rowSpan", 
              type: "number", 
              title: "Row Span (1-4)",
              validation: Rule => Rule.min(1).max(4)
            },
            { name: "image", type: "image", title: "Background Image" },
            { name: "link", type: "string", title: "Internal Link / Action" },
            { 
              name: "content", 
              type: "text", 
              title: "Micro-Copy / Description" 
            },
          ],
          preview: {
            select: {
              title: "title",
              cols: "colSpan",
              rows: "rowSpan",
              media: "image",
            },
            prepare({ title, cols, rows, media }) {
              return {
                title: title || "Untitled Item",
                subtitle: `Grid: ${cols || 1}x${rows || 1}`,
                media,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      items: "items",
      theme: "theme",
    },
    prepare({ items, theme }) {
      return {
        title: "Modern Bento Grid",
        subtitle: `${items?.length || 0} items — Theme: ${theme}`,
      };
    },
  },
});
