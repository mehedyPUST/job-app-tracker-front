// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    const token = request.cookies.get('token');
    const isAuthenticated = !!token;
    const path = request.nextUrl.pathname;

    // Public routes (no auth required)
    const publicRoutes = ['/', '/login', '/register'];
    const isPublicRoute = publicRoutes.includes(path);

    // Protected routes (auth required)
    const protectedRoutes = ['/dashboard', '/applications', '/admin'];
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    // If trying to access protected route without auth
    if (isProtectedRoute && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If trying to access auth pages while logged in
    if (isPublicRoute && isAuthenticated && path !== '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/dashboard/:path*',
        '/applications/:path*',
        '/admin/:path*',
    ],
};