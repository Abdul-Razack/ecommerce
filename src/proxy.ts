import { authkitProxy } from '@workos-inc/authkit-nextjs';

export default authkitProxy({
  redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/callback'
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)'
  ]
};
