'use client'

import { useState } from 'react'
import { rejectCompletion } from '@/app/actions'

export default function RejectForm({ completionId }: { completionId: number }) {
  const [showForm, setShowForm] = useState(false)

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex-1 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 font-bold py-2.5 rounded-xl transition text-sm"
      >
        거절하기
      </button>
    )
  }

  return (
    <div className="w-full space-y-2 mt-1">
      <form action={rejectCompletion.bind(null, completionId)} className="space-y-2">
        <textarea
          name="reason"
          placeholder="아이에게 전할 말을 남겨주세요. 예: 다음엔 문제 번호도 적어줘 (선택 사항)"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-red-200 resize-none bg-gray-50"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold py-2 rounded-xl text-sm transition"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-[2] bg-red-400 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-sm transition"
          >
            거절 확정
          </button>
        </div>
      </form>
    </div>
  )
}
