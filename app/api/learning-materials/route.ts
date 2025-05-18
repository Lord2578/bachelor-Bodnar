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
    
    if (!sessionId || !userId) {
      return NextResponse.json({ 
        message: 'Необхідна авторизація' 
      }, { status: 401 });
    }
    
    const query = `
      SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) as admin_name
      FROM learning_materials m
      LEFT JOIN admin a ON m.uploaded_by_admin_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY m.uploaded_at DESC
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({
      materials: result.rows
    });
    
  } catch (error: unknown) {
    console.error('Помилка при отриманні навчальних матеріалів:', error);
    return NextResponse.json({ 
      message: 'Помилка при отриманні навчальних матеріалів',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 