import { authkitProxy } from '@workos-inc/authkit-nextjs';

export default authkitProxy({
  redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/callback'
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
