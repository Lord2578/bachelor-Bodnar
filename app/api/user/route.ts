import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Не авторизовано' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: 'Ідентифікатор користувача не знайдено' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    
    if (!user) {
      return NextResponse.json(
        { message: 'Користувача не знайдено' },
        { status: 404 }
      );
    }

    user.name = `${user.first_name} ${user.last_name}`.trim();

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Помилка при отриманні даних користувача:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}

function parseCookies(cookieHeader: string) {
  const cookies: Record<string, string> = {};
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=');
      if (name && value) {
        cookies[name.trim()] = decodeURIComponent(value.trim());
      }
    });
  }
  
  return cookies;
} 