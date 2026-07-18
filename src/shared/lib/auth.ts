import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { writeClient } from '@/shared/lib/sanity';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth Debug] Authorize called with email:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth Debug] Missing email or password');
          return null;
        }

        try {
          // Query Sanity for the admin user
          console.log('[Auth Debug] Fetching admin user from Sanity...');
          const admin = await writeClient.fetch(`
            *[_type == "adminUser" && email == $email][0]
          `, { email: credentials.email as string });

          if (!admin) {
            console.log('[Auth Debug] Admin user not found in Sanity database');
            return null;
          }
          console.log('[Auth Debug] Admin user found in Sanity:', admin.email);

          const isValid = await bcrypt.compare(credentials.password as string, admin.password);
          console.log('[Auth Debug] Password comparison result:', isValid);

          if (!isValid) {
            console.log('[Auth Debug] Invalid password provided');
            return null;
          }

          console.log('[Auth Debug] Authorization successful!');
          return {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            role: 'admin',
          };
        } catch (error) {
          console.error('[Auth Debug] Auth error occurred:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
});
