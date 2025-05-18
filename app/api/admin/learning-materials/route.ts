import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT m.*, CONCAT(u.first_name, ' ', u.last_name) as admin_name
      FROM learning_materials m
      LEFT JOIN admin a ON m.uploaded_by_admin_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY m.uploaded_at DESC
    `);

    return NextResponse.json({ materials: result.rows });
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning materials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, description, fileUrl, type } = data;

    if (!title || !description || !fileUrl || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO learning_materials (title, description, file_url, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, fileUrl, type]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating learning material:', error);
    return NextResponse.json(
      { error: 'Failed to create learning material' },
      { status: 500 }
    );
  }
} 