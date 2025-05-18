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
    
    const teacherQuery = `SELECT id FROM teachers WHERE user_id = $1`;
    const teacherResult = await pool.query(teacherQuery, [userId]);
    
    if (teacherResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Викладача не знайдено' 
      }, { status: 404 });
    }
    
    const teacherId = teacherResult.rows[0].id;
    
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const homeworkId = url.searchParams.get('homeworkId');
    
    let homeworkQuery;
    let queryParams;
    
    if (homeworkId) {
      homeworkQuery = `
        SELECT 
          h.id, 
          h.student_id, 
          h.title, 
          h.description, 
          h.notes, 
          h.due_date, 
          h.is_completed, 
          h.assigned_at,
          h.class_id,
          u.first_name,
          u.last_name,
          u.email
        FROM 
          homework_assignments h
        JOIN
          students s ON h.student_id = s.id
        JOIN
          users u ON s.user_id = u.id
        WHERE 
          h.teacher_id = $1 AND 
          h.id = $2
      `;
      queryParams = [teacherId, homeworkId];
    } else if (studentId) {
      homeworkQuery = `
        SELECT 
          h.id, 
          h.student_id, 
          h.title, 
          h.description, 
          h.notes, 
          h.due_date, 
          h.is_completed, 
          h.assigned_at,
          h.class_id,
          u.first_name,
          u.last_name,
          u.email
        FROM 
          homework_assignments h
        JOIN
          students s ON h.student_id = s.id
        JOIN
          users u ON s.user_id = u.id
        WHERE 
          h.teacher_id = $1 AND 
          h.student_id = $2
        ORDER BY 
          h.due_date DESC, h.assigned_at DESC
      `;
      queryParams = [teacherId, studentId];
    } else {
      homeworkQuery = `
        SELECT 
          h.id, 
          h.student_id, 
          h.title, 
          h.description, 
          h.notes, 
          h.due_date, 
          h.is_completed, 
          h.assigned_at,
          h.class_id,
          u.first_name,
          u.last_name,
          u.email
        FROM 
          homework_assignments h
        JOIN
          students s ON h.student_id = s.id
        JOIN
          users u ON s.user_id = u.id
        WHERE 
          h.teacher_id = $1
        ORDER BY 
          h.due_date DESC, h.assigned_at DESC
      `;
      queryParams = [teacherId];
    }
    
    const homeworkResult = await pool.query(homeworkQuery, queryParams);
    
    return NextResponse.json({ 
      homework: homeworkResult.rows.map(hw => ({
        id: hw.id,
        studentId: hw.student_id,
        studentName: `${hw.first_name} ${hw.last_name}`,
        studentEmail: hw.email,
        title: hw.title,
        description: hw.description,
        notes: hw.notes,
        dueDate: hw.due_date,
        isCompleted: hw.is_completed,
        assignedAt: hw.assigned_at,
        classId: hw.class_id
      }))
    });
    
  } catch (error: unknown) {
    console.error('Помилка при отриманні домашніх завдань:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при отриманні даних' 
    }, { status: 500 });
  }
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
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const teacherQuery = `SELECT id FROM teachers WHERE user_id = $1`;
    const teacherResult = await pool.query(teacherQuery, [userId]);
    
    if (teacherResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Викладача не знайдено' 
      }, { status: 404 });
    }
    
    const teacherId = teacherResult.rows[0].id;
    
    const body = await request.json();
    const { studentId, title, description, notes, dueDate, classId } = body;
    
    if (!studentId || !title) {
      return NextResponse.json({ 
        message: 'Потрібно вказати ID студента та заголовок завдання' 
      }, { status: 400 });
    }
    
    const verifyAssignmentQuery = `
      SELECT 1 FROM teacher_student_assignments 
      WHERE teacher_id = $1 AND student_id = $2
    `;
    const verifyResult = await pool.query(verifyAssignmentQuery, [teacherId, studentId]);
    
    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Цей студент не призначений даному викладачу' 
      }, { status: 400 });
    }
    
    const insertQuery = `
      INSERT INTO homework_assignments(
        teacher_id, student_id, title, description, notes, due_date, class_id
      ) VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, assigned_at
    `;
    
    const insertResult = await pool.query(insertQuery, [
      teacherId, 
      studentId, 
      title, 
      description || null, 
      notes || null, 
      dueDate || null, 
      classId || null
    ]);
    
    const newHomework = insertResult.rows[0];
    
    return NextResponse.json({ 
      message: 'Домашнє завдання успішно створено',
      homework: {
        id: newHomework.id,
        teacherId,
        studentId,
        title,
        description,
        notes,
        dueDate,
        isCompleted: false,
        assignedAt: newHomework.assigned_at,
        classId
      }
    }, { status: 201 });
    
  } catch (error: unknown) {
    console.error('Помилка при створенні домашнього завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при створенні завдання' 
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
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const teacherQuery = `SELECT id FROM teachers WHERE user_id = $1`;
    const teacherResult = await pool.query(teacherQuery, [userId]);
    
    if (teacherResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Викладача не знайдено' 
      }, { status: 404 });
    }
    
    const teacherId = teacherResult.rows[0].id;
    
    const body = await request.json();
    const { homeworkId, title, description, notes, dueDate, isCompleted, classId } = body;
    
    if (!homeworkId) {
      return NextResponse.json({ 
        message: 'Не вказано ID домашнього завдання' 
      }, { status: 400 });
    }
    
    const checkQuery = `
      SELECT id FROM homework_assignments 
      WHERE id = $1 AND teacher_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [homeworkId, teacherId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Домашнє завдання не знайдено або ви не маєте прав для його редагування' 
      }, { status: 404 });
    }
    
    const updateFields = [];
    const queryParams = [];
    let paramCounter = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramCounter++}`);
      queryParams.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramCounter++}`);
      queryParams.push(description);
    }
    
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCounter++}`);
      queryParams.push(notes);
    }
    
    if (dueDate !== undefined) {
      updateFields.push(`due_date = $${paramCounter++}`);
      queryParams.push(dueDate);
    }
    
    if (isCompleted !== undefined) {
      updateFields.push(`is_completed = $${paramCounter++}`);
      queryParams.push(isCompleted);
    }
    
    if (classId !== undefined) {
      updateFields.push(`class_id = $${paramCounter++}`);
      queryParams.push(classId);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ 
        message: 'Не вказано полів для оновлення' 
      }, { status: 400 });
    }
    
    queryParams.push(homeworkId);
    queryParams.push(teacherId);
    
    const updateQuery = `
      UPDATE homework_assignments 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCounter++} AND teacher_id = $${paramCounter}
      RETURNING id, title, description, notes, due_date, is_completed, assigned_at, class_id, student_id
    `;
    
    const updateResult = await pool.query(updateQuery, queryParams);
    
    if (updateResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Не вдалося оновити домашнє завдання' 
      }, { status: 500 });
    }
    
    const updatedHomework = updateResult.rows[0];
    
    return NextResponse.json({ 
      message: 'Домашнє завдання успішно оновлено',
      homework: {
        id: updatedHomework.id,
        teacherId,
        studentId: updatedHomework.student_id,
        title: updatedHomework.title,
        description: updatedHomework.description,
        notes: updatedHomework.notes,
        dueDate: updatedHomework.due_date,
        isCompleted: updatedHomework.is_completed,
        assignedAt: updatedHomework.assigned_at,
        classId: updatedHomework.class_id
      }
    });
    
  } catch (error: unknown) {
    console.error('Помилка при оновленні домашнього завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при оновленні завдання' 
    }, { status: 500 });
  }
} 