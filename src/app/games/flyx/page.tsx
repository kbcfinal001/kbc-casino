"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import "./flyx.css"

type Status = "waiting" | "running" | "crashed"

export default function FlyXPage() {
  const [betAmount, setBetAmount] = useState("10")
  const [multiplier, setMultiplier] = useState(1)
  const [status, setStatus] = useState<Status>("waiting")
  const [roundId, setRoundId] = useState("")
  const [hasBet, setHasBet] = useState(false)
  const [message, setMessage] = useState("Waiting for next round")
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<number[]>([1.24, 2.18, 1.09, 4.72, 1.81])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/aviator/engine", { cache: "no-store" })
        const data = await res.json()

        setMultiplier(Number(data.multiplier || 1))
        setStatus(data.status || "waiting")
        setRoundId(data.roundId || "")

        if (data.status === "waiting") {
          setMessage(`Next round in ${Math.ceil((data.countdownMs || 0) / 1000)}s`)
        }

        if (data.status === "running") {
          setMessage(hasBet ? "Flight running. Cash out before crash." : "Plane is flying. Watch only.")
        }

        if (data.status === "crashed") {
          setHasBet(false)
          const crash = Number(data.crashPoint || data.multiplier || 1)
          setMessage(`Crashed at ${crash.toFixed(2)}x`)
          setHistory((prev) => [crash, ...prev].slice(0, 8))
        }
      } catch (error) {
        console.error("Aviator engine failed:", error)
      }
    }, 350)

    return () => clearInterval(interval)
  }, [hasBet])

  async function placeBet() {
    setLoading(true)

    const res = await fetch("/api/aviator/bet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ betAmount }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || "Bet failed")
      setLoading(false)
      return
    }

    setHasBet(true)
    setMessage("Bet placed. Wait for flight.")
    setLoading(false)
  }

  async function cashout() {
    setLoading(true)

    const res = await fetch("/api/aviator/cashout", {
      method: "POST",
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || "Cashout failed")
      setLoading(false)
      return
    }

    setHasBet(false)
    setMessage(data.message)
    setLoading(false)
  }

  return (
    <main className="aviator-page">
      <section className="aviator-phone">
        <header className="aviator-top">
          <div>
            <div className="aviator-logo">KBC AVIATOR</div>
            <small>Round {roundId ? roundId.slice(0, 6) : "------"}</small>
          </div>

          <Link href="/profile" className="aviator-menu">≡</Link>
        </header>

        <div className="aviator-history">
          {history.map((item, index) => (
            <span key={`${item}-${index}`} className={item >= 2 ? "hot" : ""}>
              {item.toFixed(2)}x
            </span>
          ))}
        </div>

        <section className={`aviator-stage ${status}`}>
          <div className="fun-mode">
            {status === "waiting" ? "PLACE YOUR BET" : status === "running" ? "FLYING" : "CRASHED"}
          </div>

          <div className="aviator-rays" />
          <div className="aviator-red-area" />
          <div className="aviator-curve" />

          <div className="aviator-plane-wrap">
            <div className="aviator-plane">✈</div>
          </div>

          <div className="aviator-multiplier">
            {multiplier.toFixed(2)}x
          </div>
        </section>

        <section className="aviator-control">
          <div className="aviator-switch">
            <button>Bet</button>
            <button>Auto</button>
          </div>

          <div className="aviator-control-body">
            <div className="aviator-amount-box">
              <div className="aviator-stepper">
                <button disabled={status !== "waiting"} onClick={() => setBetAmount(String(Math.max(1, Number(betAmount) - 1)))}>-</button>
                <input disabled={status !== "waiting"} value={betAmount} onChange={(e) => setBetAmount(e.target.value)} />
                <button disabled={status !== "waiting"} onClick={() => setBetAmount(String(Number(betAmount) + 1))}>+</button>
              </div>

              <div className="aviator-presets">
                <button disabled={status !== "waiting"} onClick={() => setBetAmount("10")}>10</button>
                <button disabled={status !== "waiting"} onClick={() => setBetAmount("20")}>20</button>
                <button disabled={status !== "waiting"} onClick={() => setBetAmount("50")}>50</button>
                <button disabled={status !== "waiting"} onClick={() => setBetAmount("100")}>100</button>
              </div>
            </div>

            {hasBet && status === "running" ? (
              <button disabled={loading} onClick={cashout} className="aviator-bet-btn cashout">
                CASH OUT
                <span>{multiplier.toFixed(2)}x</span>
              </button>
            ) : (
              <button disabled={loading || status !== "waiting"} onClick={placeBet} className="aviator-bet-btn">
                Bet
                <span>Rs {betAmount}</span>
              </button>
            )}
          </div>
        </section>

        <p className={`aviator-message ${status}`}>
          {message}
        </p>
      </section>
    </main>
  )
}
