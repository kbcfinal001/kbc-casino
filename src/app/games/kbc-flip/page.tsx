"use client"

import { useState } from "react"

export default function KbcFlipGamePage() {
  const [betAmount, setBetAmount] = useState("10")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [message, setMessage] = useState("")

  async function playGame() {
    setLoading(true)
    setMessage("")
    setResult(null)

    try {
      const res = await fetch("/api/games/kbc-flip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ betAmount }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Something went wrong")
        return
      }

      setResult(data)
      setMessage(data.message)
    } catch (error) {
      console.error(error)
      setMessage("Game failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#090816] text-white p-6 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-[36px] border border-violet-400/20 bg-[#151029]/90 p-8 shadow-[0_0_45px_rgba(139,92,246,0.3)] text-center">
          <p className="text-violet-300 font-bold">
            KBC Casino Game
          </p>

          <h1 className="mt-3 text-5xl font-black text-violet-100">
            KBC Flip
          </h1>

          <p className="mt-3 text-violet-100/60">
            Place a bet. Flip your luck. Win 2x or lose your bet.
          </p>

          <div className="mt-10 mx-auto h-40 w-40 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-6xl font-black shadow-[0_0_55px_rgba(139,92,246,0.7)]">
            {loading ? "..." : result?.result === "win" ? "W" : result?.result === "lose" ? "L" : "K"}
          </div>

          <div className="mt-10">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full max-w-xs rounded-2xl bg-black/40 border border-violet-400/20 px-5 py-4 text-center text-2xl font-black outline-none focus:border-violet-400"
              placeholder="Bet amount"
            />
          </div>

          <button
            onClick={playGame}
            disabled={loading}
            className="mt-6 rounded-2xl bg-violet-600 px-10 py-4 font-black hover:bg-violet-500 disabled:opacity-60 shadow-[0_0_30px_rgba(139,92,246,0.6)] transition"
          >
            {loading ? "Flipping..." : "Play Now"}
          </button>

          {message && (
            <p
              className={`mt-6 text-2xl font-black ${
                result?.result === "win"
                  ? "text-emerald-300"
                  : result?.result === "lose"
                    ? "text-red-300"
                    : "text-violet-200"
              }`}
            >
              {message}
            </p>
          )}

          {result && (
            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
              <Info title="Result" value={result.result} />
              <Info title="Profit" value={`Rs ${result.profit}`} />
              <Info title="Payout" value={`Rs ${result.payout}`} />
              <Info title="New Balance" value={`Rs ${result.balance}`} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function Info({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-violet-400/20 bg-black/30 p-4">
      <p className="text-xs text-violet-200/60">{title}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  )
}
