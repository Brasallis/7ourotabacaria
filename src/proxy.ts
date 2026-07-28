import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token')?.value;

  // Se estiver tentando acessar /admin e não tiver token, manda pro /login
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (adminToken !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Se já tiver logado e tentar acessar o /login, manda pro /admin
  if (request.nextUrl.pathname === '/login') {
    if (adminToken === 'authenticated') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
