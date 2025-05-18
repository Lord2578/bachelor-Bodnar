import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;
    const userRole = cookieMap.userRole;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    
    if (userRole !== 'teacher') {
      return NextResponse.json(
        { message: 'Доступ дозволено лише вчителям' },
        { status: 403 }
      );
    }
    
    const result = await pool.query(`
      SELECT 
        t.id as teacher_id, 
        u.id as user_id, 
        u.first_name, 
        u.last_name, 
        u.email,
        t.english_level,
        t.experience,
        t.certificates
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Дані вчителя не знайдено' },
        { status: 404 }
      );
    }
    
    const teacher = result.rows[0];
    
    const formattedTeacher = {
      id: teacher.teacher_id,
      userId: teacher.user_id,
      name: `${teacher.first_name} ${teacher.last_name}`,
      firstName: teacher.first_name,
      lastName: teacher.last_name,
      email: teacher.email,
      englishLevel: teacher.english_level,
      experience: teacher.experience,
      certificates: teacher.certificates
    };
    
    return NextResponse.json({ teacher: formattedTeacher });
  } catch (error) {
    console.error('Помилка при отриманні даних вчителя:', error);
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