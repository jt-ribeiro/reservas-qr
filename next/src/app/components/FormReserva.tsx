'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  nome: z.string().min(1, 'Obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  data: z.string().min(1, 'Data obrigatória'),
  time_slot: z.string().min(1, 'Horário obrigatório'),
  pessoas: z.coerce
    .number()
    .min(1, 'Mín 1 pessoa')
    .max(99, 'Acima da lotação')
})

type FormData = z.infer<typeof schema>

export default function FormReserva() {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/settings.php')
      .then(r => r.json())
      .then(setSettings)
      .catch(() => setSettings(null))
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const slots = useMemo(() => {
    if (!settings) return []
    const start = new Date(`1970-01-01T${settings.opening_time}`)
    const end = new Date(`1970-01-01T${settings.closing_time}`)
    const dur = settings.slot_duration
    const times: string[] = []
    while (start < end) {
      times.push(start.toTimeString().slice(0, 5))
      start.setMinutes(start.getMinutes() + dur)
    }
    return times
  }, [settings])

  const maxPessoas = settings?.max_capacity ?? 20

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('http://localhost:8000/api/reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro desconhecido')
      alert(`Reserva criada – id: ${json.id}`)
      reset()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <input {...register('nome')} placeholder="Nome" className="input" />
      {errors.nome && <p className="text-red-600 text-sm">{errors.nome.message}</p>}

      <input {...register('email')} placeholder="Email" className="input" />
      {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}

      <input {...register('telefone')} placeholder="Telefone (opcional)" className="input" />

      <input {...register('data')} type="date" className="input" />
      {errors.data && <p className="text-red-600 text-sm">{errors.data.message}</p>}

      <select {...register('time_slot')} className="input">
        <option value="">Escolha um horário</option>
        {slots.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      {errors.time_slot && <p className="text-red-600 text-sm">{errors.time_slot.message}</p>}

      <input
        type="number"
        min={1}
        max={maxPessoas}
        placeholder={`Nº pessoas (max ${maxPessoas})`}
        className="input"
        {...register('pessoas')}
      />
      {errors.pessoas && <p className="text-red-600 text-sm">{errors.pessoas.message}</p>}

      <button disabled={isSubmitting} className="btn">
        {isSubmitting ? 'Reservando...' : 'Reservar'}
      </button>
    </form>
  )
}