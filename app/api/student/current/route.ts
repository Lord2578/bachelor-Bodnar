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
    
    if (userRole !== 'student') {
      return NextResponse.json(
        { message: 'Доступ дозволено лише студентам' },
        { status: 403 }
      );
    }
    
    const result = await pool.query(`
      SELECT 
        s.id as student_id, 
        u.id as user_id, 
        u.first_name, 
        u.last_name, 
        u.email,
        s.english_level,
        s.goals,
        s.learning_style
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Дані студента не знайдено' },
        { status: 404 }
      );
    }
    
    const student = result.rows[0];
    
    const formattedStudent = {
      id: student.student_id,
      userId: student.user_id,
      name: `${student.first_name} ${student.last_name}`,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      englishLevel: student.english_level,
      goals: student.goals,
      learningStyle: student.learning_style
    };
    
    return NextResponse.json({ student: formattedStudent });
  } catch (error) {
    console.error('Помилка при отриманні даних студента:', error);
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