import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

export default async function WalletTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) redirect('/login')

  const params = await searchParams
  const page = Number(params.page || '1')
  const pageSize = 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()

  const { count } = await supabase
    .from('wallet_transactions')
    .select('*', { count: 'exact', head: true })

  const { data: transactions } = await supabase
    .from('wallet_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

  return (
    <main className="page-wrap">
      <div className="glass-card rounded-[24px] p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="section-title">Wallet Transactions</h1>
            <p className="muted mt-2">General wallet ledger history</p>
          </div>

          <a
            href="/api/admin/wallet-transactions/export"
            className="lux-btn bg-cyan-600 glow-blue"
          >
            Export CSV
          </a>
        </div>

        <div className="mt-8 space-y-4">
          {transactions?.map((tx) => (
            <div key={tx.id} className="rounded-2xl bg-[#0d1117] border border-gray-800 p-5">
              <p><span className="text-gray-400">User ID:</span> {tx.user_id}</p>
              <p><span className="text-gray-400">Type:</span> {tx.type}</p>
              <p><span className="text-gray-400">Amount:</span> {tx.amount}</p>
              <p><span className="text-gray-400">Status:</span> {tx.status}</p>
              <p><span className="text-gray-400">Reference:</span> {tx.reference_type || '-'} #{tx.reference_id || '-'}</p>
              <p><span className="text-gray-400">Note:</span> {tx.note || '-'}</p>
              <p><span className="text-gray-400">Created:</span> {new Date(tx.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <Link
            href={`/admin/wallet-transactions?page=${Math.max(1, page - 1)}`}
            className={`px-4 py-2 rounded-xl bg-[#131722] ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
          >
            Previous
          </Link>

          <p className="text-gray-400">Page {page} of {totalPages}</p>

          <Link
            href={`/admin/wallet-transactions?page=${Math.min(totalPages, page + 1)}`}
            className={`px-4 py-2 rounded-xl bg-[#131722] ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  )
}
