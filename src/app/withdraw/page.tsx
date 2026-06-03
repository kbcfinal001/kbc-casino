'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WithdrawPage() {
  const supabase = createClient()

  const [amount, setAmount] = useState('')
  const [payoutMethod, setPayoutMethod] = useState('')
  const [account, setAccount] = useState('')
  const [message, setMessage] = useState('')

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Please login first')
      return
    }

    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: user.id,
      amount: Number(amount),
      payout_method: payoutMethod,
      payout_details: { account },
      status: 'pending',
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Withdrawal request submitted')
    setAmount('')
    setPayoutMethod('')
    setAccount('')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <form onSubmit={handleWithdraw} className="bg-[#17171f] p-8 rounded-xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Withdraw Request</h1>
        <input
          type="number"
          placeholder="Amount"
          className="w-full p-3 rounded bg-black border border-gray-700"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Payout Method"
          className="w-full p-3 rounded bg-black border border-gray-700"
          value={payoutMethod}
          onChange={(e) => setPayoutMethod(e.target.value)}
        />
        <input
          type="text"
          placeholder="Account Details"
          className="w-full p-3 rounded bg-black border border-gray-700"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <button className="w-full bg-blue-600 p-3 rounded">Submit Withdrawal</button>
        {message && <p className="text-sm text-gray-300">{message}</p>}
      </form>
    </main>
  )
}