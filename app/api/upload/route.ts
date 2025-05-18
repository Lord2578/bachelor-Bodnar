import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import pool from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCookies(cookieHeader: string | null) {
  const cookies: { [key: string]: string } = {};
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) cookies[name] = value;
  });
  
  return cookies;
}

export async function POST(request: NextRequest) {
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
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const referenceId = formData.get('referenceId') as string;
    
    console.log(`File upload request - Type: ${type}, ReferenceId: ${referenceId}`);
    
    if (!file) {
      return NextResponse.json({
        message: 'Файл не знайдено'
      }, { status: 400 });
    }
    
    if (!type) {
      return NextResponse.json({
        message: 'Тип файлу не вказано'
      }, { status: 400 });
    }
    
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${type}/${fileName}`;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);
      
      const { error } = await supabase
        .storage
        .from('uploads')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Помилка при завантаженні файлу:', error);
        throw new Error(error.message);
      }
      
      const { data: { publicUrl } } = supabase
        .storage
        .from('uploads')
        .getPublicUrl(filePath);
      
      console.log(`Файл успішно завантажено, URL: ${publicUrl}`);
      
      let result;
      
      switch (type) {
        case 'homework':
          if (!referenceId) {
            return NextResponse.json({
              message: 'ID домашнього завдання не вказано'
            }, { status: 400 });
          }
          
          result = await pool.query(
            'INSERT INTO homework_assignment_files (homework_id, file_url) VALUES ($1, $2) RETURNING id',
            [referenceId, publicUrl]
          );
          break;
          
        case 'learning_material':
          if (!description) {
            return NextResponse.json({
              message: 'Опис навчального матеріалу не вказано'
            }, { status: 400 });
          }
          
          const title = formData.get('title') as string;
          
          if (!title) {
            return NextResponse.json({
              message: 'Назва навчального матеріалу не вказана'
            }, { status: 400 });
          }
          
          const adminResult = await pool.query('SELECT id FROM admin WHERE user_id = $1', [userId]);
          
          if (adminResult.rows.length === 0) {
            return NextResponse.json({
              message: 'Користувач не є адміністратором'
            }, { status: 403 });
          }
          
          const adminId = adminResult.rows[0].id;
          
          result = await pool.query(
            'INSERT INTO learning_materials (title, description, file_url, uploaded_by_admin_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [title, description, publicUrl, adminId]
          );
          break;
          
        case 'teacher_certificate':
          const teacherResult = await pool.query('SELECT id FROM teachers WHERE user_id = $1', [userId]);
          
          if (teacherResult.rows.length === 0) {
            return NextResponse.json({
              message: 'Користувач не є викладачем'
            }, { status: 403 });
          }
          
          const teacherId = teacherResult.rows[0].id;
          
          result = await pool.query(
            'INSERT INTO teacher_certificates (teacher_id, file_url, description) VALUES ($1, $2, $3) RETURNING id',
            [teacherId, publicUrl, description || null]
          );
          break;
          
        case 'user_file':
          result = await pool.query(
            'INSERT INTO user_files (user_id, file_url, description) VALUES ($1, $2, $3) RETURNING id',
            [userId, publicUrl, description || null]
          );
          break;
          
        default:
          return NextResponse.json({
            message: 'Невідомий тип файлу'
          }, { status: 400 });
      }
      
      return NextResponse.json({
        message: 'Файл успішно завантажено',
        fileUrl: publicUrl,
        id: result.rows[0].id
      });
    } catch (uploadError) {
      console.error('Помилка при завантаженні файлу в Supabase Storage:', uploadError);
      return NextResponse.json({
        message: 'Помилка при завантаженні файлу в хмарне сховище',
        error: uploadError instanceof Error ? uploadError.message : String(uploadError)
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Помилка при завантаженні файлу:', error);
    return NextResponse.json({
      message: 'Помилка при завантаженні файлу',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 