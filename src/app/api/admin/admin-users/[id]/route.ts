import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin, hasPermission } from '@/lib/admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(currentAdmin.permissions, 'manage_admins')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const { fullName, isSuperAdmin, permissions } = body

  const { error: updateError } = await supabaseAdmin
    .from('admin_users')
    .update({
      full_name: fullName || null,
      is_super_admin: !!isSuperAdmin,
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabaseAdmin
    .from('admin_permissions')
    .delete()
    .eq('admin_id', id)

  if (Array.isArray(permissions) && permissions.length > 0) {
    const rows = permissions.map((permission: string) => ({
      admin_id: id,
      permission_key: permission,
    }))

    const { error: insertError } = await supabaseAdmin
      .from('admin_permissions')
      .insert(rows)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  await supabaseAdmin
    .from('admin_audit_logs')
    .insert({
      admin_id: currentAdmin.id,
      action: 'update_admin_permissions',
      entity_type: 'admin_user',
      entity_id: id,
      metadata: {
        permissions,
        isSuperAdmin,
      },
    })

  return NextResponse.json({ success: true })
}


