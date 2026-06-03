import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

export default async function AuditLogsPage({
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
    .from('admin_audit_logs')
    .select('*', { count: 'exact', head: true })

  const { data: logs } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

  return (
    <main className="page-wrap">
      <div className="glass-card rounded-[24px] p-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="section-title">Admin Audit Logs</h1>
            <p className="muted mt-2">Track key admin actions</p>
          </div>

          <a
            href="/api/admin/audit-logs/export"
            className="lux-btn bg-amber-500 text-black glow-gold"
          >
            Export CSV
          </a>
        </div>

        <div className="mt-8 space-y-4">
          {logs?.map((log) => (
            <div key={log.id} className="rounded-2xl bg-[#0d1117] border border-gray-800 p-5">
              <p><span className="text-gray-400">Action:</span> {log.action}</p>
              <p><span className="text-gray-400">Entity:</span> {log.entity_type} #{log.entity_id}</p>
              <p><span className="text-gray-400">Admin ID:</span> {log.admin_id || '-'}</p>
              <p><span className="text-gray-400">Note:</span> {log.note || '-'}</p>
              <p><span className="text-gray-400">Created:</span> {new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <Link
            href={`/admin/audit-logs?page=${Math.max(1, page - 1)}`}
            className={`px-4 py-2 rounded-xl bg-[#131722] ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
          >
            Previous
          </Link>

          <p className="text-gray-400">Page {page} of {totalPages}</p>

          <Link
            href={`/admin/audit-logs?page=${Math.min(totalPages, page + 1)}`}
            className={`px-4 py-2 rounded-xl bg-[#131722] ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  )
}
