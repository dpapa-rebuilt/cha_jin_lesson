'use server'

import { sql } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ── 어드민 인증 ──────────────────────────────────────

export async function loginAdmin(formData: FormData) {
  const password = formData.get('password') as string
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('admin_token', password, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    redirect('/admin/dashboard')
  }
  redirect('/admin?error=1')
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  redirect('/admin')
}

// ── 미션 ─────────────────────────────────────────────

export async function createMission(formData: FormData) {
  if (!(await isAdmin())) redirect('/admin')

  const title = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const type = formData.get('type') as string
  const points = parseInt(formData.get('points') as string)
  const dueDate = (formData.get('due_date') as string) || null

  let recurrenceRule: object | null = null
  if (type === 'weekly') {
    const dayOfWeek = parseInt(formData.get('day_of_week') as string)
    recurrenceRule = { dayOfWeek }
  } else if (type === 'monthly') {
    const week = formData.get('week') as string
    const dayOfWeek = parseInt(formData.get('day_of_week') as string)
    recurrenceRule = { week, dayOfWeek }
  }

  await sql`
    INSERT INTO missions (title, description, type, recurrence_rule, points, due_date)
    VALUES (
      ${title},
      ${description},
      ${type},
      ${recurrenceRule ? JSON.stringify(recurrenceRule) : null},
      ${points},
      ${dueDate}
    )
  `

  revalidatePath('/')
  revalidatePath('/admin/dashboard')
  redirect('/admin/dashboard')
}

export async function toggleMission(missionId: number, isActive: boolean) {
  if (!(await isAdmin())) redirect('/admin')
  await sql`UPDATE missions SET is_active = ${isActive} WHERE id = ${missionId}`
  revalidatePath('/admin/dashboard')
  revalidatePath('/')
}

// ── 완료 신청 (아이) ───────────────────────────────────

export async function submitCompletion(missionId: number) {
  await sql`
    INSERT INTO completions (mission_id, status)
    VALUES (${missionId}, 'pending')
  `
  revalidatePath('/')
}

// ── 완료 승인 / 거절 (아빠) ────────────────────────────

export async function approveCompletion(completionId: number, points: number) {
  if (!(await isAdmin())) redirect('/admin')

  await sql`
    UPDATE completions
    SET status = 'approved', approved_at = NOW()
    WHERE id = ${completionId}
  `

  await sql`
    INSERT INTO transactions (type, points, description, completion_id)
    VALUES ('earn', ${points}, '미션 완료 보상', ${completionId})
  `

  revalidatePath('/admin/approve')
  revalidatePath('/admin/dashboard')
  revalidatePath('/')
}

export async function rejectCompletion(completionId: number) {
  if (!(await isAdmin())) redirect('/admin')

  await sql`
    UPDATE completions
    SET status = 'rejected'
    WHERE id = ${completionId}
  `

  revalidatePath('/admin/approve')
}

// ── 포인트 사용 (아빠) ────────────────────────────────

export async function spendPoints(formData: FormData) {
  if (!(await isAdmin())) redirect('/admin')

  const description = formData.get('description') as string
  const points = parseInt(formData.get('points') as string)

  await sql`
    INSERT INTO transactions (type, points, description)
    VALUES ('spend', ${points}, ${description})
  `

  revalidatePath('/admin/spend')
  revalidatePath('/admin/dashboard')
  revalidatePath('/')
}
