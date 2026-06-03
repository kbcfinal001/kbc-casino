'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLogoutButton from '@/components/AdminLogoutButton'

type Analytics = {
  stats: {
    totalUsers: number
    totalAdmins: number
    totalDeposits: number
    totalWithdrawals: number
    pendingDeposits: number
    pendingWithdrawals: number
    totalTransactions: number
    auditLogs: number
  }
  topDepositors?: { userId: string; amount: number }[]
  topWithdrawers?: { userId: string; amount: number }[]
}

export default function AdminPage() {
  const [data, setData] = useState<Analytics | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      setData(json)
    }

    loadAnalytics()
  }, [])

  const cards = [
  ['Users', 'Filter users and track user data', '/admin/users'],

  ['Deposits', 'Approve deposits and view payment proof', '/admin/deposits'],

  ['Withdrawals', 'Approve or reject withdrawals', '/admin/withdrawals'],

  [
    'Payment QRs',
    'Upload and manage deposit QR codes',
    '/admin/payment-qrs',
  ],

  [
    'Wallet Transactions',
    'Track every wallet movement',
    '/admin/wallet-transactions',
  ],

  [
    'Manage Admins',
    'Create admins and permissions',
    '/admin/admin-users',
  ],

  [
    'Queries',
    'User support issues and uploaded screenshots',
    '/admin/queries',
  ],

  ['Audit Logs', 'Track admin actions', '/admin/audit-logs'],
]

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-red-400 font-bold">SUPER ADMIN PANEL</p>

          <h1 className="text-4xl font-black mt-2">
            KBC Final Control Center
          </h1>
        </div>

        <AdminLogoutButton />
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Stat title="Users" value={data?.stats?.totalUsers} />
        <Stat title="Admins" value={data?.stats?.totalAdmins} />
        <Stat
          title="Approved Deposits"
          value={`₹${data?.stats?.totalDeposits || 0}`}
        />
        <Stat
          title="Approved Withdrawals"
          value={`₹${data?.stats?.totalWithdrawals || 0}`}
        />
        <Stat title="Pending Deposits" value={data?.stats?.pendingDeposits} />
        <Stat
          title="Pending Withdrawals"
          value={data?.stats?.pendingWithdrawals}
        />
        <Stat title="Wallet Logs" value={data?.stats?.totalTransactions} />
        <Stat title="Audit Logs" value={data?.stats?.auditLogs} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 mb-10">
        {cards.map(([title, desc, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-3xl border border-red-500/20 bg-zinc-950 p-6 hover:border-red-500/60 hover:bg-red-950/20 transition"
          >
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-zinc-400 mt-2">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TopList title="Top Depositors" rows={data?.topDepositors || []} />
        <TopList title="Top Withdrawers" rows={data?.topWithdrawers || []} />
      </div>
    </main>
  )
}

function Stat({
  title,
  value,
}: {
  title: string
  value: string | number | undefined
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-zinc-400 text-sm">{title}</p>
      <h2 className="text-2xl font-black mt-2">{value ?? '...'}</h2>
    </div>
  )
}

function TopList({
  title,
  rows,
}: {
  title: string
  rows: { userId: string; amount: number }[]
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {rows.length === 0 ? (
        <p className="text-zinc-500">No data yet.</p>
      ) : (
        rows.map((row, index) => (
          <div
            key={`${row.userId}-${index}`}
            className="flex justify-between border-b border-zinc-800 py-3"
          >
            <span>
              #{index + 1} {row.userId}
            </span>

            <span className="text-red-400 font-bold">₹{row.amount}</span>
          </div>
        ))
      )}
    </div>
  )
}
