'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WithdrawalActions({ id, status }: { id: number; status: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAction = async (action: 'first_review' | 'approve' | 'reject') => {
    setLoading(true)
    setMessage('')

    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'Request failed')
      setLoading(false)
      return
    }

    setMessage(`Request ${data.status}`)
    setLoading(false)
    router.refresh()
  }

  if (status === 'approved' || status === 'rejected') {
    return <span className="text-sm text-gray-400">Reviewed</span>
  }

  return (
    <div className="space-y-2">
      <textarea
        placeholder="Admin note"
        className="w-full rounded-lg bg-[#0b0f14] border border-gray-700 p-2 text-sm"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex gap-2 flex-wrap">
        {status === 'pending' && (
          <button
            onClick={() => handleAction('first_review')}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-sm"
          >
            First Review
          </button>
        )}

        {status === 'under_review' && (
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm"
          >
            Final Approve
          </button>
        )}

        <button
          onClick={() => handleAction('reject')}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm"
        >
          Reject
        </button>
      </div>

      {message && <p className="text-xs text-gray-300">{message}</p>}
    </div>
  )
}
