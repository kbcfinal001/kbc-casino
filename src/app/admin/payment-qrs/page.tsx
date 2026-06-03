"use client"

import { useState } from "react"

export default function AdminPaymentQRPage() {
  const [title, setTitle] = useState("")
  const [upiId, setUpiId] = useState("")
  const [qr, setQr] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function uploadQR(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("title", title)
    formData.append("upiId", upiId)
    if (qr) formData.append("qr", qr)

    const res = await fetch("/api/admin/payment-qrs", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    setMessage(data.message || data.error || "Done")
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-black text-red-500">
        Payment QR Management
      </h1>

      <form
        onSubmit={uploadQR}
        className="mt-8 max-w-xl rounded-3xl border border-red-500/20 bg-zinc-950 p-8"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="QR Title"
          className="w-full rounded-xl bg-black border border-zinc-800 p-4 mb-4"
        />

        <input
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="UPI ID"
          className="w-full rounded-xl bg-black border border-zinc-800 p-4 mb-4"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setQr(e.target.files?.[0] || null)}
          className="w-full rounded-xl bg-black border border-zinc-800 p-4"
        />

        <button
          disabled={loading}
          className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-bold"
        >
          {loading ? "Uploading..." : "Upload QR"}
        </button>

        {message && <p className="mt-4 text-red-300">{message}</p>}
      </form>
    </main>
  )
}
