import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Links',
  description: '모든 중요한 링크를 한 곳에서 확인하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
