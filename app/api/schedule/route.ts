import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const teacherId = url.searchParams.get('teacherId');
    const studentId = url.searchParams.get('studentId');
    
    console.log('Запит на отримання розкладу:', { teacherId, studentId });
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    
    if (!teacherId && !studentId) {
      return NextResponse.json(
        { message: 'Необхідно вказати teacherId або studentId' },
        { status: 400 }
      );
    }
    
    let query = `
      SELECT 
        sc.id, 
        sc.start_at, 
        sc.end_at, 
        sc.description,
        sc.is_completed,
        t.id as teacher_id,
        t.user_id as teacher_user_id,
        ut.first_name as teacher_first_name,
        ut.last_name as teacher_last_name,
        s.id as student_id,
        s.user_id as student_user_id,
        us.first_name as student_first_name,
        us.last_name as student_last_name
      FROM schedule_classes sc
      JOIN teachers t ON sc.teacher_id = t.id
      JOIN users ut ON t.user_id = ut.id
      JOIN students s ON sc.student_id = s.id
      JOIN users us ON s.user_id = us.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    if (teacherId) {
      query += ` AND sc.teacher_id = $${paramIndex}`;
      queryParams.push(teacherId);
      paramIndex++;
    }
    
    if (studentId) {
      query += ` AND sc.student_id = $${paramIndex}`;
      queryParams.push(studentId);
      paramIndex++;
    }
    
    query += ' ORDER BY sc.start_at ASC';
    
    console.log('SQL запит:', query, 'з параметрами:', queryParams);
    
    const result = await pool.query(query, queryParams);
    console.log(`Знайдено ${result.rows.length} записів`);
    
    const formattedClasses = result.rows.map(row => ({
      id: row.id,
      startAt: row.start_at,
      endAt: row.end_at,
      description: row.description,
      isCompleted: row.is_completed,
      teacher: {
        id: row.teacher_id,
        userId: row.teacher_user_id,
        name: `${row.teacher_first_name} ${row.teacher_last_name}`
      },
      student: {
        id: row.student_id,
        userId: row.student_user_id,
        name: `${row.student_first_name} ${row.student_last_name}`
      }
    }));
    
    return NextResponse.json({ classes: formattedClasses });
  } catch (error) {
    console.error('Помилка при отриманні розкладу:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { teacherId, studentId, startAt, endAt, description } = await request.json();
    
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
        { message: 'Тільки вчителі можуть створювати заняття' },
        { status: 403 }
      );
    }
    
    if (!teacherId || !studentId || !startAt || !endAt) {
      return NextResponse.json(
        { message: 'Всі поля є обов\'язковими' },
        { status: 400 }
      );
    }
    
    const teacherCheck = await pool.query(
      'SELECT * FROM teachers WHERE id = $1 AND user_id = $2',
      [teacherId, userId]
    );
    
    if (teacherCheck.rows.length === 0) {
      return NextResponse.json(
        { message: 'Ви не маєте прав на створення заняття для цього вчителя' },
        { status: 403 }
      );
    }
    
    const studentCheck = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [studentId]
    );
    
    if (studentCheck.rows.length === 0) {
      return NextResponse.json(
        { message: 'Студента не знайдено' },
        { status: 404 }
      );
    }
    
    const assignmentCheck = await pool.query(
      'SELECT id FROM teacher_student_assignments WHERE teacher_id = $1 AND student_id = $2',
      [teacherId, studentId]
    );
    
    if (assignmentCheck.rows.length === 0) {
      return NextResponse.json(
        { message: 'Ви можете створювати заняття тільки для призначених вам студентів' },
        { status: 403 }
      );
    }
    
    const result = await pool.query(
      `INSERT INTO schedule_classes
        (teacher_id, student_id, start_at, end_at, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [teacherId, studentId, startAt, endAt, description || '']
    );
    
    const newClassId = result.rows[0].id;
    
    return NextResponse.json({
      message: 'Заняття успішно додано',
      classId: newClassId
    });
  } catch (error) {
    console.error('Помилка при створенні заняття:', error);
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