/* @ts-nocheck */

import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url);
    const homeworkId = searchParams.get('homeworkId');
    
    if (!homeworkId) {
      return NextResponse.json({ 
        message: 'Не вказано ID домашнього завдання' 
      }, { status: 400 });
    }
    
    const studentQuery = 'SELECT id FROM students WHERE user_id = $1';
    const studentResult = await pool.query(studentQuery, [userId]);
    
    if (studentResult.rows.length === 0) {
      return NextResponse.json({ 
        message: 'Учня не знайдено' 
      }, { status: 404 });
    }
    
    const studentId = studentResult.rows[0].id;
    
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
    
    const filesQuery = `
      SELECT id, file_url, uploaded_at
      FROM homework_assignment_files
      WHERE homework_id = $1
      ORDER BY uploaded_at DESC
    `;
    const filesResult = await pool.query(filesQuery, [homeworkId]);
    
    return NextResponse.json({
      files: filesResult.rows
    });
    
  } catch (error: unknown) {
    console.error('Помилка при отриманні файлів для домашнього завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка при отриманні файлів для домашнього завдання',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 