import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin, hasPermission } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
  const { isActive } = await request.json()

  const adminDb = supabaseAdmin

  const { error } = await adminDb
    .from('admin_users')
    .update({ is_active: !!isActive })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await adminDb.from('admin_audit_logs').insert({
    admin_id: currentAdmin.id,
    action: isActive ? 'activate_admin' : 'deactivate_admin',
    entity_type: 'admin_user',
    entity_id: id,
    metadata: { isActive: !!isActive },
  })

  return NextResponse.json({ success: true })
}


