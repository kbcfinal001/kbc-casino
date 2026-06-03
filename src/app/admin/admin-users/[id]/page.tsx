import { redirect } from 'next/navigation'
import { getCurrentAdmin, hasPermission } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import EditAdminPermissionsForm from './EditAdminPermissionsForm'

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) redirect('/login')
  if (!hasPermission(currentAdmin.permissions, 'manage_admins')) redirect('/admin')

  const { id } = await params
  const supabase = await createClient()

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', id)
    .single()

  const { data: permissions } = await supabase
    .from('admin_permissions')
    .select('permission_key')
    .eq('admin_id', id)

  return (
    <main className="min-h-screen bg-[#05070d] text-white p-8">
      <h1 className="text-3xl font-bold">Edit Admin Permissions</h1>
      {admin && (
        <EditAdminPermissionsForm
          adminId={admin.id}
          email={admin.email}
          fullName={admin.full_name || ''}
          isSuperAdmin={admin.is_super_admin}
          initialPermissions={permissions?.map((p) => p.permission_key) || []}
        />
      )}
    </main>
  )
}
