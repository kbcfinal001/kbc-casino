"use client"

import { useState } from "react"

export default function WithdrawPage() {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function submitWithdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch("/api/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    })

    const data = await res.json()

    setMessage(data.message || data.error || "Done")
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={submitWithdraw}
        className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-950 p-8 shadow-[0_0_40px_rgba(220,38,38,0.2)]"
      >
        <h1 className="text-4xl font-black text-red-500 mb-2">
          Withdraw
        </h1>

        <p className="text-zinc-400 mb-6">
          Submit a withdrawal request for admin approval.
        </p>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-2xl bg-black border border-zinc-800 px-4 py-4 outline-none focus:border-red-500"
        />

        <button
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-red-600 py-4 font-bold hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Withdrawal"}
        </button>

        {message && (
          <p className="mt-4 text-center text-red-300">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}
