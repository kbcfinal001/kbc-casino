import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdmin()

  if (!admin || !admin.is_super_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      is_active: false,
      status: 'paused',
    })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/admin/users', request.url))
}
