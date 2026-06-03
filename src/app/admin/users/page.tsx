import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect('/admin-login')
  }

  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <main className="min-h-screen bg-[#05070d] text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black">
          User Management
        </h1>

        <p className="text-zinc-400 mt-2">
          View, monitor and control users
        </p>
      </div>

      <div className="space-y-4">
        {users?.map((user) => (
          <div
            key={user.id}
            className="rounded-2xl bg-[#0d1117] border border-gray-800 p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {user.full_name || 'Unnamed User'}
                </h3>

                <p className="text-zinc-400">
                  {user.email}
                </p>

                <p className="text-xs text-zinc-600 mt-1 break-all">
                  {user.id}
                </p>

                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                    Status: {user.status || 'active'}
                  </span>

                  <span className="rounded-full bg-green-900/30 text-green-400 px-3 py-1 text-xs">
                    Balance ₹{user.balance || 0}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      user.balance_locked
                        ? 'bg-red-900/40 text-red-300'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {user.balance_locked
                      ? 'Balance Locked'
                      : 'Balance Unlocked'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <form
                  action={`/api/admin/users/${user.id}/activate`}
                  method="POST"
                >
                  <button
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm font-semibold"
                  >
                    Activate
                  </button>
                </form>

                <form
                  action={`/api/admin/users/${user.id}/pause`}
                  method="POST"
                >
                  <button
                    className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-sm font-semibold"
                  >
                    Pause
                  </button>
                </form>

                <form
                  action={`/api/admin/users/${user.id}/deactivate`}
                  method="POST"
                >
                  <button
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold"
                  >
                    Deactivate
                  </button>
                </form>

                <form
                  action={`/api/admin/users/${user.id}/lock-balance`}
                  method="POST"
                >
                  <button
                    className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm font-semibold"
                  >
                    Lock Balance
                  </button>
                </form>

                <form
                  action={`/api/admin/users/${user.id}/unlock-balance`}
                  method="POST"
                >
                  <button
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
                  >
                    Unlock Balance
                  </button>
                </form>

                <Link
                  href={`/admin/users/${user.id}`}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}