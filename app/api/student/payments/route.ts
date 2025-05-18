import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { parseCookies } from '@/lib/utils';

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
    
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    
    let query = `
      SELECT 
        sp.id,
        sp.student_id,
        sp.lessons_paid,
        sp.amount,
        sp.paid_at,
        sp.confirmed_by_admin,
        u.first_name,
        u.last_name,
        u.email
      FROM 
        student_payments sp
      JOIN 
        students s ON sp.student_id = s.id
      JOIN 
        users u ON s.user_id = u.id
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    if (studentId) {
      query += ` WHERE sp.student_id = $${paramIndex}`;
      queryParams.push(studentId);
      paramIndex++;
    } 
    else if (userRole === 'student') {
      const studentIdQuery = 'SELECT id FROM students WHERE user_id = $1';
      const studentResult = await pool.query(studentIdQuery, [userId]);
      
      if (studentResult.rows.length === 0) {
        return NextResponse.json({ message: 'Студента не знайдено' }, { status: 404 });
      }
      
      const studentIdFromUserId = studentResult.rows[0].id;
      query += ` WHERE sp.student_id = $${paramIndex}`;
      queryParams.push(studentIdFromUserId);
      paramIndex++;
    }
    
    query += ' ORDER BY sp.paid_at DESC';
    
    const result = await pool.query(query, queryParams);
    
    const payments = result.rows.map(payment => ({
      id: payment.id,
      studentId: payment.student_id,
      studentName: `${payment.first_name} ${payment.last_name}`,
      studentEmail: payment.email,
      lessonsPaid: payment.lessons_paid,
      amount: payment.amount,
      paidAt: payment.paid_at,
      confirmed: payment.confirmed_by_admin
    }));
    
    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Помилка при отриманні платежів:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;
    const userRole = cookieMap.userRole;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    
    if (userRole !== 'student' && userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Недостатньо прав для цієї дії' },
        { status: 403 }
      );
    }
    
    const { studentId, lessonsPaid, amount } = await request.json();
    
    if (!lessonsPaid || lessonsPaid <= 0) {
      return NextResponse.json(
        { message: 'Кількість оплачених уроків має бути більше 0' },
        { status: 400 }
      );
    }
    
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Сума оплати має бути більше 0' },
        { status: 400 }
      );
    }
    
    let paymentStudentId = studentId;
    
    if (userRole === 'student') {
      const studentIdQuery = 'SELECT id FROM students WHERE user_id = $1';
      const studentResult = await pool.query(studentIdQuery, [userId]);
      
      if (studentResult.rows.length === 0) {
        return NextResponse.json({ message: 'Студента не знайдено' }, { status: 404 });
      }
      
      paymentStudentId = studentResult.rows[0].id;
      
      if (studentId && studentId != paymentStudentId) {
        return NextResponse.json(
          { message: 'Ви можете створювати оплату тільки для себе' },
          { status: 403 }
        );
      }
    } else if (!paymentStudentId) {
      return NextResponse.json({ message: 'ID студента є обов\'язковим параметром' }, { status: 400 });
    }
    
    const confirmed = userRole === 'admin';
    const result = await pool.query(
      `INSERT INTO student_payments (student_id, lessons_paid, amount, confirmed_by_admin)
       VALUES ($1, $2, $3, $4)
       RETURNING id, paid_at`,
      [paymentStudentId, lessonsPaid, amount, confirmed]
    );
    
    return NextResponse.json({
      message: 'Оплату успішно додано',
      paymentId: result.rows[0].id,
      paidAt: result.rows[0].paid_at,
      confirmed
    });
  } catch (error) {
    console.error('Помилка при створенні оплати:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 