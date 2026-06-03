import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const admin = await getCurrentAdmin()

    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [
      usersRes,
      depositsRes,
      withdrawalsRes,
      transactionsRes,
      auditLogsRes,
      adminsRes,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*'),
      supabaseAdmin.from('deposits').select('*'),
      supabaseAdmin.from('withdrawals').select('*'),
      supabaseAdmin.from('wallet_transactions').select('*'),
      supabaseAdmin.from('audit_logs').select('*').limit(20),
      supabaseAdmin.from('admin_users').select('*'),
    ])

    const users = usersRes.data || []
    const deposits = depositsRes.data || []
    const withdrawals = withdrawalsRes.data || []
    const transactions = transactionsRes.data || []
    const auditLogs = auditLogsRes.data || []
    const admins = adminsRes.data || []

    const totalDeposits = deposits
      .filter((d) => d.status === 'approved')
      .reduce(
        (sum, d) => sum + Number(d.amount || 0),
        0
      )

    const totalWithdrawals = withdrawals
      .filter((w) => w.status === 'approved')
      .reduce(
        (sum, w) => sum + Number(w.amount || 0),
        0
      )

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalAdmins: admins.length,
        totalDeposits,
        totalWithdrawals,
        pendingDeposits: deposits.filter(
          (d) => d.status === 'pending'
        ).length,
        pendingWithdrawals: withdrawals.filter(
          (w) => w.status === 'pending'
        ).length,
        totalTransactions: transactions.length,
        auditLogs: auditLogs.length,
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
