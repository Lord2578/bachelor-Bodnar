import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { format, startOfMonth, endOfMonth } from 'date-fns';

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const teacherId = url.searchParams.get('teacherId');
    const month = url.searchParams.get('month') || format(new Date(), 'yyyy-MM');
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;
    const userRole = cookieMap.userRole;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      if (!teacherId) {
        const teacherResult = await pool.query(
          'SELECT id FROM teachers WHERE user_id = $1',
          [userId]
        );
        
        if (teacherResult.rows.length === 0) {
          return NextResponse.json(
            { message: 'Ви не маєте доступу до цих даних' },
            { status: 403 }
          );
        }
        
        const currentTeacherId = teacherResult.rows[0].id;
        
        const existingPayout = await pool.query(
          'SELECT * FROM teacher_payouts WHERE teacher_id = $1 AND month_year = $2',
          [currentTeacherId, month]
        );
        
        if (existingPayout.rows.length > 0) {
          return NextResponse.json({ payout: existingPayout.rows[0] });
        }
        
        const result = await calculatePayoutForTeacher(currentTeacherId, month);
        return NextResponse.json({ payout: result });
      } else if (userRole === 'teacher') {
        const teacherCheck = await pool.query(
          'SELECT id FROM teachers WHERE id = $1 AND user_id = $2',
          [teacherId, userId]
        );
        
        if (teacherCheck.rows.length === 0) {
          return NextResponse.json(
            { message: 'Ви можете переглядати лише свої дані' },
            { status: 403 }
          );
        }
      }
    }
    
    if (userRole === 'admin' && !teacherId) {
      const allPayoutsResult = await pool.query(
        `SELECT tp.*, 
          t.id as teacher_id,
          u.first_name, 
          u.last_name
        FROM teacher_payouts tp
        JOIN teachers t ON tp.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE tp.month_year = $1
        ORDER BY tp.total_amount DESC`,
        [month]
      );
      
      if (allPayoutsResult.rows.length > 0) {
        return NextResponse.json({ payouts: allPayoutsResult.rows });
      }
      
      const teachersResult = await pool.query('SELECT id FROM teachers');
      const payouts = [];
      
      for (const teacher of teachersResult.rows) {
        const payout = await calculatePayoutForTeacher(teacher.id, month);
        payouts.push(payout);
      }
      
      return NextResponse.json({ payouts });
    }
    
    const existingPayout = await pool.query(
      'SELECT * FROM teacher_payouts WHERE teacher_id = $1 AND month_year = $2',
      [teacherId, month]
    );
    
    if (existingPayout.rows.length > 0) {
      return NextResponse.json({ payout: existingPayout.rows[0] });
    }
    
    const result = await calculatePayoutForTeacher(Number(teacherId), month);
    return NextResponse.json({ payout: result });
    
  } catch (error) {
    console.error('Помилка при отриманні даних про оплату:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

async function calculatePayoutForTeacher(teacherId: number, monthYear: string) {
  try {
    const [year, month] = monthYear.split('-').map(Number);
    
    const startDate = startOfMonth(new Date(year, month - 1));
    
    const endDate = endOfMonth(new Date(year, month - 1));
    
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    
    console.log(`Шукаємо проведені заняття для вчителя ${teacherId} у період з ${formattedStartDate} по ${formattedEndDate}`);
    
    const allLessonsResult = await pool.query(
      `SELECT 
        id, 
        start_at, 
        end_at,
        is_completed
      FROM schedule_classes
      WHERE teacher_id = $1 
      AND start_at >= $2 
      AND start_at <= $3`,
      [teacherId, formattedStartDate, formattedEndDate]
    );
    
    console.log(`Всього знайдено ${allLessonsResult.rows.length} занять для вчителя`);
    console.log('Статуси занять:', allLessonsResult.rows.map(l => ({id: l.id, is_completed: l.is_completed})));
    
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
      console.log(`Заняття ${lesson.id}: тривалість ${durationInHours.toFixed(2)} годин`);
    });
    
    const ratePerHour = 210;
    
    const totalAmount = totalHours * ratePerHour;
    console.log(`Загальна кількість годин: ${totalHours.toFixed(2)}, сума: ${totalAmount.toFixed(2)}`);
    
    const existingPayout = await pool.query(
      'SELECT id FROM teacher_payouts WHERE teacher_id = $1 AND month_year = $2',
      [teacherId, monthYear]
    );
    
    let payoutId;
    
    if (existingPayout.rows.length > 0) {
      payoutId = existingPayout.rows[0].id;
      
      await pool.query(
        `UPDATE teacher_payouts
        SET total_lessons = $1, total_hours = $2, total_amount = $3, calculated_at = CURRENT_TIMESTAMP
        WHERE id = $4`,
        [lessons.length, Number(totalHours), Number(totalAmount), payoutId]
      );
    } else {
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
    }
    
    const updatedPayout = await pool.query(
      'SELECT * FROM teacher_payouts WHERE id = $1',
      [payoutId]
    );
    
    return updatedPayout.rows[0];
  } catch (error) {
    console.error('Помилка при розрахунку зарплати:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { teacherId, month, ratePerHour } = await request.json();
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;
    const userRole = cookieMap.userRole;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Тільки адміністратор може виконувати цю дію' },
        { status: 403 }
      );
    }
    
    const monthToUse = month || format(new Date(), 'yyyy-MM');
    
    const payout = await calculatePayoutForTeacher(teacherId, monthToUse);
    
    if (ratePerHour && ratePerHour !== payout.rate_per_hour) {
      const updatedResult = await pool.query(
        `UPDATE teacher_payouts
        SET rate_per_hour = $1, total_amount = total_hours * $1, calculated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *`,
        [Number(ratePerHour), payout.id]
      );
      
      return NextResponse.json({ 
        message: 'Розрахунок успішно оновлено',
        payout: updatedResult.rows[0]
      });
    }
    
    return NextResponse.json({ 
      message: 'Розрахунок успішно виконано',
      payout
    });
  } catch (error) {
    console.error('Помилка при розрахунку зарплати:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 