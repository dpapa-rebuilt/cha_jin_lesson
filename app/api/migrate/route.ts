import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  await sql`ALTER TABLE completions ADD COLUMN IF NOT EXISTS note TEXT`
  await sql`ALTER TABLE completions ADD COLUMN IF NOT EXISTS reject_reason TEXT`
  return NextResponse.json({ ok: true, message: '마이그레이션 완료!' })
}
