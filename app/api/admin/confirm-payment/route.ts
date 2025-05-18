import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { parseCookies } from '@/lib/utils';

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
    
    if (userRole !== 'admin') {
      return NextResponse.json(
        { message: 'Недостатньо прав для цієї дії' },
        { status: 403 }
      );
    }
    
    const { paymentId, confirmed } = await request.json();
    
    if (!paymentId) {
      return NextResponse.json(
        { message: 'ID платежу є обов\'язковим параметром' },
        { status: 400 }
      );
    }
    
    const checkQuery = 'SELECT id FROM student_payments WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [paymentId]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Платіж не знайдено' },
        { status: 404 }
      );
    }
    
    const updateQuery = 'UPDATE student_payments SET confirmed_by_admin = $1 WHERE id = $2';
    await pool.query(updateQuery, [confirmed !== false, paymentId]);
    
    return NextResponse.json({
      message: confirmed !== false 
        ? 'Платіж успішно підтверджено' 
        : 'Підтвердження платежу скасовано',
      paymentId
    });
  } catch (error) {
    console.error('Помилка при підтвердженні платежу:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 