"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import "./sicbo.css"

type SicBoResult = {
  result: "win" | "lose"
  resultType: "big" | "small" | "triple"
  dice: number[]
  total: number
  profit: number
  payout: number
  balance: number
  message: string
  needDeposit?: boolean
}

const diceDots: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}

export default function SicBoPage() {
  const [dice, setDice] = useState([1, 1, 1])
  const [betAmount, setBetAmount] = useState("10")
  const [message, setMessage] = useState("Place your bet and roll the dice!")
  const [loading, setLoading] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [result, setResult] = useState<SicBoResult | null>(null)
  const [needDeposit, setNeedDeposit] = useState(false)
  const [lastOutcome, setLastOutcome] = useState<"win" | "lose" | null>(null)

  const rollSound = useRef<HTMLAudioElement | null>(null)
  const winSound = useRef<HTMLAudioElement | null>(null)
  const loseSound = useRef<HTMLAudioElement | null>(null)

  function playSound(audio: HTMLAudioElement | null) {
    if (!audio) return
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  async function play(betType: "big" | "small" | "triple") {
    if (loading) return

    setLoading(true)
    setRolling(true)
    setNeedDeposit(false)
    setResult(null)
    setLastOutcome(null)
    setMessage("Rolling dice...")

    playSound(rollSound.current)

    const rollInterval = setInterval(() => {
      setDice([
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
      ])
    }, 80)

    try {
      const res = await fetch("/api/games/sicbo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          betAmount,
          betType,
        }),
      })

      const data = await res.json()

      setTimeout(() => {
        clearInterval(rollInterval)
        setRolling(false)

        if (!res.ok) {
          setMessage(data.error || "Game failed")
          setNeedDeposit(Boolean(data.needDeposit))
          setLoading(false)
          return
        }

        setDice(data.dice)
        setResult(data)
        setMessage(data.message)
        setLastOutcome(data.result)

        if (data.result === "win") {
          playSound(winSound.current)
        } else {
          playSound(loseSound.current)
        }

        setLoading(false)
      }, 1300)
    } catch (error) {
      clearInterval(rollInterval)
      setRolling(false)
      setLoading(false)
      console.error(error)
      setMessage("Game failed")
    }
  }

  return (
    <main className={`sicbo-page ${lastOutcome ? `outcome-${lastOutcome}` : ""}`}>
      <audio ref={rollSound} src="/sounds/dice-roll.mp3" preload="auto" />
      <audio ref={winSound} src="/sounds/win.mp3" preload="auto" />
      <audio ref={loseSound} src="/sounds/lose.mp3" preload="auto" />

      {lastOutcome === "win" && <div className="win-burst">WIN</div>}
      {lastOutcome === "lose" && <div className="lose-flash">LOSE</div>}

      <section className="sicbo-hero">
        <p className="sicbo-kicker">KBC Casino Royale</p>
        <h1 className="sicbo-title">SIC BO</h1>
        <p className="sicbo-subtitle">
          Roll three dice. Bet Big, Small, or Triple.
        </p>
      </section>

      <div className={`sicbo-card ${rolling ? "table-shake" : ""}`}>
        <div className="dice-area">
          {dice.map((num, index) => (
            <Dice key={index} value={num} rolling={rolling} />
          ))}
        </div>

        <p className="sicbo-total">
          {result ? `Total: ${result.total} | Result: ${result.resultType}` : message}
        </p>

        <div className="sicbo-bet-box">
          <label>Bet Amount</label>
          <input
            className="sicbo-input"
            type="number"
            min="1"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            placeholder="Bet Amount"
          />
        </div>

        <div className="betType">
          <button disabled={loading} onClick={() => play("small")}>
            Small
            <span>3 - 10</span>
          </button>

          <button disabled={loading} onClick={() => play("big")}>
            Big
            <span>11 - 18</span>
          </button>

          <button disabled={loading} onClick={() => play("triple")}>
            Triple
            <span>8x</span>
          </button>
        </div>

        <p
          className={`sicbo-message ${
            result?.result === "win"
              ? "win"
              : result?.result === "lose"
                ? "lose"
                : ""
          }`}
        >
          {message}
        </p>

        {needDeposit && (
          <div className="sicbo-center">
            <Link href="/deposit" className="sicbo-deposit-large">
              Deposit First
            </Link>
          </div>
        )}

        {result && (
          <div className="sicbo-result-grid">
            <Info title="Bet" value={`Rs ${betAmount}`} />
            <Info title="Payout" value={`Rs ${result.payout}`} />
            <Info title="Profit" value={`Rs ${result.profit}`} />
            <Info title="Balance" value={`Rs ${result.balance}`} />
          </div>
        )}
      </div>
    </main>
  )
}

function Dice({
  value,
  rolling,
}: {
  value: number
  rolling: boolean
}) {
  return (
    <div className={`dice-cube ${rolling ? "rolling" : "settled"}`}>
      {Array.from({ length: 9 }).map((_, index) => {
        const position = index + 1
        const active = diceDots[value]?.includes(position)

        return (
          <span
            key={position}
            className={`dot dot-${position} ${active ? "active" : ""}`}
          />
        )
      })}
    </div>
  )
}

function Info({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="sicbo-info">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  )
}
