import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TopNav } from '@/components/TopNav'
import { AuthProvider } from '@/components/AuthProvider'
import { DbSyncProvider } from '@/components/DbSyncProvider'
import { EventTrackingProvider } from '@/components/EventTrackingProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Starforge',
  description: 'Interactive engineering training hub',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d)){document.documentElement.classList.add('dark')}}catch(_){}`,
          }}
        />
        <TopNav />
        <AuthProvider>
          <DbSyncProvider>
            <EventTrackingProvider>{children}</EventTrackingProvider>
          </DbSyncProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
