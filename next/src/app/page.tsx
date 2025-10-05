import FormReserva from './components/FormReserva'

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Reserva de Mesa</h1>
      <FormReserva />
    </main>
  )
}