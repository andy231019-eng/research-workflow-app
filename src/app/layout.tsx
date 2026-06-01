import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'General Industry Analysis Agent',
  description: '通用產業分析 Agent — 輸入產業名稱，Claude 產生研究架構，確認後輸出完整 Markdown 報告',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
