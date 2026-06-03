import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentAdmin, hasPermission } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import WithdrawalActions from './WithdrawalActions'

function badge(status: string) {
  if (status === 'approved') return 'bg-green-600/20 text-green-400 border-green-600/30'
  if (status === 'rejected') return 'bg-red-600/20 text-red-400 border-red-600/30'
  if (status === 'under_review') return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
  return 'bg-gray-600/20 text-gray-300 border-gray-600/30'
}

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; user_id?: string; page?: string }>
}) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) redirect('/login')
  if (!hasPermission(currentAdmin.permissions, 'view_withdrawals')) redirect('/admin')

  const params = await searchParams
  const status = params.status || ''
  const userId = params.user_id || ''
  const page = Number(params.page || '1')
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()

  let countQuery = supabase.from('withdrawal_requests').select('*', { count: 'exact', head: true })
  let dataQuery = supabase.from('withdrawal_requests').select('*').order('created_at', { ascending: false }).range(from, to)

  if (status) {
    countQuery = countQuery.eq('status', status)
    dataQuery = dataQuery.eq('status', status)
  }

  if (userId) {
    countQuery = countQuery.eq('user_id', userId)
    dataQuery = dataQuery.eq('user_id', userId)
  }

  const { count } = await countQuery
  const { data: withdrawals } = await dataQuery

  const reviewerIds = Array.from(
    new Set((withdrawals || []).map((d) => d.reviewed_by).filter(Boolean))
  )

  let reviewerMap: Record<string, string> = {}

  if (reviewerIds.length > 0) {
    const { data: reviewers } = await supabase
      .from('admin_users')
      .select('id, email, full_name')
      .in('id', reviewerIds)

    reviewerMap =
      reviewers?.reduce((acc, reviewer) => {
        acc[reviewer.id] = reviewer.full_name || reviewer.email || reviewer.id
        return acc
      }, {} as Record<string, string>) || {}
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

  return (
    <main className="min-h-screen bg-[#05070d] text-white p-8">
      <h1 className="text-3xl font-bold">Withdrawal Requests</h1>

      <form className="mt-6 flex flex-wrap gap-4">
        <select name="status" defaultValue={status} className="bg-[#131722] border border-gray-700 rounded-xl p-3">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input
          type="text"
          name="user_id"
          defaultValue={userId}
          placeholder="Search by user id"
          className="bg-[#131722] border border-gray-700 rounded-xl p-3 min-w-[320px]"
        />

        <button className="px-5 py-3 rounded-xl bg-blue-600">Filter</button>
      </form>

      <div className="mt-8 space-y-4">
        {withdrawals?.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[#0d1117] border border-gray-800 p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div><p className="text-gray-400 text-sm">Request ID</p><p>{item.id}</p></div>
              <div>
                <p className="text-gray-400 text-sm">User</p>
                <Link href={`/admin/users/${item.user_id}`} className="text-blue-400 hover:underline break-all">
                  {item.user_id}
                </Link>
              </div>
              <div><p className="text-gray-400 text-sm">Amount</p><p>{item.amount}</p></div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full border text-sm ${badge(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div><p className="text-gray-400">Reviewed By</p><p>{item.reviewed_by ? reviewerMap[item.reviewed_by] || item.reviewed_by : '-'}</p></div>
              <div><p className="text-gray-400">Reviewed At</p><p>{item.reviewed_at ? new Date(item.reviewed_at).toLocaleString() : '-'}</p></div>
              <div><p className="text-gray-400">Admin Note</p><p>{item.admin_note || '-'}</p></div>
            </div>

            <WithdrawalActions id={item.id} status={item.status} />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8">
        <Link
          href={`/admin/withdrawals?status=${status}&user_id=${userId}&page=${Math.max(1, page - 1)}`}
          className={`px-4 py-2 rounded-xl bg-[#131722] ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
        >
          Previous
        </Link>

        <p className="text-gray-400">Page {page} of {totalPages}</p>

        <Link
          href={`/admin/withdrawals?status=${status}&user_id=${userId}&page=${Math.min(totalPages, page + 1)}`}
          className={`px-4 py-2 rounded-xl bg-[#131722] ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
        >
          Next
        </Link>
      </div>
    </main>
  )
}
