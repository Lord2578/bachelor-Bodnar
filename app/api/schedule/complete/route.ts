import { NextResponse } from 'next/server';
import pool from '@/lib/db';

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
    const { classId, isCompleted } = await request.json();
    
    console.log(`Спроба оновити статус заняття: ID=${classId}, isCompleted=${isCompleted}`);
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookieMap = parseCookies(cookieHeader);
    const sessionId = cookieMap.sessionId;
    const userId = cookieMap.userId;
    const userRole = cookieMap.userRole;
    
    if (!sessionId || !userId) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 });
    }
    
    if (!classId) {
      return NextResponse.json(
        { message: 'ID заняття є обов\'язковим параметром' },
        { status: 400 }
      );
    }
    
    const classResult = await pool.query(
      'SELECT * FROM schedule_classes WHERE id = $1',
      [classId]
    );
    
    if (classResult.rows.length === 0) {
      return NextResponse.json(
        { message: 'Заняття не знайдено' },
        { status: 404 }
      );
    }
    
    const classInfo = classResult.rows[0];
    
    if (userRole !== 'admin') {
      if (userRole !== 'teacher') {
        return NextResponse.json(
          { message: 'Тільки вчитель або адміністратор може позначати заняття як завершене' },
          { status: 403 }
        );
      }
      
      const teacherCheck = await pool.query(
        'SELECT * FROM teachers WHERE user_id = $1 AND id = $2',
        [userId, classInfo.teacher_id]
      );
      
      if (teacherCheck.rows.length === 0) {
        return NextResponse.json(
          { message: 'Ви можете позначати тільки свої заняття' },
          { status: 403 }
        );
      }
    }
    
    await pool.query(
      'UPDATE schedule_classes SET is_completed = $1 WHERE id = $2',
      [isCompleted !== false, classId]
    );
    
    console.log(`Статус заняття ID=${classId} оновлено на is_completed=${isCompleted !== false}`);
    
    const verifyResult = await pool.query(
      'SELECT is_completed FROM schedule_classes WHERE id = $1',
      [classId]
    );
    
    if (verifyResult.rows.length > 0) {
      console.log(`Перевірка після оновлення: заняття ID=${classId} має статус is_completed=${verifyResult.rows[0].is_completed}`);
    } else {
      console.log(`Помилка: не вдалося перевірити статус заняття ID=${classId} після оновлення`);
    }
    
    return NextResponse.json({
      message: 'Статус заняття успішно оновлено',
      classId,
      isCompleted: isCompleted !== false
    });
  } catch (error) {
    console.error('Помилка при оновленні статусу заняття:', error);
    return NextResponse.json(
      { message: 'Внутрішня помилка сервера', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 