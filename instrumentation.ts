export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { sql } = await import('@/lib/db')
      await sql`ALTER TABLE completions ADD COLUMN IF NOT EXISTS note TEXT`
      await sql`ALTER TABLE completions ADD COLUMN IF NOT EXISTS reject_reason TEXT`
    } catch {
      // 테이블이 아직 없으면 무시 (setup 라우트에서 생성됨)
    }
  }
}
