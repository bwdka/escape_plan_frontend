import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
// If role is undefined, it just needs a valid token (any user)
const PROTECTED_ROUTES = [
  { path: '/partner', role: 'partner' },
  { path: '/admin', role: 'admin' },
  { path: '/bookings', role: undefined }, 
  { path: '/profile', role: undefined },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Check if the current path matches any protected route
  const protectedRoute = PROTECTED_ROUTES.find(route => pathname.startsWith(route.path));

  if (protectedRoute) {
    // 2. Get token from cookies (Middleware cannot access localStorage)
    const token = request.cookies.get('token')?.value;

    // 3. If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 4. Role Verification
    if (protectedRoute.role) {
      const userRole = request.cookies.get('user_role')?.value; 

      if (userRole && userRole !== protectedRoute.role) {
         // If user has role but doesn't match required role, redirect to home
         return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

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