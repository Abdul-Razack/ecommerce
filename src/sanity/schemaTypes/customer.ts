import { defineType, defineField } from "sanity";

export const customer = defineType({
  name: "customer",
  title: "Customers",
  type: "document",
  fields: [
    defineField({
      name: "workosId",
      title: "WorkOS User ID",
      type: "string",
      description: "The unique identifier from WorkOS auth",
      readOnly: true,
    }),
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email Address",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "savedAddresses",
      title: "Saved Addresses",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "street", type: "string", title: "Street Address" },
            { name: "city", type: "string", title: "City" },
            { name: "state", type: "string", title: "State" },
            { name: "zipCode", type: "string", title: "ZIP/Postal Code" },
            { name: "country", type: "string", title: "Country", initialValue: "India" },
            { name: "isDefault", type: "boolean", title: "Is Default Address", initialValue: false },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
    },
  },
});
