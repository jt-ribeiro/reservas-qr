'use client'

import dynamic from 'next/dynamic'

const QrScanner = dynamic(() => import('../components/QrScanner'), { ssr: false })

export default function CheckinPage() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Check-in QR</h1>
      <QrScanner />
    </main>
  )
}