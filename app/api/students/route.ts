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
    
    if (userRole !== 'teacher' && userRole !== 'admin' && userRole !== 'student') {
      return NextResponse.json(
        { message: 'Немає доступу до списку студентів' },
        { status: 403 }
      );
    }
    
    const url = new URL(request.url);
    const queryUserId = url.searchParams.get('userId');
    
    let query = `
      SELECT 
        s.id as student_id, 
        u.id as user_id, 
        u.first_name, 
        u.last_name, 
        u.email
      FROM students s
      JOIN users u ON s.user_id = u.id
    `;
    
    const queryParams = [];
    
    if (queryUserId) {
      query += ` WHERE u.id = $1`;
      queryParams.push(queryUserId);
    }
    
    query += ` ORDER BY u.last_name, u.first_name`;
    
    console.log('SQL запит студентів:', query, 'з параметрами:', queryParams);
    
    const result = await pool.query(query, queryParams);
    console.log(`Знайдено ${result.rows.length} студентів`);
    
    const students = result.rows.map(row => ({
      id: row.student_id,
      userId: row.user_id,
      name: `${row.first_name} ${row.last_name}`,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email
    }));
    
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Помилка при отриманні списку студентів:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
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