import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { startOfMonth, endOfMonth } from 'date-fns';

async function calculatePayoutForTeacher(teacherId: number, monthYear: string) {
  try {
    const [year, month] = monthYear.split('-').map(Number);
    
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    
    console.log(`Шукаємо проведені заняття для вчителя ${teacherId} у період з ${formattedStartDate} по ${formattedEndDate}`);
    
    const lessonsResult = await pool.query(
      `SELECT 
        id, 
        start_at, 
        end_at
      FROM schedule_classes
      WHERE teacher_id = $1 
      AND start_at >= $2 
      AND start_at <= $3
      AND is_completed = true`,
      [teacherId, formattedStartDate, formattedEndDate]
    );
    
    const lessons = lessonsResult.rows;
    console.log(`Знайдено ${lessons.length} проведених занять для вчителя ${teacherId}`);
    
    let totalHours = 0;
    
    lessons.forEach(lesson => {
      const startTime = new Date(lesson.start_at);
      const endTime = new Date(lesson.end_at);
      const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      totalHours += durationInHours;
    });
    
    const ratePerHour = 210;
    const totalAmount = totalHours * ratePerHour;
    
    const result = await pool.query(
      `INSERT INTO teacher_payouts
        (teacher_id, month_year, total_lessons, total_hours, rate_per_hour, total_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        teacherId, 
        monthYear, 
        lessons.length, 
        Number(totalHours), 
        Number(ratePerHour), 
        Number(totalAmount)
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Помилка при розрахунку зарплати:', error);
    throw error;
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

export async function POST(request: Request) {
  try {
    console.log('Запит на примусовий перерахунок зарплати');
    
    const { teacherId, month } = await request.json();
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;
    const userRole = cookieMap.userRole;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    
    if (userRole !== 'admin' && userRole !== 'teacher') {
      return NextResponse.json(
        { message: 'Недостатньо прав для виконання дії' },
        { status: 403 }
      );
    }
    
    if (userRole === 'teacher') {
      const teacherResult = await pool.query(
        'SELECT id FROM teachers WHERE user_id = $1',
        [userId]
      );
      
      if (teacherResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'Вчителя не знайдено' },
          { status: 404 }
        );
      }
      
      const currentTeacherId = teacherResult.rows[0].id;
      
      if (teacherId && Number(teacherId) !== currentTeacherId) {
        return NextResponse.json(
          { message: 'Ви можете оновлювати тільки свої дані' },
          { status: 403 }
        );
      }
      
      const teacherIdToUse = teacherId || currentTeacherId;
      
      console.log(`Примусовий перерахунок для вчителя ID=${teacherIdToUse}, місяць=${month}`);
      
      await pool.query(
        'DELETE FROM teacher_payouts WHERE teacher_id = $1 AND month_year = $2',
        [teacherIdToUse, month]
      );
      
      const payout = await calculatePayoutForTeacher(Number(teacherIdToUse), month);
      
      return NextResponse.json({
        message: 'Розрахунок зарплати успішно оновлено',
        payout
      });
    }
    
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Необхідно вказати ID вчителя' },
        { status: 400 }
      );
    }
    
    console.log(`Адміністратор виконує перерахунок для вчителя ID=${teacherId}, місяць=${month}`);
    
    await pool.query(
      'DELETE FROM teacher_payouts WHERE teacher_id = $1 AND month_year = $2',
      [teacherId, month]
    );
    
    const payout = await calculatePayoutForTeacher(Number(teacherId), month);
    
    return NextResponse.json({
      message: 'Розрахунок зарплати успішно оновлено',
      payout
    });
    
  } catch (error) {
    console.error('Помилка при перерахунку зарплати:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 