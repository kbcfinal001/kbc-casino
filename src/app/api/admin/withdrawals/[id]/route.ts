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

  if (!hasPermission(currentAdmin.permissions, 'approve_withdrawals')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const action = body.action as 'first_review' | 'approve' | 'reject'
  const note = body.note || ''

  let fn = ''

  if (action === 'first_review') fn = 'withdrawal_first_review'
  if (action === 'approve') fn = 'withdrawal_second_approve'
  if (action === 'reject') fn = 'reject_withdrawal_request_v2'

  if (!fn) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin.rpc(fn, {
    p_request_id: Number(id),
    p_admin_id: currentAdmin.id,
    p_admin_note: note,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}


