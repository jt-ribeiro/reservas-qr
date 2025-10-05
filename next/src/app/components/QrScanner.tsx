'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

export default function QrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        videoRef.current.play()
        requestAnimationFrame(tick)
      })
      .catch((err) => setMsg('Câmera bloqueada ou indisponível'))

    function tick() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(tick)
        return
      }

      const ctx = canvas.getContext('2d')!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, canvas.width, canvas.height)

      if (code && code.data) {
        handleQr(code.data)
        return
      }
      requestAnimationFrame(tick)
    }

    async function handleQr(data: string) {
      try {
        const res = await fetch('http://localhost:8000/api/checkin.php', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(data) })
        })
        const json = await res.json()
        setMsg(json.success ? `✅ Check-in id ${data} confirmado!` : `❌ ${json.error}`)
      } catch {
        setMsg('Erro de rede')
      }
    }

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <>
      <video ref={videoRef} className="mx-auto rounded" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      {msg && <p className="mt-4 text-lg">{msg}</p>}
    </>
  )
}