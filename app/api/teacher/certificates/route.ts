import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    
    const sessionId = cookies.sessionId;
    const userId = cookies.userId;
    const userRole = cookies.userRole;
    
    console.log(`Fetching certificates. User ID: ${userId}, Role: ${userRole}`);
    
    if (!sessionId || !userId) {
      return NextResponse.json({ 
        message: 'Необхідна авторизація' 
      }, { status: 401 });
    }
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const teacherQuery = 'SELECT id FROM teachers WHERE user_id = $1';
    const teacherResult = await pool.query(teacherQuery, [userId]);
    
    if (teacherResult.rows.length === 0) {
      console.log(`Не знайдено викладача для userId: ${userId}`);
      return NextResponse.json({ 
        message: 'Викладача не знайдено' 
      }, { status: 404 });
    }
    
    const teacherId = teacherResult.rows[0].id;
    console.log(`Знайдено ID викладача: ${teacherId}`);
    
    const certificatesQuery = `
      SELECT id, teacher_id, file_url, description, uploaded_at 
      FROM teacher_certificates 
      WHERE teacher_id = $1 
      ORDER BY uploaded_at DESC
    `;
    const certificatesResult = await pool.query(certificatesQuery, [teacherId]);
    console.log(`Знайдено ${certificatesResult.rows.length} сертифікатів для викладача`);
    
    return NextResponse.json({
      certificates: certificatesResult.rows
    });
    
  } catch (error: unknown) {
    console.error('Помилка при отриманні сертифікатів:', error);
    return NextResponse.json({ 
      message: 'Помилка при отриманні сертифікатів',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 