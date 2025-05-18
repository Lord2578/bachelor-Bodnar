import { NextResponse } from 'next/server';
import pool from '@/lib/db';

function parseCookies(cookieHeader: string | null) {
  const cookies: { [key: string]: string } = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) cookies[name] = value;
  });
  
  return cookies;
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    
    const sessionId = cookies.sessionId;
    const userId = cookies.userId;
    const userRole = cookies.userRole;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Необхідна авторизація' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ message: 'Недостатньо прав для цієї дії' }, { status: 403 });
    }
    
    const query = `
      SELECT 
        t.id, 
        t.user_id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        t.english_level, 
        t.experience, 
        t.certificates
      FROM 
        teachers t
      JOIN 
        users u ON t.user_id = u.id
      ORDER BY 
        t.id
    `;
    
    const result = await pool.query(query);
    
    const teachers = result.rows.map((teacher: {
      id: number;
      user_id: number;
      first_name: string;
      last_name: string;
      email: string;
      english_level: string | null;
      experience: string | null;
      certificates: string | null;
    }) => ({
      id: teacher.id,
      userId: teacher.user_id,
      name: `${teacher.first_name} ${teacher.last_name}`,
      firstName: teacher.first_name,
      lastName: teacher.last_name,
      email: teacher.email,
      englishLevel: teacher.english_level,
      experience: teacher.experience,
      certificates: teacher.certificates
    }));
    
    return NextResponse.json({ teachers });
  } catch (error: unknown) {
    console.error('Помилка при отриманні списку вчителів:', error);
    return NextResponse.json(
      { message: 'Помилка сервера при отриманні даних вчителів' },
      { status: 500 }
    );
  }
} 