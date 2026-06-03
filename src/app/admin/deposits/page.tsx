"use client"

import { useEffect, useState } from "react"

type Deposit = {
  id: string
  user_id: string
  amount: number
  status: string
  proof_url: string | null
  approved_by_email: string | null
  approved_by_name: string | null
  approved_at: string | null
  created_at: string
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [status, setStatus] = useState("")
  const [adminEmail, setAdminEmail] = useState("")

  async function loadDeposits() {
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (adminEmail) params.set("adminEmail", adminEmail)

    const res = await fetch(`/api/admin/deposits?${params.toString()}`)
    const data = await res.json()
    setDeposits(data.deposits || [])
  }

  useEffect(() => {
    loadDeposits()
  }, [])

  async function action(id: string, actionType: "approve" | "reject") {
    const res = await fetch(`/api/admin/deposits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionType }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Failed")
      return
    }

    loadDeposits()
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-black text-red-500">
        Approve Deposits
      </h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-zinc-950 border border-zinc-800 rounded-xl p-3"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="Filter by approved admin email"
          className="bg-zinc-950 border border-zinc-800 rounded-xl p-3"
        />

        <button
          onClick={loadDeposits}
          className="rounded-xl bg-red-600 px-5 py-3 font-bold"
        >
          Filter
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {deposits.map((deposit) => (
          <div
            key={deposit.id}
            className="rounded-3xl border border-red-500/20 bg-zinc-950 p-6"
          >
            <p className="text-xl font-black">Rs {deposit.amount}</p>
            <p className="text-zinc-400 text-sm">User: {deposit.user_id}</p>
            <p className="text-zinc-400 text-sm">Status: {deposit.status}</p>
            <p className="text-zinc-500 text-xs">
              Created: {new Date(deposit.created_at).toLocaleString()}
            </p>

            {deposit.approved_by_email && (
              <p className="text-emerald-400 text-sm mt-2">
                Approved by: {deposit.approved_by_name || deposit.approved_by_email}
              </p>
            )}

            {deposit.proof_url && (
              <a
                href={deposit.proof_url}
                target="_blank"
                className="inline-block mt-4 text-red-400 underline"
              >
                View Payment Proof
              </a>
            )}

            {deposit.status === "pending" && (
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => action(deposit.id, "approve")}
                  className="rounded-xl bg-green-600 px-5 py-2 font-bold"
                >
                  Approve
                </button>

                <button
                  onClick={() => action(deposit.id, "reject")}
                  className="rounded-xl bg-red-600 px-5 py-2 font-bold"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
