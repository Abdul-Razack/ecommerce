import { defineType, defineField } from "sanity";

export const adminUser = defineType({
  name: "adminUser",
  title: "Admin Users",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "password",
      title: "Hashed Password",
      type: "string",
      hidden: true, // Don't show in Studio easily for security
    }),
  ],
});
