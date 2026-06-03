import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export type CurrentAdmin = {
  id: string
  email: string
  full_name: string | null
  is_super_admin: boolean
  is_active: boolean
  permissions: string[]
}

type AdminPermissionRow = {
  permission_key: string
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser, error } = await supabaseAdmin
    .from('admin_users')
    .select('id,email,full_name,is_super_admin,is_active')
    .eq('id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !adminUser) return null

  const { data: permissions } = await supabaseAdmin
    .from('admin_permissions')
    .select('permission_key')
    .eq('admin_id', user.id)

  return {
    id: adminUser.id,
    email: adminUser.email,
    full_name: adminUser.full_name,
    is_super_admin: Boolean(adminUser.is_super_admin),
    is_active: Boolean(adminUser.is_active),
    permissions:
      permissions?.map((p: AdminPermissionRow) => p.permission_key) || [],
  }
}

export function hasPermission(
  permissions: string[],
  permission: string
) {
  return permissions.includes(permission)
}