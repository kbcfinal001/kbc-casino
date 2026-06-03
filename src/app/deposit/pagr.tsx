'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DepositPage() {
  const supabase = createClient()

  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [message, setMessage] = useState('')

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please login first')
      return
    }

    const { error } = await supabase.from('deposit_requests').insert({
      user_id: user.id,
      amount: Number(amount),
      payment_method: paymentMethod,
      payment_ref: paymentRef,
      status: 'pending',
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Deposit request submitted')
    setAmount('')
    setPaymentMethod('')
    setPaymentRef('')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={handleDeposit} className="bg-[#17171f] p-8 rounded-xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Deposit Request</h1>
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-3 rounded bg-black border border-gray-700"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Payment Method"
          className="w-full p-3 rounded bg-black border border-gray-700"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        />
        <input
          type="text"
          placeholder="Payment Reference"
          className="w-full p-3 rounded bg-black border border-gray-700"
          value={paymentRef}
          onChange={(e) => setPaymentRef(e.target.value)}
        />
        <button className="w-full bg-green-600 p-3 rounded">Submit Deposit</button>
        {message && <p className="text-sm text-gray-300">{message}</p>}
      </form>
    </main>
  )
}