import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin"
import { supabaseAdmin } from "@/lib/supabase/admin"

export default async function AdminUsersPage() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect("/admin-login")
  }

  const { data: users } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,balance,status,is_active,balance_locked,created_at")
    .order("created_at", { ascending: false })
    .limit(300)

  const { data: deposits } = await supabaseAdmin
    .from("deposits")
    .select("user_id,amount,status")

  const { data: withdrawals } = await supabaseAdmin
    .from("withdrawals")
    .select("user_id,amount,status")

  const { data: rounds } = await supabaseAdmin
    .from("game_rounds")
    .select("user_id,bet_amount,profit")

  function totalDeposits(userId: string) {
    return (deposits || [])
      .filter((d) => d.user_id === userId && d.status === "approved")
      .reduce((sum, d) => sum + Number(d.amount || 0), 0)
  }

  function totalWithdrawals(userId: string) {
    return (withdrawals || [])
      .filter((w) => w.user_id === userId && w.status === "approved")
      .reduce((sum, w) => sum + Number(w.amount || 0), 0)
  }

  function totalPlayed(userId: string) {
    return (rounds || [])
      .filter((r) => r.user_id === userId)
      .reduce((sum, r) => sum + Number(r.bet_amount || 0), 0)
  }

  function gameProfit(userId: string) {
    return (rounds || [])
      .filter((r) => r.user_id === userId)
      .reduce((sum, r) => sum + Number(r.profit || 0), 0)
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-red-500">
          All Users
        </h1>

        <p className="text-zinc-400 mt-2">
          View every player, wallet, deposits, withdrawals, game activity and account status.
        </p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-red-500/20 bg-zinc-950">
        <table className="w-full min-w-[1200px] text-sm">
          <thead className="bg-red-950/30 text-zinc-300">
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Wallet</th>
              <th className="p-4 text-left">Deposits</th>
              <th className="p-4 text-left">Withdrawals</th>
              <th className="p-4 text-left">Total Played</th>
              <th className="p-4 text-left">Game P/L</th>
              <th className="p-4 text-left">Joined Since</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Lock</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {(users || []).map((user) => (
              <tr key={user.id} className="border-t border-zinc-800">
                <td className="p-4">
                  <p className="font-bold">
                    {user.full_name || "Unnamed User"}
                  </p>
                  <p className="text-zinc-400">{user.email || "-"}</p>
                  <p className="text-xs text-zinc-600 break-all">{user.id}</p>
                </td>

                <td className="p-4 text-green-400 font-black">
                  Rs {Number(user.balance || 0)}
                </td>

                <td className="p-4 text-emerald-300 font-bold">
                  Rs {totalDeposits(user.id)}
                </td>

                <td className="p-4 text-orange-300 font-bold">
                  Rs {totalWithdrawals(user.id)}
                </td>

                <td className="p-4 text-violet-300 font-bold">
                  Rs {totalPlayed(user.id)}
                </td>

                <td
                  className={`p-4 font-bold ${
                    gameProfit(user.id) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  Rs {gameProfit(user.id)}
                </td>

                <td className="p-4 text-zinc-400">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-4">
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                    {user.status || "active"}
                  </span>
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      user.balance_locked
                        ? "bg-red-900/40 text-red-300"
                        : "bg-green-900/40 text-green-300"
                    }`}
                  >
                    {user.balance_locked ? "Locked" : "Unlocked"}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <form action={`/api/admin/users/${user.id}/activate`} method="POST">
                      <button className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold">
                        Activate
                      </button>
                    </form>

                    <form action={`/api/admin/users/${user.id}/deactivate`} method="POST">
                      <button className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold">
                        Deactivate
                      </button>
                    </form>

                    <form action={`/api/admin/users/${user.id}/pause`} method="POST">
                      <button className="rounded-lg bg-yellow-600 px-3 py-2 text-xs font-bold">
                        Pause
                      </button>
                    </form>

                    <form action={`/api/admin/users/${user.id}/lock-balance`} method="POST">
                      <button className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-bold">
                        Lock
                      </button>
                    </form>

                    <form action={`/api/admin/users/${user.id}/unlock-balance`} method="POST">
                      <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold">
                        Unlock
                      </button>
                    </form>

                    <Link
                      href={`/admin/users/${user.id}`}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold"
                    >
                      Details
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {(users || []).length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-zinc-400">
                  No users found in profiles table.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
