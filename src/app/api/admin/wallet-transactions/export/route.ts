import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { toCsv } from '@/lib/csv'

export async function GET() {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const csv = toCsv(data || [])

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="wallet-transactions.csv"',
    },
  })
}

