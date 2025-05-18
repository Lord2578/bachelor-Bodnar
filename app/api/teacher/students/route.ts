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
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const teacherQuery = `
      SELECT id FROM teachers WHERE user_id = $1
    `;
    const teacherResult = await pool.query(teacherQuery, [userId]);
    
    if (teacherResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Викладача не знайдено' 
      }, { status: 404 });
    }
    
    const teacherId = teacherResult.rows[0].id;
    
    const studentsQuery = `
      SELECT 
        s.id, 
        u.first_name, 
        u.last_name, 
        u.email,
        s.english_level,
        tsa.assigned_at
      FROM 
        teacher_student_assignments tsa
      JOIN 
        students s ON tsa.student_id = s.id
      JOIN 
        users u ON s.user_id = u.id
      WHERE 
        tsa.teacher_id = $1
      ORDER BY 
        u.last_name, u.first_name
    `;
    
    const studentsResult = await pool.query(studentsQuery, [teacherId]);
    
    const students = studentsResult.rows.map(student => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
      firstName: student.first_name,
      lastName: student.last_name,
      email: student.email,
      englishLevel: student.english_level,
      assignedAt: student.assigned_at
    }));
    
    return NextResponse.json({ 
      students,
      teacherId
    });
  } catch (error: unknown) {
    console.error('Помилка при отриманні списку призначених студентів:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при отриманні даних' 
    }, { status: 500 });
  }
} 