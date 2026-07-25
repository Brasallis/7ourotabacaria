import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // A senha mestra definida para a loja
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '7ouroadmin';

    if (password === ADMIN_PASSWORD) {
      // Define o cookie de autenticação com segurança e expiração
      const cookieStore = await cookies();
      cookieStore.set('admin_token', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 semana
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
