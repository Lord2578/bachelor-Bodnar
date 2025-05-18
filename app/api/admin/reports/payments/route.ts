import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { parseCookies } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    
    const userRole = cookies.userRole;
    
    if (userRole !== 'admin') {
      return NextResponse.json({ 
        message: 'Доступ заборонено' 
      }, { status: 403 });
    }
    
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json({ 
        message: 'Необхідно вказати початкову та кінцеву дату' 
      }, { status: 400 });
    }
    
    const query = `
      SELECT 
        sp.id,
        sp.student_id as "studentId",
        CONCAT(u.first_name, ' ', u.last_name) as "studentName",
        u.email as "studentEmail",
        sp.lessons_paid as "lessonsPaid",
        sp.amount,
        sp.paid_at as "paidAt",
        sp.confirmed_by_admin as "confirmed"
      FROM 
        student_payments sp
      JOIN 
        students s ON sp.student_id = s.id
      JOIN 
        users u ON s.user_id = u.id
      WHERE 
        sp.paid_at::date BETWEEN $1 AND $2
      ORDER BY 
        sp.paid_at DESC
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    
    return NextResponse.json({ 
      payments: result.rows 
    });
    
  } catch (error) {
    console.error('Помилка при отриманні даних про платежі:', error);
    return NextResponse.json({ 
      message: 'Помилка при отриманні даних про платежі',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 