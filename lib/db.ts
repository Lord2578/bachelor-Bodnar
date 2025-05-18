import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgresql://postgres.atizlbtmkrxyugqdgrcg:bodnar25@aws-0-eu-north-1.pooler.supabase.com:5432/postgres',
  ssl: {
    rejectUnauthorized: false,
  },
})

export default pool