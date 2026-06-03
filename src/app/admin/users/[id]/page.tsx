import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) redirect('/login')

  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  const { data: wallet } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', id)
    .single()

  const { data: deposits } = await supabase
    .from('deposit_requests')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main className="min-h-screen bg-[#05070d] text-white p-8">
      <h1 className="text-3xl font-bold">User Details</h1>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0d1117] border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p><span className="text-gray-400">Email:</span> {profile?.email || '-'}</p>
          <p><span className="text-gray-400">Full Name:</span> {profile?.full_name || '-'}</p>
          <p><span className="text-gray-400">Status:</span> {profile?.status || '-'}</p>
          <p><span className="text-gray-400">User ID:</span> {profile?.id || '-'}</p>
        </div>

        <div className="rounded-2xl bg-[#0d1117] border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet</h2>
          <p><span className="text-gray-400">Balance:</span> {wallet?.balance ?? 0}</p>
          <p><span className="text-gray-400">Locked Balance:</span> {wallet?.locked_balance ?? 0}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-[#0d1117] border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Wallet Transactions</h2>
        <div className="space-y-3">
          {transactions?.map((tx) => (
            <div key={tx.id} className="bg-[#131722] p-4 rounded-xl">
              <p>{tx.type} - {tx.amount}</p>
              <p className="text-sm text-gray-400">{tx.created_at}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#0d1117] border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Deposits</h2>
          <div className="space-y-3">
            {deposits?.map((d) => (
              <div key={d.id} className="bg-[#131722] p-4 rounded-xl">
                <p>{d.amount} - {d.status}</p>
                <p className="text-sm text-gray-400">{d.created_at}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d1117] border border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Withdrawals</h2>
          <div className="space-y-3">
            {withdrawals?.map((w) => (
              <div key={w.id} className="bg-[#131722] p-4 rounded-xl">
                <p>{w.amount} - {w.status}</p>
                <p className="text-sm text-gray-400">{w.created_at}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
