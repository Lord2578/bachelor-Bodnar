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
    
    let studentId: number;
    
    if (userRole === 'student') {
      const studentIdQuery = 'SELECT id FROM students WHERE user_id = $1';
      const studentIdResult = await pool.query(studentIdQuery, [userId]);
      
      if (studentIdResult.rows.length === 0) {
        return NextResponse.json({ message: 'Студента не знайдено' }, { status: 404 });
      }
      
      studentId = studentIdResult.rows[0].id;
    } else {
      const url = new URL(request.url);
      const studentIdParam = url.searchParams.get('studentId');
      
      if (!studentIdParam) {
        return NextResponse.json(
          { message: 'ID студента є обов\'язковим параметром' },
          { status: 400 }
        );
      }
      
      studentId = parseInt(studentIdParam);
    }
    
    const paymentsQuery = `
      SELECT SUM(lessons_paid) as total_lessons_paid
      FROM student_payments
      WHERE student_id = $1 AND confirmed_by_admin = true
    `;
    const paymentsResult = await pool.query(paymentsQuery, [studentId]);
    const totalLessonsPaid = paymentsResult.rows[0].total_lessons_paid || 0;
    
    const classesQuery = `
      SELECT COUNT(*) as completed_classes
      FROM schedule_classes
      WHERE student_id = $1 AND is_completed = true
    `;
    const classesResult = await pool.query(classesQuery, [studentId]);
    const totalCompletedClasses = parseInt(classesResult.rows[0].completed_classes) || 0;
    
    const remainingLessons = totalLessonsPaid - totalCompletedClasses;
    
    return NextResponse.json({
      studentId,
      totalLessonsPaid,
      totalCompletedClasses,
      remainingLessons,
      showWarning: remainingLessons <= 2 && remainingLessons > 0
    });
    
  } catch (error) {
    console.error('Помилка при отриманні кількості уроків:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 