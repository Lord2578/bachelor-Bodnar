import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, userType, englishLevel, testScore, birthDate } = body;
    
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ 
        message: 'Необхідно вказати імʼя, прізвище та email' 
      }, { status: 400 });
    }
    
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          user_type VARCHAR(20) NOT NULL,
          english_level VARCHAR(50),
          test_score INTEGER,
          birth_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (tableError) {
      console.error('Error creating leads table:', tableError);
    }
    
    const insertQuery = `
      INSERT INTO leads (
        first_name, 
        last_name, 
        email, 
        phone, 
        user_type, 
        english_level, 
        test_score,
        birth_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const values = [
      firstName,
      lastName,
      email,
      phone || null,
      userType,
      englishLevel || null,
      testScore || null,
      birthDate || null
    ];
    
    const result = await pool.query(insertQuery, values);
    
    return NextResponse.json({ 
      message: 'Дані успішно збережено',
      leadId: result.rows[0].id
    });
    
  } catch (error) {
    console.error('Помилка при збереженні даних:', error);
    return NextResponse.json({ 
      message: 'Помилка при збереженні даних',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=');
      if (name && value) {
        cookies[name.trim()] = decodeURIComponent(value.trim());
      }
    });
    
    const userRole = cookies.userRole;
    
    if (userRole !== 'admin') {
      return NextResponse.json({ 
        message: 'Доступ заборонено' 
      }, { status: 403 });
    }
    
    const query = `
      SELECT * FROM leads
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    return NextResponse.json({ leads: result.rows });
    
  } catch (error) {
    console.error('Помилка при отриманні даних:', error);
    return NextResponse.json({ 
      message: 'Помилка при отриманні даних',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        message: 'ID не вказано' 
      }, { status: 400 });
    }
    
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=');
      if (name && value) {
        cookies[name.trim()] = decodeURIComponent(value.trim());
      }
    });
    
    const userRole = cookies.userRole;
    
    if (userRole !== 'admin') {
      return NextResponse.json({ 
        message: 'Доступ заборонено' 
      }, { status: 403 });
    }
    
    const query = `
      DELETE FROM leads
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ 
        message: 'Заявку не знайдено' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Заявку успішно видалено',
      deletedId: result.rows[0].id
    });
    
  } catch (error) {
    console.error('Помилка при видаленні даних:', error);
    return NextResponse.json({ 
      message: 'Помилка при видаленні даних',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 