export const dynamic = 'force-dynamic'

import { sql } from '@/lib/db'
import { approveCompletion, rejectCompletion } from '@/app/actions'
import Link from 'next/link'

interface PendingRow {
  completion_id: number
  mission_title: string
  mission_points: number
  completed_at: string
}

export default async function ApprovePage() {
  const rows = await sql`
    SELECT
      c.id AS completion_id,
      m.title AS mission_title,
      m.points AS mission_points,
      c.completed_at
    FROM completions c
    JOIN missions m ON m.id = c.mission_id
    WHERE c.status = 'pending'
    ORDER BY c.completed_at ASC
  ` as PendingRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← 대시보드
        </Link>
        <h1 className="text-2xl font-black text-gray-800">승인 대기함</h1>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-semibold">승인 대기 중인 미션이 없어요!</p>
          <p className="text-sm mt-1">아이가 미션을 완료하면 여기에 나타나요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.completion_id} className="bg-white rounded-2xl shadow p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{row.mission_title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    완료 시각: {new Date(row.completed_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-orange-500 text-xl">+{row.mission_points}</p>
                  <p className="text-xs text-gray-400">포인트</p>
                </div>
              </div>

              <div className="flex gap-2">
                <form action={approveCompletion.bind(null, row.completion_id, row.mission_points)} className="flex-1">
                  <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    승인하기
                  </button>
                </form>
                <form action={rejectCompletion.bind(null, row.completion_id)} className="flex-1">
                  <button
                    type="submit"
                    className="w-full bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 font-bold py-2.5 rounded-xl transition"
                  >
                    거절하기
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
