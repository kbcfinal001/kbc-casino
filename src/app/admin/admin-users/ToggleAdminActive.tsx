'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ToggleAdminActive({
  adminId,
  isActive,
}: {
  adminId: string
  isActive: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)

    await fetch(`/api/admin/admin-users/${adminId}/toggle-active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg ${
        isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
      } transition`}
    >
      {isActive ? 'Deactivate' : 'Activate'}
    </button>
  )
}
