"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type QR = {
  id: string
  title: string
  upi_id: string | null
  qr_image_url: string
}

export default function DepositPayClient() {
  const searchParams = useSearchParams()
  const amount = searchParams.get("amount") || "0"

  const [qr, setQr] = useState<QR | null>(null)
  const [proof, setProof] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/payment-qr")
      .then((res) => res.json())
      .then((data) => setQr(data.qr || null))
  }, [])

  async function submitProof(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!qr) {
      setMessage("No payment QR available")
      return
    }

    if (!proof) {
      setMessage("Upload payment proof first")
      return
    }

    setLoading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("amount", amount)
    formData.append("qrId", qr.id)
    formData.append("proof", proof)

    const res = await fetch("/api/deposit", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    setMessage(data.message || data.error || "Done")
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#090816] text-white flex items-center justify-center p-6">
      <form
        onSubmit={submitProof}
        className="w-full max-w-lg rounded-[32px] border border-violet-400/20 bg-[#151029]/90 p-8 text-center"
      >
        <h1 className="text-4xl font-black text-violet-200">
          Scan & Pay
        </h1>

        <p className="mt-2 text-violet-200/60">
          Amount: Rs {amount}
        </p>

        {qr ? (
          <>
            <img
              src={qr.qr_image_url}
              alt="Payment QR"
              className="mx-auto mt-6 h-72 w-72 rounded-3xl border border-violet-400/20 object-cover"
            />

            {qr.upi_id && (
              <p className="mt-4 text-emerald-300 font-bold">
                UPI: {qr.upi_id}
              </p>
            )}
          </>
        ) : (
          <p className="mt-6 text-red-300">
            No active QR found. Contact support.
          </p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProof(e.target.files?.[0] || null)}
          className="mt-6 w-full rounded-2xl bg-black/40 border border-violet-400/20 p-4"
        />

        <button
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-violet-600 py-4 font-black disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Payment Proof"}
        </button>

        {message && (
          <p className="mt-4 text-violet-200">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
