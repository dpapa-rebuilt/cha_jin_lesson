export const dynamic = 'force-dynamic'

import { sql } from '@/lib/db'
import Link from 'next/link'
import { Mission, Transaction } from '@/lib/missions'
import { toggleMission } from '@/app/actions'

async function getData() {
  const [txRows, pendingRows, missions, recentTx] = await Promise.all([
    sql`SELECT COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE -points END), 0) AS balance FROM transactions`,
    sql`SELECT COUNT(*) AS cnt FROM completions WHERE status = 'pending'`,
    sql`SELECT * FROM missions ORDER BY is_active DESC, created_at DESC`,
    sql`
      SELECT t.*, m.title AS mission_title
      FROM transactions t
      LEFT JOIN completions c ON c.id = t.completion_id
      LEFT JOIN missions m ON m.id = c.mission_id
      ORDER BY t.created_at DESC
      LIMIT 5
    `,
  ])
  return {
    balance: Number((txRows[0] as { balance: string }).balance),
    pendingCount: Number((pendingRows[0] as { cnt: string }).cnt),
    missions: missions as Mission[],
    recentTx: recentTx as (Transaction & { mission_title?: string })[],
  }
}

export default async function AdminDashboard() {
  const { balance, pendingCount, missions, recentTx } = await getData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-800">대시보드</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow text-center">
          <p className="text-sm text-gray-500">현재 포인트 잔액</p>
          <p className="text-4xl font-black text-orange-500 mt-1">{balance.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">포인트</p>
        </div>
        <div className={`rounded-2xl p-5 shadow text-center ${pendingCount > 0 ? 'bg-orange-500' : 'bg-white'}`}>
          <p className={`text-sm ${pendingCount > 0 ? 'text-orange-100' : 'text-gray-500'}`}>승인 대기 중</p>
          <p className={`text-4xl font-black mt-1 ${pendingCount > 0 ? 'text-white' : 'text-yellow-500'}`}>{pendingCount}</p>
          <p className={`text-sm ${pendingCount > 0 ? 'text-orange-200' : 'text-gray-400'}`}>건</p>
          {pendingCount > 0 && (
            <Link href="/admin/approve" className="mt-2 inline-block text-xs text-white underline font-semibold">
              지금 확인하기 →
            </Link>
          )}
        </div>
      </div>

      {/* 바로가기 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/admin/missions/new', label: '미션 만들기', icon: '➕' },
          { href: '/admin/approve', label: '승인 대기함', icon: '✅' },
          { href: '/admin/spend', label: '포인트 사용', icon: '🛍️' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition hover:border-orange-300 border border-transparent"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-sm font-semibold text-gray-700">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* 최근 내역 */}
      {recentTx.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3">최근 포인트 내역</h2>
          <div className="bg-white rounded-2xl shadow divide-y divide-gray-100">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {tx.mission_title ? `${tx.mission_title} 완료` : (tx.description ?? '-')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <p className={`font-black text-lg ${tx.type === 'earn' ? 'text-green-500' : 'text-red-400'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.points}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 미션 목록 */}
      <section>
        <h2 className="text-lg font-bold text-gray-700 mb-3">전체 미션</h2>
        <div className="space-y-2">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${mission.is_active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                  {mission.title}
                </p>
                <p className="text-xs text-gray-400">{mission.type === 'daily' ? '매일' : mission.type === 'weekly' ? '매주' : mission.type === 'monthly' ? '매월' : '1회성'} · {mission.points}포인트</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/missions/${mission.id}/edit`} className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-50 text-blue-500 hover:bg-blue-100 transition">
                  수정
                </Link>
                <form action={toggleMission.bind(null, mission.id, !mission.is_active)}>
                  <button type="submit" className={`text-xs px-3 py-1 rounded-full font-semibold transition ${mission.is_active ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500' : 'bg-green-50 text-green-500 hover:bg-green-100'}`}>
                    {mission.is_active ? '비활성화' : '활성화'}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
