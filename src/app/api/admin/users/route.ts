import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin, hasPermission } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()

    if (!currentAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (
      !currentAdmin.is_super_admin &&
      !hasPermission(currentAdmin.permissions, 'view_users')
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''

    let query = supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (q) {
      query = query.or(
        `email.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: data || [],
    })
  } catch (error) {
    console.error('Users API Error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
