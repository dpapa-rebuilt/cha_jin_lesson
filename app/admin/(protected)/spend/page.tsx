export const dynamic = 'force-dynamic'

import { sql } from '@/lib/db'
import { spendPoints } from '@/app/actions'
import Link from 'next/link'

interface TxRow {
  id: number
  type: string
  points: number
  description: string | null
  created_at: string
}

export default async function SpendPage() {
  const [txRows, historyRows] = await Promise.all([
    sql`SELECT COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE -points END), 0) AS balance FROM transactions`,
    sql`SELECT * FROM transactions WHERE type = 'spend' ORDER BY created_at DESC LIMIT 10`,
  ])

  const balance = Number((txRows[0] as { balance: string }).balance)
  const history = historyRows as unknown as TxRow[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">
          ← 대시보드
        </Link>
        <h1 className="text-2xl font-black text-gray-800">포인트 사용</h1>
      </div>

      {/* 현재 잔액 */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
        <p className="text-sm text-orange-600 font-semibold">현재 포인트 잔액</p>
        <p className="text-5xl font-black text-orange-500 mt-1">{balance.toLocaleString()}</p>
        <p className="text-orange-400 text-sm">포인트</p>
      </div>

      {/* 포인트 사용 폼 */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-bold text-gray-700 mb-4">포인트 차감하기</h2>
        <form action={spendPoints} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              무엇을 사줬나요? *
            </label>
            <input
              name="description"
              required
              placeholder="예: 레고 세트, 아이스크림"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              차감할 포인트 *
            </label>
            <div className="relative">
              <input
                type="number"
                name="points"
                required
                min="1"
                max={balance}
                placeholder="예: 500"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-gray-700 pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                포인트
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
          >
            포인트 차감하기
          </button>
        </form>
      </div>

      {/* 사용 내역 */}
      {history.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3">포인트 사용 내역</h2>
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-100">
            {history.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{tx.description ?? '-'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <p className="font-black text-red-400 text-lg">-{tx.points}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
