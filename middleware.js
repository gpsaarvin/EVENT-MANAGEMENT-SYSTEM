import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define paths that are public
  const publicPaths = [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/api/auth/signin',
    '/api/auth/signup',
  ];
  
  // Define paths that require admin role
  const adminPaths = [
    '/admin',
    '/admin/events',
    '/admin/users',
    '/admin/registrations',
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  const token = await getToken({ req: request });
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Check admin access for admin routes
  const isAdminPath = adminPaths.some(adminPath => 
    path === adminPath || path.startsWith(adminPath + '/')
  );
  
  if (isAdminPath && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Specify which paths this middleware will run on
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/events/:path*',
    '/auth/:path*',
    '/api/users/:path*',
    '/api/events/:path*',
    '/api/registrations/:path*',
  ],
}