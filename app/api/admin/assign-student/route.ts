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

export async function POST(request: Request) {
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
    
    const { teacherId, studentId, action } = await request.json();
    
    if (!teacherId || !studentId || !action) {
      return NextResponse.json({ 
        message: 'Необхідно вказати ID викладача, ID студента та дію' 
      }, { status: 400 });
    }
    
    if (action !== 'assign' && action !== 'remove') {
      return NextResponse.json({ 
        message: 'Допустимі значення для дії: "assign" або "remove"' 
      }, { status: 400 });
    }
    
    if (action === 'assign') {
      try {
        const query = `
          INSERT INTO teacher_student_assignments (teacher_id, student_id)
          VALUES ($1, $2)
          ON CONFLICT (teacher_id, student_id) DO NOTHING
          RETURNING id
        `;
        
        const result = await pool.query(query, [teacherId, studentId]);
        
        if (result.rowCount === 0) {
          return NextResponse.json({ 
            message: 'Це призначення вже існує' 
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          message: 'Студента успішно призначено викладачу',
          assignmentId: result.rows[0].id
        });
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23503') {
          return NextResponse.json({ 
            message: 'Вказаний студент або викладач не існує' 
          }, { status: 400 });
        }
        throw error;
      }
    } else {
      const query = `
        DELETE FROM teacher_student_assignments
        WHERE teacher_id = $1 AND student_id = $2
        RETURNING id
      `;
      
      const result = await pool.query(query, [teacherId, studentId]);
      
      if (result.rowCount === 0) {
        return NextResponse.json({ 
          message: 'Це призначення не існує' 
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        message: 'Студента успішно відкріплено від викладача' 
      });
    }
  } catch (error: unknown) {
    console.error('Помилка при призначенні студента викладачу:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при обробці запиту' 
    }, { status: 500 });
  }
} 