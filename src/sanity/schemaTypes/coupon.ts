import { defineType, defineField } from "sanity";

export const coupon = defineType({
  name: "coupon",
  title: "Coupons",
  type: "document",
  fields: [
    defineField({
      name: "code",
      title: "Promo Code",
      type: "string",
      description: "Unique code customers type at checkout. Stored uppercase.",
      validation: (Rule) =>
        Rule.required()
          .uppercase()
          .regex(/^[A-Z0-9_-]+$/, { name: "alphanumeric" })
          .min(3)
          .max(24),
    }),
    defineField({
      name: "title",
      title: "Internal Title",
      type: "string",
      description: "For your reference only. Never shown to customers.",
    }),
    defineField({
      name: "description",
      title: "Customer Facing Description",
      type: "string",
      description: "Shown on the product page and in the coupon tray.",
    }),
    defineField({
      name: "type",
      title: "Discount Type",
      type: "string",
      options: {
        list: [
          { title: "Flat Amount Off", value: "flat" },
          { title: "Percentage Off", value: "percentage" },
          { title: "Flat Amount Per Item", value: "flatPerItem" },
          { title: "Buy X Get Y Free", value: "buyXgetY" },
          { title: "Free Gift Product", value: "freeGift" },
          { title: "Free Shipping", value: "freeShipping" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "number",
      description:
        "Rupees for flat / flatPerItem. Percent (0-100) for percentage. Item count for buyXgetY. Unused for freeGift and freeShipping.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "maxDiscount",
      title: "Max Discount Cap (INR)",
      type: "number",
      description: "Caps the final discount. Applies to percentage and buyXgetY. Leave blank for no cap.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "buyQuantity",
      title: "Buy Quantity",
      type: "number",
      description: "buyXgetY only. Units the customer must add to qualify.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "getQuantity",
      title: "Free Quantity",
      type: "number",
      description: "buyXgetY only. Cheapest units of the eligible set become free.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "giftProduct",
      title: "Free Gift Product",
      type: "reference",
      to: [{ type: "product" }],
      description: "freeGift only. Added to the order at zero cost.",
    }),
    defineField({
      name: "targetCategory",
      title: "Limit to Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Leave empty to apply across the whole cart.",
    }),
    defineField({
      name: "targetProduct",
      title: "Limit to Product",
      type: "reference",
      to: [{ type: "product" }],
      description: "Leave empty to apply to every eligible cart item.",
    }),
    defineField({
      name: "targetSize",
      title: "Limit to Size",
      type: "string",
      description: "Leave empty for all sizes. Example: XXL",
    }),
    defineField({
      name: "targetColor",
      title: "Limit to Color",
      type: "string",
      description: "Leave empty for all colors. Example: Maroon",
    }),
    defineField({
      name: "minOrderValue",
      title: "Minimum Order Value (INR)",
      type: "number",
      description: "Cart subtotal must reach this amount. 0 disables the check.",
      initialValue: 0,
    }),
    defineField({
      name: "minQuantity",
      title: "Minimum Quantity",
      type: "number",
      description: "Eligible items must total at least this many units. 0 disables the check.",
      initialValue: 0,
    }),
    defineField({
      name: "isFirstOrderOnly",
      title: "First Order Only",
      type: "boolean",
      description: "Restricted to customers with no previous order.",
      initialValue: false,
    }),
    defineField({
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Switch off to pause a promo without deleting it.",
      initialValue: true,
    }),
    defineField({
      name: "isAutoApply",
      title: "Auto Apply",
      type: "boolean",
      description: "Apply silently at checkout so customers never see a code.",
      initialValue: false,
    }),
    defineField({
      name: "isStackable",
      title: "Stackable",
      type: "boolean",
      description: "Reserved for a future multi-code release. The current engine applies one code per order.",
      initialValue: false,
    }),
    defineField({
      name: "showOnProductPage",
      title: "Show on Product Pages",
      type: "boolean",
      description: "Surface the code in the promo tray on the product detail page.",
      initialValue: true,
    }),
    defineField({
      name: "validFrom",
      title: "Valid From",
      type: "datetime",
    }),
    defineField({
      name: "validUntil",
      title: "Valid Until",
      type: "datetime",
    }),
    defineField({
      name: "usageLimit",
      title: "Total Redemption Limit",
      type: "number",
      description: "Maximum times this code may be used across all orders. 0 for unlimited.",
    }),
    defineField({
      name: "usageCount",
      title: "Times Redeemed",
      type: "number",
      description: "Incremented by the server on every successful order.",
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: "perUserLimit",
      title: "Per Customer Limit",
      type: "number",
      description: "0 for unlimited. Enforced against the customer's order history.",
    }),
  ],
  preview: {
    select: {
      code: "code",
      type: "type",
      value: "value",
      buyQuantity: "buyQuantity",
      getQuantity: "getQuantity",
      isActive: "isActive",
      usageCount: "usageCount",
      usageLimit: "usageLimit",
    },
    prepare({ code, type, value, buyQuantity, getQuantity, isActive, usageCount, usageLimit }) {
      const label =
        type === "percentage" ? `${value}% off`
        : type === "flat" ? `₹${value} off`
        : type === "flatPerItem" ? `₹${value} off each`
        : type === "buyXgetY" ? `Buy ${buyQuantity || 1} get ${getQuantity || 1} free`
        : type === "freeShipping" ? "Free shipping"
        : type === "freeGift" ? "Free gift"
        : "No discount set";

      return {
        title: code || "Untitled Coupon",
        subtitle: `${isActive ? "Active" : "Paused"} — ${label} (${usageCount || 0}${usageLimit ? ` / ${usageLimit}` : ""} used)`,
      };
    },
  },
});
