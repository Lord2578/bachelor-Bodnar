import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { encrypt3DES } from '@/lib/crypto';

function parseCookies(cookieHeader: string | null) {
  const cookies: { [key: string]: string } = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) cookies[name] = value;
  });
  
  return cookies;
}

export async function POST(request: Request) {
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
    
    if (userRole !== 'admin') {
      return NextResponse.json({ 
        message: 'Недостатньо прав для цієї дії' 
      }, { status: 403 });
    }
    
    const {
      email,
      password,
      firstName,
      lastName,
      birthDate,
      phoneNumber,
      role,
      englishLevel,
      experience,
      certificates
    } = await request.json();
    
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ 
        message: 'Необхідно заповнити всі обов\'язкові поля' 
      }, { status: 400 });
    }
    
    const checkEmailQuery = 'SELECT id FROM users WHERE email = $1';
    const emailResult = await pool.query(checkEmailQuery, [email]);
    
    if (emailResult.rows.length > 0) {
      return NextResponse.json({ 
        message: 'Користувач з таким email вже існує' 
      }, { status: 400 });
    }
    
    const encryptedPassword = encrypt3DES(password);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertUserQuery = `
        INSERT INTO users (
          email, 
          password_hash, 
          first_name, 
          last_name, 
          birth_date, 
          role, 
          phone_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      
      const userResult = await client.query(insertUserQuery, [
        email,
        encryptedPassword, 
        firstName,
        lastName,
        birthDate || null,
        role,
        phoneNumber || null
      ]);
      
      const newUserId = userResult.rows[0].id;
      
      if (role === 'student') {
        const currentDate = new Date().toISOString().split('T')[0]; 
        
        const insertStudentQuery = `
          INSERT INTO students (
            user_id, 
            english_level,
            phone_number,
            enrollment_date
          ) VALUES ($1, $2, $3, $4)
          RETURNING id
        `;
        
        await client.query(insertStudentQuery, [
          newUserId,
          englishLevel || null,
          phoneNumber || null,
          currentDate
        ]);
      }
      
      if (role === 'teacher') {
        const insertTeacherQuery = `
          INSERT INTO teachers (
            user_id, 
            english_level, 
            experience, 
            certificates
          ) VALUES ($1, $2, $3, $4)
          RETURNING id
        `;
        
        await client.query(insertTeacherQuery, [
          newUserId,
          englishLevel || null,
          experience || null,
          certificates || null
        ]);
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        message: `Користувач успішно створений з роллю: ${role}`,
        userId: newUserId
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Помилка при створенні користувача:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Помилка при обробці запиту створення користувача:', error);
    return NextResponse.json({ 
      message: 'Помилка сервера при створенні користувача' 
    }, { status: 500 });
  }
} 