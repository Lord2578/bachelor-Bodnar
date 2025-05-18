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
    const { homeworkId, content, link } = body;
    
    console.log('POST - Student Homework Submission - Data:', { homeworkId, studentId, hasContent: !!content, hasLink: !!link });
    
    if (!homeworkId) {
      return NextResponse.json({ 
        message: 'Не вказано ID домашнього завдання' 
      }, { status: 400 });
    }
    
    if (!content && !link) {
      return NextResponse.json({ 
        message: 'Необхідно надати або текст відповіді, або посилання на роботу' 
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
    
    const checkExistingQuery = `
      SELECT id FROM homework_submissions 
      WHERE homework_id = $1 AND student_id = $2
    `;
    const existingResult = await pool.query(checkExistingQuery, [homeworkId, studentId]);
    
    let submissionId;
    
    if (existingResult.rows.length > 0) {
      const updateQuery = `
        UPDATE homework_submissions 
        SET content = $1, link = $2, submitted_at = CURRENT_TIMESTAMP
        WHERE homework_id = $3 AND student_id = $4
        RETURNING id
      `;
      const updateResult = await pool.query(updateQuery, [
        content || null, 
        link || null, 
        homeworkId, 
        studentId
      ]);
      submissionId = updateResult.rows[0].id;
      
      await pool.query(`
        UPDATE homework_assignments 
        SET is_completed = true 
        WHERE id = $1 AND student_id = $2 AND is_completed = false
      `, [homeworkId, studentId]);
      
      return NextResponse.json({ 
        message: 'Відповідь на домашнє завдання оновлено',
        submissionId
      });
    } else {
      const insertQuery = `
        INSERT INTO homework_submissions(
          homework_id, student_id, content, link
        ) VALUES($1, $2, $3, $4)
        RETURNING id
      `;
      const insertResult = await pool.query(insertQuery, [
        homeworkId, 
        studentId, 
        content || null, 
        link || null
      ]);
      submissionId = insertResult.rows[0].id;
      
      await pool.query(`
        UPDATE homework_assignments 
        SET is_completed = true 
        WHERE id = $1 AND student_id = $2
      `, [homeworkId, studentId]);
      
      return NextResponse.json({ 
        message: 'Відповідь на домашнє завдання успішно створено',
        submissionId
      }, { status: 201 });
    }
  } catch (error: unknown) {
    console.error('Помилка при відправці відповіді на домашнє завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при відправці відповіді' 
    }, { status: 500 });
  }
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
    const homeworkId = url.searchParams.get('homeworkId');
    
    let submissionsQuery;
    const queryParams = [studentId];
    
    if (homeworkId) {
      submissionsQuery = `
        SELECT 
          s.id,
          s.homework_id,
          s.submitted_at,
          s.content,
          s.link,
          s.teacher_comment,
          s.grade,
          h.title as homework_title
        FROM 
          homework_submissions s
        JOIN
          homework_assignments h ON s.homework_id = h.id
        WHERE 
          s.student_id = $1 AND
          s.homework_id = $2
        ORDER BY 
          s.submitted_at DESC
      `;
      queryParams.push(homeworkId);
    } else {
      submissionsQuery = `
        SELECT 
          s.id,
          s.homework_id,
          s.submitted_at,
          s.content,
          s.link,
          s.teacher_comment,
          s.grade,
          h.title as homework_title
        FROM 
          homework_submissions s
        JOIN
          homework_assignments h ON s.homework_id = h.id
        WHERE 
          s.student_id = $1
        ORDER BY 
          s.submitted_at DESC
      `;
    }
    
    const submissionsResult = await pool.query(submissionsQuery, queryParams);
    
    const submissions = submissionsResult.rows.map(sub => ({
      id: sub.id,
      homeworkId: sub.homework_id,
      homeworkTitle: sub.homework_title,
      submittedAt: sub.submitted_at,
      content: sub.content,
      link: sub.link,
      teacherComment: sub.teacher_comment,
      grade: sub.grade
    }));
    
    return NextResponse.json({ submissions });
  } catch (error: unknown) {
    console.error('Помилка при отриманні відповідей на домашні завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при отриманні даних' 
    }, { status: 500 });
  }
} 