'use client'

import { useEffect, useState } from 'react'

type Settings = {
  restaurant_name: string
  max_capacity: number
  opening_time: string
  closing_time: string
  slot_duration: 15 | 30 | 60
}

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/api/settings.php')
      .then(r => r.json())
      .then(setS)
      .catch(() => setMsg('Erro ao carregar config'))
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!s) return
    try {
      const res = await fetch('http://localhost:8000/api/settings.php', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s)
      })
      if (!res.ok) throw new Error()
      setMsg('✅ Salvo!')
    } catch {
      setMsg('❌ Erro ao salvar')
    }
  }

  if (!s) return <p>Carregando...</p>

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Configurações do Restaurante</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <label>Nome</label>
        <input value={s.restaurant_name} onChange={e => setS({...s, restaurant_name: e.target.value})} className="input" required />

        <label>Lotação máxima</label>
        <input type="number" min={1} max={99} value={s.max_capacity} onChange={e => setS({...s, max_capacity: Number(e.target.value)})} className="input" required />

        <label>Abertura</label>
        <input type="time" value={s.opening_time} onChange={e => setS({...s, opening_time: e.target.value})} className="input" required />

        <label>Fechamento</label>
        <input type="time" value={s.closing_time} onChange={e => setS({...s, closing_time: e.target.value})} className="input" required />

        <label>Duração dos slots (min)</label>
        <select value={s.slot_duration} onChange={e => setS({...s, slot_duration: Number(e.target.value) as any})} className="input">
          <option value={15}>15</option>
          <option value={30}>30</option>
          <option value={60}>60</option>
        </select>

        <button className="btn">Guardar</button>
        {msg && <p>{msg}</p>}
      </form>
    </main>
  )
}