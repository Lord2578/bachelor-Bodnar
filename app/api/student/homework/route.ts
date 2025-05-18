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
    
    if (userRole !== 'student') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const studentQuery = `SELECT id FROM students WHERE user_id = $1`;
    const studentResult = await pool.query(studentQuery, [userId]);
    
    if (studentResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Учня не знайдено' 
      }, { status: 404 });
    }
    
    const studentId = studentResult.rows[0].id;
    
    const url = new URL(request.url);
    const showAll = url.searchParams.get('showAll') === 'true';
    const homeworkId = url.searchParams.get('homeworkId');
    
    console.log('API - Student Homework - Params:', { studentId, homeworkId, showAll });
    
    let homeworkQuery;
    const queryParams = [studentId];
    
    if (homeworkId) {
      homeworkQuery = `
        SELECT 
          h.id, 
          h.title, 
          h.description, 
          h.notes, 
          h.due_date, 
          h.is_completed, 
          h.assigned_at,
          t.id as teacher_id,
          u.first_name as teacher_first_name,
          u.last_name as teacher_last_name
        FROM 
          homework_assignments h
        JOIN 
          teachers t ON h.teacher_id = t.id
        JOIN 
          users u ON t.user_id = u.id
        WHERE 
          h.student_id = $1 AND
          h.id = $2
      `;
      queryParams.push(homeworkId);
    } else if (showAll) {
      homeworkQuery = `
        SELECT 
          h.id, 
          h.title, 
          h.description, 
          h.notes, 
          h.due_date, 
          h.is_completed, 
          h.assigned_at,
          t.id as teacher_id,
          u.first_name as teacher_first_name,
          u.last_name as teacher_last_name
        FROM 
          homework_assignments h
        JOIN 
          teachers t ON h.teacher_id = t.id
        JOIN 
          users u ON t.user_id = u.id
        WHERE 
          h.student_id = $1
        ORDER BY 
          h.is_completed ASC,
          h.due_date ASC,
          h.assigned_at DESC
      `;
    } else {
      homeworkQuery = `
        SELECT 
          h.id, 
          h.title, 
          h.description, 
          h.notes, 
          h.due_date, 
          h.is_completed, 
          h.assigned_at,
          t.id as teacher_id,
          u.first_name as teacher_first_name,
          u.last_name as teacher_last_name
        FROM 
          homework_assignments h
        JOIN 
          teachers t ON h.teacher_id = t.id
        JOIN 
          users u ON t.user_id = u.id
        WHERE 
          h.student_id = $1 AND
          h.is_completed = false
        ORDER BY 
          h.due_date ASC,
          h.assigned_at DESC
      `;
    }
    
    const homeworkResult = await pool.query(homeworkQuery, queryParams);
    
    const homework = homeworkResult.rows.map(hw => ({
      id: hw.id,
      title: hw.title,
      description: hw.description,
      notes: hw.notes,
      dueDate: hw.due_date,
      isCompleted: hw.is_completed,
      assignedAt: hw.assigned_at,
      teacher: {
        id: hw.teacher_id,
        name: `${hw.teacher_first_name} ${hw.teacher_last_name}`
      }
    }));
    
    return NextResponse.json({ homework });
  } catch (error: unknown) {
    console.error('Помилка при отриманні домашніх завдань для учня:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при отриманні даних' 
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    
    if (userRole !== 'student') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const studentQuery = `SELECT id FROM students WHERE user_id = $1`;
    const studentResult = await pool.query(studentQuery, [userId]);
    
    if (studentResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Учня не знайдено' 
      }, { status: 404 });
    }
    
    const studentId = studentResult.rows[0].id;
    
    const body = await request.json();
    const { homeworkId, isCompleted } = body;
    
    if (!homeworkId) {
      return NextResponse.json({ 
        message: 'Не вказано ID домашнього завдання' 
      }, { status: 400 });
    }
    
    if (isCompleted === undefined) {
      return NextResponse.json({ 
        message: 'Не вказано статус виконання завдання' 
      }, { status: 400 });
    }
    
    const verifyQuery = `
      SELECT id FROM homework_assignments 
      WHERE id = $1 AND student_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [homeworkId, studentId]);
    
    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Домашнє завдання не знайдено або не належить цьому учню' 
      }, { status: 404 });
    }
    
    const updateQuery = `
      UPDATE homework_assignments 
      SET is_completed = $1 
      WHERE id = $2 AND student_id = $3
      RETURNING id, title, is_completed
    `;
    
    const updateResult = await pool.query(updateQuery, [isCompleted, homeworkId, studentId]);
    
    if (updateResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Не вдалося оновити статус домашнього завдання' 
      }, { status: 500 });
    }
    
    const updatedHomework = updateResult.rows[0];
    
    return NextResponse.json({ 
      message: isCompleted 
        ? 'Домашнє завдання позначено як виконане' 
        : 'Домашнє завдання позначено як невиконане',
      homework: {
        id: updatedHomework.id,
        title: updatedHomework.title,
        isCompleted: updatedHomework.is_completed
      }
    });
    
  } catch (error: unknown) {
    console.error('Помилка при оновленні статусу домашнього завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при оновленні статусу' 
    }, { status: 500 });
  }
} 