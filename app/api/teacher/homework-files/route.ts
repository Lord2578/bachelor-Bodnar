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
    
    if (userRole !== 'teacher') {
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
    
    console.log(`Fetching homework files for homeworkId: ${homeworkId}`);
    
    try {
      const filesQuery = `
        SELECT haf.id, haf.file_url, haf.uploaded_at,
               u.first_name || ' ' || u.last_name AS student_name,
               s.id AS student_id
        FROM homework_assignment_files haf
        JOIN homework_assignments ha ON haf.homework_id = ha.id
        JOIN students s ON ha.student_id = s.id
        JOIN users u ON s.user_id = u.id
        WHERE haf.homework_id = $1
        ORDER BY haf.uploaded_at DESC
      `;
      
      const filesResult = await pool.query(filesQuery, [homeworkId]);
      console.log(`Files found (with student data): ${filesResult.rowCount || 0}`);
      
      if (filesResult.rowCount && filesResult.rowCount > 0) {
        return NextResponse.json({
          files: filesResult.rows
        });
      }
      
      console.log("No files found with student join, trying simpler query");
      const simpleQuery = `
        SELECT id, file_url, uploaded_at
        FROM homework_assignment_files
        WHERE homework_id = $1
      `;
      const simpleResult = await pool.query(simpleQuery, [homeworkId]);
      const fileCount = simpleResult.rowCount || 0;
      console.log(`Simple query files found: ${fileCount}`);
      
      if (fileCount > 0) {
        return NextResponse.json({
          files: simpleResult.rows.map(file => ({
            ...file,
            student_name: 'Невідомий учень', 
            student_id: null
          }))
        });
      }
      
      return NextResponse.json({
        files: []
      });
      
    } catch (dbError) {
      console.error("Database error when fetching homework files:", dbError);
      throw new Error(`Помилка бази даних: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
    
  } catch (error: unknown) {
    console.error('Помилка при отриманні файлів для домашнього завдання:', error);
    return NextResponse.json({ 
      message: 'Помилка при отриманні файлів для домашнього завдання',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 