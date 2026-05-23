'use client'

import { useState, useTransition } from 'react'
import { createMission } from '@/app/actions'
import Link from 'next/link'

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

export default function NewMissionPage() {
  const [type, setType] = useState('daily')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    startTransition(() => createMission(formData))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← 대시보드
        </Link>
        <h1 className="text-2xl font-black text-gray-800">미션 만들기</h1>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <form action={handleSubmit} className="space-y-5">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">미션 이름 *</label>
            <input
              name="title"
              required
              placeholder="예: 글 읽고 답하기"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">설명 (선택)</label>
            <textarea
              name="description"
              rows={2}
              placeholder="미션에 대한 추가 설명을 입력하세요"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* 종류 */}
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

          {/* 주간 미션: 요일 선택 */}
          {type === 'weekly' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">요일 선택 *</label>
              <select name="day_of_week" required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700">
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* 월간 미션: 주 + 요일 선택 */}
          {type === 'monthly' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">주 선택 *</label>
                <select name="week" required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700">
                  {WEEKS.map((w) => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">요일 선택 *</label>
                <select name="day_of_week" required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700">
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 1회성 미션: 마감일 */}
          {type === 'once' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">마감일 (선택)</label>
              <input
                type="date"
                name="due_date"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
              />
            </div>
          )}

          {/* 포인트 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">보상 포인트 *</label>
            <div className="relative">
              <input
                type="number"
                name="points"
                required
                min="1"
                placeholder="예: 50"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700 pr-16"
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
            {isPending ? '저장 중...' : '미션 저장하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
