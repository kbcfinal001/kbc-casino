import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { amount } = await request.json()

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("balance,balance_locked")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.balance_locked) {
    return NextResponse.json({ error: "Balance is locked" }, { status: 403 })
  }

  if (Number(profile?.balance || 0) < Number(amount)) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from("withdrawals").insert({
    user_id: user.id,
    amount: Number(amount),
    status: "pending",
    method: "manual",
  })

  await supabaseAdmin.from("wallet_transactions").insert({
    user_id: user.id,
    type: "withdrawal",
    amount: Number(amount),
    status: "pending",
    description: "Withdrawal request submitted",
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: "Withdrawal request submitted",
  })
}
