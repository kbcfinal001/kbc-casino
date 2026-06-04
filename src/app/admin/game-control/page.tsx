"use client"

import { useEffect, useState } from "react"

export default function AdminGameControlPage() {
  const [crashPoint, setCrashPoint] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function loadControl() {
    const res = await fetch("/api/admin/game-control")
    const data = await res.json()

    if (data.control?.crash_point) {
      setCrashPoint(String(data.control.crash_point))
    }
  }

  useEffect(() => {
    loadControl()
  }, [])

  async function saveControl(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch("/api/admin/game-control", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ crashPoint }),
    })

    const data = await res.json()

    setMessage(data.message || data.error || "Done")
    setLoading(false)
  }

  async function clearControl() {
    setLoading(true)

    const res = await fetch("/api/admin/game-control", {
      method: "DELETE",
    })

    const data = await res.json()

    setMessage(data.message || data.error || "Done")
    setCrashPoint("")
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-black text-red-500">
        Game Control
      </h1>

      <p className="text-zinc-400 mt-2">
        Control KBC AVIATOR next crash multiplier for testing/demo operations.
      </p>

      <form
        onSubmit={saveControl}
        className="mt-8 max-w-xl rounded-3xl border border-red-500/20 bg-zinc-950 p-8"
      >
        <label className="text-sm text-zinc-400">
          KBC AVIATOR Crash Point
        </label>

        <input
          type="number"
          step="0.01"
          min="1.01"
          value={crashPoint}
          onChange={(e) => setCrashPoint(e.target.value)}
          placeholder="Example: 2.50"
          className="mt-3 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-4 outline-none focus:border-red-500"
        />

        <button
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-red-600 py-4 font-black"
        >
          {loading ? "Saving..." : "Set Crash Point"}
        </button>

        <button
          type="button"
          onClick={clearControl}
          disabled={loading}
          className="mt-3 w-full rounded-2xl border border-zinc-700 py-4 font-black"
        >
          Clear / Use Random
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
