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

export default function EditAdminPermissionsForm({
  adminId,
  email,
  fullName,
  isSuperAdmin,
  initialPermissions,
}: {
  adminId: string
  email: string
  fullName: string
  isSuperAdmin: boolean
  initialPermissions: string[]
}) {
  const [name, setName] = useState(fullName)
  const [superAdmin, setSuperAdmin] = useState(isSuperAdmin)
  const [permissions, setPermissions] = useState<string[]>(initialPermissions)
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

    const res = await fetch(`/api/admin/admin-users/${adminId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: name,
        isSuperAdmin: superAdmin,
        permissions,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'Failed')
      return
    }

    setMessage('Admin updated successfully')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl bg-[#0d1117] border border-gray-800 rounded-2xl p-8 space-y-5">
      <p className="text-gray-400">Email: {email}</p>

      <input
        className="w-full p-3 rounded-xl bg-[#131722] border border-gray-700"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
      />

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={superAdmin}
          onChange={(e) => setSuperAdmin(e.target.checked)}
        />
        <span>Super Admin</span>
      </label>

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

      <button className="w-full bg-purple-600 p-3 rounded-xl">
        Save Changes
      </button>

      {message && <p className="text-sm text-gray-300">{message}</p>}
    </form>
  )
}
