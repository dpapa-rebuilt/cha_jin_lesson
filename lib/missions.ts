export type MissionType = 'once' | 'daily' | 'weekly' | 'monthly'

export interface Mission {
  id: number
  title: string
  description: string | null
  type: MissionType
  recurrence_rule: { dayOfWeek?: number; week?: string | number } | null
  points: number
  is_active: boolean
  due_date: string | null
  created_at: string
}

export interface Completion {
  id: number
  mission_id: number
  status: 'pending' | 'approved' | 'rejected'
  completed_at: string
  approved_at: string | null
}

export interface Transaction {
  id: number
  type: 'earn' | 'spend'
  points: number
  description: string | null
  completion_id: number | null
  created_at: string
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isSameWeek(a: Date, b: Date) {
  const startOfWeek = (d: Date) => {
    const day = d.getDay()
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day)
  }
  return isSameDay(startOfWeek(a), startOfWeek(b))
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function isLastWeekday(date: Date, targetDay: number): boolean {
  if (date.getDay() !== targetDay) return false
  const nextWeek = new Date(date)
  nextWeek.setDate(date.getDate() + 7)
  return nextWeek.getMonth() !== date.getMonth()
}

function getNthWeekday(date: Date, n: number, targetDay: number): boolean {
  if (date.getDay() !== targetDay) return false
  const weekOfMonth = Math.ceil(date.getDate() / 7)
  return weekOfMonth === n
}

export function isMissionActiveToday(mission: Mission): boolean {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const rule = mission.recurrence_rule

  switch (mission.type) {
    case 'daily':
      return true
    case 'weekly':
      return rule?.dayOfWeek === dayOfWeek
    case 'monthly':
      if (!rule) return false
      if (rule.week === 'last') return isLastWeekday(today, rule.dayOfWeek ?? 0)
      return getNthWeekday(today, Number(rule.week), rule.dayOfWeek ?? 0)
    case 'once': {
      if (!mission.due_date) return true
      const due = new Date(mission.due_date)
      due.setHours(23, 59, 59)
      return due >= today
    }
    default:
      return false
  }
}

export function findCompletion(
  completions: Completion[],
  mission: Mission,
): Completion | null {
  const today = new Date()
  return completions.find((c) => {
    if (c.mission_id !== mission.id) return false
    const at = new Date(c.completed_at)
    switch (mission.type) {
      case 'daily':   return isSameDay(at, today)
      case 'weekly':  return isSameWeek(at, today)
      case 'monthly': return isSameMonth(at, today)
      case 'once':    return true
    }
  }) ?? null
}

export function missionTypeLabel(type: MissionType): string {
  const map: Record<MissionType, string> = {
    once: '1회성',
    daily: '매일',
    weekly: '매주',
    monthly: '매월',
  }
  return map[type]
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const WEEKS: Record<string, string> = {
  '1': '첫째 주', '2': '둘째 주', '3': '셋째 주', '4': '넷째 주', last: '마지막 주',
}

export function recurrenceLabel(mission: Mission): string {
  const rule = mission.recurrence_rule
  if (!rule) return ''
  if (mission.type === 'weekly') return `매주 ${DAYS[rule.dayOfWeek ?? 0]}요일`
  if (mission.type === 'monthly')
    return `매월 ${WEEKS[String(rule.week)] ?? ''} ${DAYS[rule.dayOfWeek ?? 0]}요일`
  return ''
}
