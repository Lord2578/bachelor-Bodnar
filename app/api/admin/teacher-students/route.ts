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
      return NextResponse.json({ 
        message: 'Необхідна авторизація' 
      }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const url = new URL(request.url);
    const teacherId = url.searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json({ 
        message: 'Необхідно вказати ID викладача' 
      }, { status: 400 });
    }
    
    const query = `
      SELECT 
        s.id, 
        u.first_name, 
        u.last_name, 
        u.email,
        CASE 
          WHEN tsa.id IS NOT NULL THEN true
          ELSE false
        END AS assigned
      FROM 
        students s
      JOIN 
        users u ON s.user_id = u.id
      LEFT JOIN 
        teacher_student_assignments tsa ON s.id = tsa.student_id AND tsa.teacher_id = $1
      ORDER BY 
        assigned DESC, u.last_name, u.first_name
    `;
    
    const result = await pool.query(query, [teacherId]);
    
    const students = result.rows.map(student => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      assigned: student.assigned
    }));
    
    return NextResponse.json({ students });
  } catch (error: unknown) {
    console.error('Помилка при отриманні списку студентів для викладача:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при отриманні даних' 
    }, { status: 500 });
  }
} 