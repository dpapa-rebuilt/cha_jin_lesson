'use client'

import { useState, useTransition } from 'react'
import { submitCompletion } from './actions'
import { Mission, Completion, missionTypeLabel, recurrenceLabel } from '@/lib/missions'

interface Props {
  mission: Mission
  completion: Completion | null
}

export default function MissionCard({ mission, completion: initialCompletion }: Props) {
  const [completion, setCompletion] = useState(initialCompletion)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleComplete() {
    startTransition(async () => {
      await submitCompletion(mission.id, note)
      setCompletion({
        id: 0,
        mission_id: mission.id,
        status: 'pending',
        completed_at: new Date().toISOString(),
        approved_at: null,
      })
      setShowNoteForm(false)
      setNote('')
    })
  }

  const label = recurrenceLabel(mission) || missionTypeLabel(mission.type)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border-l-4 border-orange-400">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">
            {label}
          </span>
          <p className="font-bold text-gray-800 mt-1 text-lg">{mission.title}</p>
          {mission.description && (
            <p className="text-sm text-gray-500 mt-0.5">{mission.description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-orange-500 text-xl">+{mission.points}</p>
          <p className="text-xs text-gray-400">포인트</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {/* 완료 전 — 버튼 or 메모 폼 */}
        {!completion && !showNoteForm && (
          <button
            onClick={() => setShowNoteForm(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-2.5 rounded-xl transition-all"
          >
            완료했어요!
          </button>
        )}

        {!completion && showNoteForm && (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="어떻게 했는지 써볼까요? (선택 사항)"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-300 resize-none bg-gray-50"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowNoteForm(false); setNote('') }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold py-2 rounded-xl text-sm transition"
              >
                취소
              </button>
              <button
                onClick={handleComplete}
                disabled={isPending}
                className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-sm transition disabled:opacity-50"
              >
                {isPending ? '보내는 중...' : '보내기'}
              </button>
            </div>
          </>
        )}

        {/* 완료 후 상태 */}
        {completion?.status === 'pending' && (
          <div className="w-full bg-yellow-50 text-yellow-600 font-semibold py-2.5 rounded-xl text-center border border-yellow-200 text-sm">
            승인 기다리는 중...
          </div>
        )}
        {completion?.status === 'approved' && (
          <div className="w-full bg-green-50 text-green-600 font-semibold py-2.5 rounded-xl text-center border border-green-200 text-sm">
            완료! 포인트 적립됨
          </div>
        )}
        {completion?.status === 'rejected' && (
          <button
            onClick={() => setShowNoteForm(true)}
            className="w-full bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-500 font-bold py-2.5 rounded-xl transition-all text-sm"
          >
            다시 도전하기
          </button>
        )}
      </div>
    </div>
  )
}
