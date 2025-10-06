'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function AdminPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [bars, setBars] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const sseRef = useRef<EventSource | null>(null)

  // 1. Barras por horário
  useEffect(() => {
    fetch(`http://localhost:8000/api/occupancy-by-date.php?date=${date}`)
      .then(r => r.json())
      .then(setBars)
      .catch(() => setBars([]))
  }, [date])

  // 2. Lista de reservas
  useEffect(() => {
    fetch(`http://localhost:8000/api/bookings.php?date=${date}`)
      .then(r => r.json())
      .then(setBookings)
      .catch(() => setBookings([]))
  }, [date])

  // 3. SSE real-time
  const chartRef = useRef<ChartJS<'line'> | null>(null)
  useEffect(() => {
    sseRef.current = new EventSource('http://localhost:8000/api/occupancy.php')
    sseRef.current.onmessage = e => {
      const { ocupacao } = JSON.parse(e.data)
      const chart = chartRef.current
      if (!chart) return
      chart.data.labels?.push(new Date().toLocaleTimeString())
      chart.data.datasets[0].data.push(ocupacao)
      if (chart.data.labels.length > 20) { chart.data.labels.shift(); chart.data.datasets[0].data.shift() }
      chart.update()
    }
    return () => sseRef.current?.close()
  }, [])

  const barData = {
    labels: bars.map(b => b.time_slot),
    datasets: [{
      label: `Ocupação ${date}`,
      data: bars.map(b => Number(b.ocupacao)),
      backgroundColor: 'rgba(75,192,192,0.5)',
      borderColor: 'rgba(75,192,192,1)',
      borderWidth: 1
    }]
  }

  const lineData = {
    labels: [] as string[],
    datasets: [{
      label: 'Ocupação Real-Time',
      data: [] as number[],
      borderColor: 'rgb(255,99,132)',
      tension: 0.25
    }]
  }

  const options = { responsive: true, scales: { y: { min: 0, max: 100 } } }

  return (
    <main className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard - Ocupação</h1>

      <div>
        <label className="mr-2">Data:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
      </div>

      <div className="max-w-4xl">
        <h2 className="text-lg mb-2">Ocupação por horário</h2>
        <Line data={barData} options={options} />
      </div>

      <div className="max-w-4xl">
        <h2 className="text-lg mb-2">Real-time (últimos 20 pts)</h2>
        <Line ref={chartRef} data={lineData} options={options} />
      </div>

      {/* LISTA DE RESERVAS */}
      <div className="max-w-5xl">
        <h2 className="text-lg mb-2">Reservas do dia</h2>
        <div className="overflow-auto max-h-96 border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Nome</th>
                <th className="px-2 py-1">Email</th>
                <th className="px-2 py-1">Horário</th>
                <th className="px-2 py-1">Pessoas</th>
                <th className="px-2 py-1">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className={b.checked ? 'bg-green-50' : ''}>
                  <td className="px-2 py-1">{b.id}</td>
                  <td className="px-2 py-1">{b.nome}</td>
                  <td className="px-2 py-1">{b.email}</td>
                  <td className="px-2 py-1">{b.time_slot}</td>
                  <td className="px-2 py-1">{b.pessoas}</td>
                  <td className="px-2 py-1">{b.checked ? '✅' : '⏳'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}