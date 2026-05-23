import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { loginAdmin } from '../actions'
import Link from 'next/link'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (await isAdmin()) redirect('/admin/dashboard')

  const params = await searchParams
  const hasError = params.error === '1'

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-black text-gray-800">아빠 전용</h1>
          <p className="text-gray-500 text-sm mt-1">비밀번호를 입력하세요</p>
        </div>

        <form action={loginAdmin} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            required
            autoFocus
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
          />

          {hasError && (
            <p className="text-red-500 text-sm text-center">
              비밀번호가 틀렸어요. 다시 시도해 보세요.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition"
          >
            로그인
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-400 text-sm hover:text-gray-600 underline">
            ← 아이 화면으로
          </Link>
        </div>
      </div>
    </div>
  )
}
