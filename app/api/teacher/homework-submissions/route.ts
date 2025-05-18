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
    const homeworkId = url.searchParams.get('homeworkId');
    const studentId = url.searchParams.get('studentId');
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : null;
    
    let query;
    const params = [teacherId];
    
    if (homeworkId) {
      query = `
        SELECT 
          s.id,
          s.homework_id,
          s.student_id,
          s.submitted_at,
          s.content,
          s.link,
          s.teacher_comment,
          s.grade,
          h.title as homework_title,
          h.description as homework_description,
          h.due_date,
          u.first_name,
          u.last_name,
          u.email
        FROM 
          homework_submissions s
        JOIN
          homework_assignments h ON s.homework_id = h.id
        JOIN
          students st ON s.student_id = st.id
        JOIN
          users u ON st.user_id = u.id
        WHERE 
          h.teacher_id = $1 AND
          s.homework_id = $2
      `;
      params.push(homeworkId);
      
      if (studentId) {
        query += ` AND s.student_id = $3`;
        params.push(studentId);
      }
      
      query += ` ORDER BY s.submitted_at DESC`;
    } else if (studentId) {
      query = `
        SELECT 
          s.id,
          s.homework_id,
          s.student_id,
          s.submitted_at,
          s.content,
          s.link,
          s.teacher_comment,
          s.grade,
          h.title as homework_title,
          h.description as homework_description,
          h.due_date,
          u.first_name,
          u.last_name,
          u.email
        FROM 
          homework_submissions s
        JOIN
          homework_assignments h ON s.homework_id = h.id
        JOIN
          students st ON s.student_id = st.id
        JOIN
          users u ON st.user_id = u.id
        WHERE 
          h.teacher_id = $1 AND
          s.student_id = $2
        ORDER BY 
          s.submitted_at DESC
      `;
      params.push(studentId);
    } else {
      query = `
        SELECT 
          s.id,
          s.homework_id,
          s.student_id,
          s.submitted_at,
          s.content,
          s.link,
          s.teacher_comment,
          s.grade,
          h.title as homework_title,
          h.description as homework_description,
          h.due_date,
          u.first_name,
          u.last_name,
          u.email
        FROM 
          homework_submissions s
        JOIN
          homework_assignments h ON s.homework_id = h.id
        JOIN
          students st ON s.student_id = st.id
        JOIN
          users u ON st.user_id = u.id
        WHERE 
          h.teacher_id = $1
        ORDER BY 
          s.submitted_at DESC
      `;
    }
    
    if (limit !== null && !isNaN(limit) && limit > 0) {
      query += ` LIMIT ${limit}`;
    }
    
    const result = await pool.query(query, params);
    
    const submissions = result.rows.map(row => ({
      id: row.id,
      homeworkId: row.homework_id,
      studentId: row.student_id,
      studentName: `${row.first_name} ${row.last_name}`,
      studentEmail: row.email,
      homeworkTitle: row.homework_title,
      homeworkDescription: row.homework_description,
      dueDate: row.due_date,
      submittedAt: row.submitted_at,
      content: row.content,
      link: row.link,
      teacherComment: row.teacher_comment,
      grade: row.grade
    }));
    
    return NextResponse.json({ submissions });
    
  } catch (error: unknown) {
    console.error('Помилка при отриманні відповідей на домашні завдання:', error);
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
    const { submissionId, teacherComment, grade } = body;
    
    if (!submissionId) {
      return NextResponse.json({ 
        message: 'Не вказано ID відповіді на домашнє завдання' 
      }, { status: 400 });
    }
    
    const verifyQuery = `
      SELECT 
        s.id,
        h.teacher_id
      FROM 
        homework_submissions s
      JOIN
        homework_assignments h ON s.homework_id = h.id
      WHERE 
        s.id = $1
    `;
    
    const verifyResult = await pool.query(verifyQuery, [submissionId]);
    
    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Відповідь на домашнє завдання не знайдено' 
      }, { status: 404 });
    }
    
    if (verifyResult.rows[0].teacher_id !== teacherId) {
      return NextResponse.json({ 
        message: 'У вас немає прав для оцінювання цього завдання' 
      }, { status: 403 });
    }
    
    const updateQuery = `
      UPDATE homework_submissions
      SET 
        teacher_comment = $1,
        grade = $2
      WHERE 
        id = $3
      RETURNING id, homework_id, student_id, submitted_at, content, link, teacher_comment, grade
    `;
    
    const updateResult = await pool.query(updateQuery, [
      teacherComment || null,
      grade || null,
      submissionId
    ]);
    
    const updatedSubmission = updateResult.rows[0];
    
    return NextResponse.json({ 
      message: 'Відповідь на домашнє завдання успішно оцінено',
      submission: {
        id: updatedSubmission.id,
        homeworkId: updatedSubmission.homework_id,
        studentId: updatedSubmission.student_id,
        submittedAt: updatedSubmission.submitted_at,
        content: updatedSubmission.content,
        link: updatedSubmission.link,
        teacherComment: updatedSubmission.teacher_comment,
        grade: updatedSubmission.grade
      }
    });
    
  } catch (error: unknown) {
    console.error('Помилка при оцінюванні домашнього завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при оцінюванні завдання' 
    }, { status: 500 });
  }
} 