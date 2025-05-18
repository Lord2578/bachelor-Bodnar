/* @ts-nocheck */

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

export async function DELETE(request: any, context: any) {
  try {
    const homeworkId = context.params.id;
    
    if (!homeworkId) {
      return NextResponse.json({ 
        message: 'Не вказано ID домашнього завдання' 
      }, { status: 400 });
    }
    
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
    
    const verifyQuery = `
      SELECT id FROM homework_assignments 
      WHERE id = $1 AND teacher_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [homeworkId, teacherId]);
    
    if (verifyResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Домашнє завдання не знайдено або ви не маєте прав для його видалення' 
      }, { status: 404 });
    }
    
    const deleteQuery = `
      DELETE FROM homework_assignments 
      WHERE id = $1 AND teacher_id = $2
      RETURNING id
    `;
    const deleteResult = await pool.query(deleteQuery, [homeworkId, teacherId]);
    
    if (deleteResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Не вдалося видалити домашнє завдання' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Домашнє завдання успішно видалено',
      id: homeworkId
    });
    
  } catch (error: unknown) {
    console.error('Помилка при видаленні домашнього завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при видаленні завдання' 
    }, { status: 500 });
  }
} 