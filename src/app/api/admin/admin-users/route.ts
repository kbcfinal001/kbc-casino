import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin, hasPermission } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

const ALLOWED_PERMISSIONS = [
  'manage_admins',
  'manage_deposits',
  'manage_withdrawals',
  'view_audit_logs',
  'view_wallet_transactions',
  'view_users',
] as const

type PermissionKey = (typeof ALLOWED_PERMISSIONS)[number]

export async function POST(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!currentAdmin.is_super_admin && !hasPermission(currentAdmin.permissions, 'manage_admins')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, email, fullName, isSuperAdmin, permissions } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    const safePermissions: PermissionKey[] = Array.isArray(permissions)
      ? permissions.filter((permission): permission is PermissionKey =>
          ALLOWED_PERMISSIONS.includes(permission as PermissionKey)
        )
      : []

    const finalIsSuperAdmin = currentAdmin.is_super_admin ? !!isSuperAdmin : false

    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        id: userId,
        email,
        full_name: fullName || null,
        is_super_admin: finalIsSuperAdmin,
        is_active: true,
      })

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 500 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('admin_permissions')
      .delete()
      .eq('admin_id', userId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    if (safePermissions.length > 0) {
      const rows = safePermissions.map((permission) => ({
        admin_id: userId,
        permission_key: permission,
      }))

      const { error: permissionError } = await supabaseAdmin
        .from('admin_permissions')
        .insert(rows)

      if (permissionError) {
        return NextResponse.json({ error: permissionError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
    })
  } catch (error) {
    console.error('Create admin error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
