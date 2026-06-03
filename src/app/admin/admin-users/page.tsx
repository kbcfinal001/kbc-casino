import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentAdmin, hasPermission } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import ToggleAdminActive from './ToggleAdminActive'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; page?: string }>
}) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    redirect('/login')
  }

  if (!hasPermission(currentAdmin.permissions, 'manage_admins')) {
    redirect('/admin')
  }

  const params = await searchParams
  const email = params.email || ''
  const page = Number(params.page || '1')
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const supabase = await createClient()

  let countQuery = supabase.from('admin_users').select('*', { count: 'exact', head: true })
  let dataQuery = supabase.from('admin_users').select('*').order('created_at', { ascending: false }).range(from, to)

  if (email) {
    countQuery = countQuery.ilike('email', `%${email}%`)
    dataQuery = dataQuery.ilike('email', `%${email}%`)
  }

  const { count } = await countQuery
  const { data: admins } = await dataQuery

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

  return (
    <main className="page-wrap">
      <div className="glass-card rounded-[24px] p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-title">Admin Users</h1>
            <p className="muted mt-2">Manage admin accounts and permissions</p>
          </div>

          <Link
            href="/admin/admin-users/new"
            className="lux-btn bg-purple-600 glow-purple"
          >
            Create Admin
          </Link>
        </div>

        <form className="mt-6 flex gap-4">
          <input
            type="text"
            name="email"
            defaultValue={email}
            placeholder="Search by email"
            className="bg-[#131722] border border-gray-700 rounded-xl p-3 min-w-[320px]"
          />

          <button className="lux-btn bg-blue-600 glow-blue">Search</button>
        </form>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-800 bg-[#0d1117]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#131722] text-left">
                <th className="p-4">Email</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Super Admin</th>
                <th className="p-4">Active</th>
                <th className="p-4">Edit</th>
                <th className="p-4">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {admins?.map((admin) => (
                <tr key={admin.id} className="border-b border-gray-800">
                  <td className="p-4">{admin.email}</td>
                  <td className="p-4">{admin.full_name || '-'}</td>
                  <td className="p-4">{admin.is_super_admin ? 'Yes' : 'No'}</td>
                  <td className="p-4">{admin.is_active ? 'Yes' : 'No'}</td>
                  <td className="p-4">
                    <Link
                      href={`/admin/admin-users/${admin.id}`}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
                    >
                      Edit
                    </Link>
                  </td>
                  <td className="p-4">
                    <ToggleAdminActive adminId={admin.id} isActive={admin.is_active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-8">
          <Link
            href={`/admin/admin-users?email=${email}&page=${Math.max(1, page - 1)}`}
            className={`px-4 py-2 rounded-xl bg-[#131722] ${page <= 1 ? 'pointer-events-none opacity-40' : ''}`}
          >
            Previous
          </Link>

          <p className="text-gray-400">Page {page} of {totalPages}</p>

          <Link
            href={`/admin/admin-users?email=${email}&page=${Math.min(totalPages, page + 1)}`}
            className={`px-4 py-2 rounded-xl bg-[#131722] ${page >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
          >
            Next
          </Link>
        </div>
      </div>
    </main>
  )
}
