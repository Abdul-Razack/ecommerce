import { defineType, defineField } from "sanity";

export const variant = defineType({
  name: "variant",
  title: "Product Variant",
  type: "object",
  fields: [
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
    }),
    defineField({
      name: "color",
      title: "Color",
      type: "string",
    }),
    defineField({
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: ["XS", "S", "M", "L", "XL", "XXL"],
      },
    }),
    defineField({
      name: "price",
      title: "Price Override",
      type: "number",
      description: "Leave empty to use base product price",
    }),
    defineField({
      name: "stock",
      title: "Stock Quantity",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "images",
      title: "Variant Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
  ],
});
