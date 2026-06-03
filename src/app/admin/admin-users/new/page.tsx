'use client'

import { useState } from 'react'

const permissionOptions = [
  'manage_admins',
  'view_users',
  'view_deposits',
  'approve_deposits',
  'view_withdrawals',
  'approve_withdrawals',
]

export default function NewAdminPage() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [permissions, setPermissions] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const togglePermission = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/admin/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        fullName,
        isSuperAdmin,
        permissions,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || 'Something went wrong')
      return
    }

    setMessage('Admin created successfully')
    setUserId('')
    setEmail('')
    setFullName('')
    setIsSuperAdmin(false)
    setPermissions([])
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-white flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-[#0d1117] border border-gray-800 rounded-2xl p-8 space-y-5">
        <h1 className="text-3xl font-bold">Create Admin</h1>

        <input
          className="w-full p-3 rounded-xl bg-[#131722] border border-gray-700"
          placeholder="Auth User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-xl bg-[#131722] border border-gray-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-xl bg-[#131722] border border-gray-700"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSuperAdmin}
            onChange={(e) => setIsSuperAdmin(e.target.checked)}
          />
          <span>Super Admin</span>
        </label>

        <div>
          <p className="mb-3 font-medium">Permissions</p>
          <div className="grid grid-cols-2 gap-3">
            {permissionOptions.map((permission) => (
              <label key={permission} className="flex items-center gap-3 bg-[#131722] p-3 rounded-xl">
                <input
                  type="checkbox"
                  checked={permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                />
                <span>{permission}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="w-full bg-purple-600 hover:bg-purple-500 transition p-3 rounded-xl">
          Create Admin
        </button>

        {message && <p className="text-sm text-gray-300">{message}</p>}
      </form>
    </main>
  )
}
