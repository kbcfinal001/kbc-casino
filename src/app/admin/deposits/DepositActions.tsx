'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DepositActions({ id, status }: { id: number; status: string }) {
  const router = useRouter()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    setMessage('')

    const res = await fetch(`/api/admin/deposits/${id}`, {
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

  if (status !== 'pending') {
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

      <div className="flex gap-2">
        <button
          onClick={() => handleAction('approve')}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm"
        >
          Approve
        </button>

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
