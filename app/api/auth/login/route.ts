import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyPassword } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Емейл та пароль обов\'язкові' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { message: 'Невірний емейл або пароль' },
        { status: 401 }
      );
    }

    const isPasswordValid = verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Невірний емейл або пароль' },
        { status: 401 }
      );
    }

    const sessionId = Date.now().toString();
    
    let redirectPath = '/dashboard';
    if (user.role === 'teacher') {
      redirectPath = '/teacher';
    } else if (user.role === 'student') {
      redirectPath = '/student';
    } else if (user.role === 'admin') {
      redirectPath = '/admin';
    }
    
    const response = NextResponse.json({
      message: 'Успішна авторизація',
      user: { ...user, password_hash: undefined },
      redirectTo: redirectPath
    });
    
    response.cookies.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
    });

    response.cookies.set('userRole', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('userId', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('userName', `${user.first_name} ${user.last_name}`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Помилка при авторизації:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}