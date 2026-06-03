"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DepositPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")

  function continueDeposit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount")
      return
    }

    router.push(`/deposit/pay?amount=${amount}`)
  }

  return (
    <main className="min-h-screen bg-[#090816] text-white flex items-center justify-center p-6">
      <form
        onSubmit={continueDeposit}
        className="w-full max-w-md rounded-[32px] border border-violet-400/20 bg-[#151029]/90 p-8"
      >
        <h1 className="text-4xl font-black text-violet-200">Deposit</h1>
        <p className="text-violet-200/60 mt-2 mb-6">
          Enter amount to generate payment QR.
        </p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full rounded-2xl bg-black/40 border border-violet-400/20 px-4 py-4 outline-none"
        />

        <button className="mt-6 w-full rounded-2xl bg-violet-600 py-4 font-black">
          Continue
        </button>
      </form>
    </main>
  )
}
