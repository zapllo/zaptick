import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define paths that are public
  const isPublicPath = path === '/login' || path === '/signup' || path === '/' || path === '/forgot-password' || path === '/reset-password' || path.startsWith('/api/') || path === '/signup/whatsapp'|| path === '/qr-generator' || path === '/link-generator' || path === '/demo';

  // Define admin paths
  const isAdminPath = path.startsWith('/admin');

  // Get the token from the cookies
  const hasToken = request.cookies.has('token');

  console.log('Middleware Path:', path);
  console.log('Has Token:', hasToken);

  // Redirect authenticated users away from login/signup pages
  if (hasToken && (path === '/login' || path === '/signup')) {
    console.log('Redirecting to dashboard from auth page');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect admin routes - redirect to login if no token
  if (isAdminPath && !hasToken) {
    console.log('Redirecting to login from admin route - no auth');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect unauthenticated users to login page if trying to access protected routes
  if (!hasToken && !isPublicPath) {
    console.log('Redirecting to login from protected route');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp|avif)).*)',
  ],
};