import { authkitProxy } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server';

const authkit = authkitProxy({
  redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://localhost:3000/callback',
});

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionToken =
      request.cookies.get('__Secure-authjs.session-token')?.value ||
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value ||
      request.cookies.get('next-auth.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /api/admin routes
  if (pathname.startsWith('/api/admin')) {
    const sessionToken =
      request.cookies.get('__Secure-authjs.session-token')?.value ||
      request.cookies.get('authjs.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value ||
      request.cookies.get('next-auth.session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  return authkit(request, event);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/(api|trpc)(.*)'
  ]
};
