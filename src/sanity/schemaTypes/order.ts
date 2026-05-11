import { defineType, defineField } from "sanity";

export const order = defineType({
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    defineField({
      name: "orderId",
      title: "Order ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "customer",
      title: "Customer Details",
      type: "object",
      fields: [
        { name: "name", type: "string", title: "Full Name" },
        { name: "email", type: "string", title: "Email Address" },
        { name: "phone", type: "string", title: "Phone Number" },
      ]
    }),
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "text",
    }),
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      of: [{
        type: "object",
        fields: [
          { name: "product", type: "reference", to: [{ type: "product" }] },
          { name: "name", type: "string" },
          { name: "price", type: "number" },
          { name: "quantity", type: "number" },
          { name: "color", type: "string" },
          { name: "size", type: "string" },
        ]
      }]
    }),
    defineField({
      name: "totalAmount",
      title: "Total Amount",
      type: "number",
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment Status",
      type: "string",
      options: {
        list: ["pending", "paid", "failed"],
      },
    }),
    defineField({
      name: "razorpayOrderId",
      title: "Razorpay Order ID",
      type: "string",
    }),
    defineField({
      name: "razorpayPaymentId",
      title: "Razorpay Payment ID",
      type: "string",
    }),
    defineField({
      name: "trackingId",
      title: "Tracking ID",
      type: "string",
    }),
  ],
});
