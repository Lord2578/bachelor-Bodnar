import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get('sessionId')?.value;
  const userId = request.cookies.get('userId')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const isAuthPage = request.nextUrl.pathname === '/';
  
  if (!sessionId || !userId) {
    if (!isAuthPage && 
        (request.nextUrl.pathname.startsWith('/dashboard') || 
         request.nextUrl.pathname.startsWith('/teacher') || 
         request.nextUrl.pathname.startsWith('/student') ||
         request.nextUrl.pathname.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    if (isAuthPage) {
      if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', request.url));
      } else if (userRole === 'student') {
        return NextResponse.redirect(new URL('/student', request.url));
      } else if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    
    if (userRole === 'teacher' && (request.nextUrl.pathname.startsWith('/student') || request.nextUrl.pathname.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
    
    if (userRole === 'student' && (request.nextUrl.pathname.startsWith('/teacher') || request.nextUrl.pathname.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    
    if (userRole === 'admin' && (request.nextUrl.pathname.startsWith('/teacher') || request.nextUrl.pathname.startsWith('/student'))) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
