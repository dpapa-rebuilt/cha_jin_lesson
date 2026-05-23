import { sql } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, ctx: RouteContext<'/api/missions/[id]'>) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await ctx.params
  const rows = await sql`SELECT * FROM missions WHERE id = ${id}`
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}
