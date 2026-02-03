import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const PROTECTED_ROUTES = [
  { path: '/partner', role: 'partner' },
  { path: '/admin', role: 'admin' },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Check if the current path matches any protected route
  const protectedRoute = PROTECTED_ROUTES.find(route => pathname.startsWith(route.path));

  if (protectedRoute) {
    // 2. Get token from cookies (Middleware cannot access localStorage)
    // In a real app, ensure your login logic sets a 'token' cookie, 
    // or use a session library like next-auth.
    const token = request.cookies.get('token')?.value;

    // 3. If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 4. Role Verification (Mock Logic)
    // Ideally, you verify the JWT signature and decode the role here.
    // Since we don't have the JWT lib installed or the secret, 
    // we will rely on a mock cookie 'role' for this scaffold demonstration.
    // REAL WORLD: Decode token -> const { role } = jwt.verify(token, secret);
    const userRole = request.cookies.get('user_role')?.value; 

    if (userRole && userRole !== protectedRoute.role) {
       // If user has role but matches (e.g. customer trying to access admin), redirect to home or 403
       return NextResponse.redirect(new URL('/', request.url));
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
