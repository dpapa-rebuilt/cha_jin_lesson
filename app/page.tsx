export const dynamic = 'force-dynamic'

import { sql } from '@/lib/db'
import Link from 'next/link'
import {
  Mission, Completion, Transaction,
  isMissionActiveToday, findCompletion, missionTypeLabel, recurrenceLabel,
} from '@/lib/missions'
import MissionCard from './MissionCard'

async function getData() {
  const [missions, completions, txRows] = await Promise.all([
    sql`SELECT * FROM missions WHERE is_active = true ORDER BY created_at`,
    sql`SELECT * FROM completions WHERE completed_at >= NOW() - INTERVAL '31 days'`,
    sql`SELECT COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE -points END), 0) AS balance FROM transactions`,
  ])
  const balance = Number((txRows[0] as { balance: string }).balance)
  return {
    missions: missions as Mission[],
    completions: completions as Completion[],
    balance,
  }
}

export default async function Home() {
  const { missions, completions, balance } = await getData()

  const todayMissions = missions.filter(isMissionActiveToday)
  const upcomingMissions = missions.filter((m) => !isMissionActiveToday(m))

  return (
    <div className="min-h-screen bg-amber-50">
      {/* 헤더 */}
      <header className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Donnycraft</h1>
          <p className="text-orange-100 text-sm">미션을 완료하고 포인트를 모아요!</p>
        </div>
        <Link href="/admin" className="text-orange-200 hover:text-white text-sm underline underline-offset-2">
          아빠 로그인
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 포인트 잔액 */}
        <section className="bg-white rounded-3xl shadow-lg p-6 text-center">
          <p className="text-gray-500 text-sm mb-1">내 포인트 잔액</p>
          <p className="text-5xl font-black text-orange-500">
            {balance.toLocaleString()}
          </p>
          <p className="text-gray-400 mt-1">포인트</p>
        </section>

        {/* 오늘의 미션 */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3">오늘의 미션</h2>
          {todayMissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 shadow">
              오늘은 미션이 없어요. 푹 쉬어요!
            </div>
          ) : (
            <div className="space-y-3">
              {todayMissions.map((mission) => {
                const completion = findCompletion(completions, mission)
                return (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    completion={completion}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* 다가오는 미션 */}
        {upcomingMissions.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-3">다른 미션들</h2>
            <div className="space-y-3">
              {upcomingMissions.map((mission) => (
                <div key={mission.id} className="bg-white rounded-2xl p-4 shadow opacity-70">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full mr-2">
                        {recurrenceLabel(mission) || missionTypeLabel(mission.type)}
                      </span>
                      <p className="font-bold text-gray-800 mt-1">{mission.title}</p>
                      {mission.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{mission.description}</p>
                      )}
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="font-black text-orange-500">+{mission.points}</p>
                      <p className="text-xs text-gray-400">포인트</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
