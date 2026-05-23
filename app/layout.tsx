import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Donnycraft',
  description: '미션을 완료하고 포인트를 모아요!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
