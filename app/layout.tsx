import './globals.css'
import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'NE TABLE School',
  description: 'Онлайн-платформа для вивчення англійської мови',
  icons: {
    icon: '/svg/netable.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

