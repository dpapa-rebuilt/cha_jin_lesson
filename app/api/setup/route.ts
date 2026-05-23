import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  await sql`
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(20) NOT NULL,
      recurrence_rule JSONB,
      points INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      due_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS completions (
      id SERIAL PRIMARY KEY,
      mission_id INTEGER NOT NULL REFERENCES missions(id),
      status VARCHAR(20) DEFAULT 'pending',
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      approved_at TIMESTAMPTZ
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      type VARCHAR(10) NOT NULL,
      points INTEGER NOT NULL,
      description TEXT,
      completion_id INTEGER REFERENCES completions(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  return NextResponse.json({ ok: true, message: '데이터베이스 준비 완료!' })
}
