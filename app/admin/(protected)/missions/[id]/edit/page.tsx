'use client'

import { useState, useTransition } from 'react'
import { updateMission } from '@/app/actions'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const DAYS = [
  { value: '0', label: '일요일' },
  { value: '1', label: '월요일' },
  { value: '2', label: '화요일' },
  { value: '3', label: '수요일' },
  { value: '4', label: '목요일' },
  { value: '5', label: '금요일' },
  { value: '6', label: '토요일' },
]

const WEEKS = [
  { value: '1', label: '첫째 주' },
  { value: '2', label: '둘째 주' },
  { value: '3', label: '셋째 주' },
  { value: '4', label: '넷째 주' },
  { value: 'last', label: '마지막 주' },
]

interface MissionData {
  id: number
  title: string
  description: string | null
  type: string
  recurrence_rule: { dayOfWeek?: number; week?: string } | null
  points: number
  due_date: string | null
}

function EditForm({ mission }: { mission: MissionData }) {
  const [type, setType] = useState(mission.type)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(() => updateMission(mission.id, formData))
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">미션 이름 *</label>
        <input
          name="title"
          required
          defaultValue={mission.title}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">설명 (선택)</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={mission.description ?? ''}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">미션 종류 *</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'daily', label: '매일' },
            { value: 'weekly', label: '매주' },
            { value: 'monthly', label: '매월' },
            { value: 'once', label: '1회성' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`py-2.5 rounded-xl font-semibold text-sm border transition ${
                type === opt.value
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="type" value={type} />
      </div>

      {type === 'weekly' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">요일 선택 *</label>
          <select
            name="day_of_week"
            defaultValue={String(mission.recurrence_rule?.dayOfWeek ?? 0)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
          >
            {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      )}

      {type === 'monthly' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">주 선택 *</label>
            <select
              name="week"
              defaultValue={String(mission.recurrence_rule?.week ?? '1')}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
            >
              {WEEKS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">요일 선택 *</label>
            <select
              name="day_of_week"
              defaultValue={String(mission.recurrence_rule?.dayOfWeek ?? 0)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
            >
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {type === 'once' && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">마감일 (선택)</label>
          <input
            type="date"
            name="due_date"
            defaultValue={mission.due_date ?? ''}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">보상 포인트 *</label>
        <div className="relative">
          <input
            type="number"
            name="points"
            required
            min="1"
            defaultValue={mission.points}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
            포인트
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
      >
        {isPending ? '저장 중...' : '수정 저장하기'}
      </button>
    </form>
  )
}

export default function EditMissionPage() {
  const params = useParams()
  const [mission, setMission] = useState<MissionData | null>(null)
  const [loading, setLoading] = useState(true)

  useState(() => {
    fetch(`/api/missions/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setMission(data); setLoading(false) })
      .catch(() => setLoading(false))
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← 대시보드
        </Link>
        <h1 className="text-2xl font-black text-gray-800">미션 수정</h1>
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        {loading && <p className="text-gray-400 text-center py-8">불러오는 중...</p>}
        {!loading && !mission && <p className="text-red-400 text-center py-8">미션을 찾을 수 없어요.</p>}
        {mission && <EditForm mission={mission} />}
      </div>
    </div>
  )
}
