import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '../hooks/useToast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chef Chopsky - AI Sous Chef',
  description: 'Your personalized food prep assistant for CSA-based meal planning',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
