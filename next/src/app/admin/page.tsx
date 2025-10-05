'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function AdminPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [bars, setBars] = useState<any[]>([])
  const sseRef = useRef<EventSource | null>(null)

  // 1. Gráfico de barras por data (fetch normal)
  useEffect(() => {
    fetch(`http://localhost:8000/api/occupancy-by-date.php?date=${date}`)
      .then(r => r.json())
      .then(setBars)
      .catch(() => setBars([]))
  }, [date])

  // 2. SSE – linha do tempo real (mantido)
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
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="input"
        />
      </div>

      <div className="max-w-4xl">
        <h2 className="text-lg mb-2">Por horário (dia selecionado)</h2>
        <Line data={barData} options={options} />
      </div>

      <div className="max-w-4xl">
        <h2 className="text-lg mb-2">Real-time (últimos 20 pts)</h2>
        <Line ref={chartRef} data={lineData} options={options} />
      </div>
    </main>
  )
}