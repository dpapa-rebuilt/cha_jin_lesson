import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logoutAdmin } from '@/app/actions'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-xl font-black text-orange-500">
            Donnycraft 관리
          </Link>
          <nav className="hidden sm:flex gap-4 text-sm font-medium text-gray-600">
            <Link href="/admin/dashboard" className="hover:text-orange-500 transition">대시보드</Link>
            <Link href="/admin/missions/new" className="hover:text-orange-500 transition">미션 만들기</Link>
            <Link href="/admin/approve" className="hover:text-orange-500 transition">승인 대기함</Link>
            <Link href="/admin/spend" className="hover:text-orange-500 transition">포인트 사용</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">아이 화면</Link>
          <form action={logoutAdmin}>
            <button type="submit" className="text-sm text-red-400 hover:text-red-600 transition">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
