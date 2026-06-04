import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: state } = await supabaseAdmin
    .from("aviator_state")
    .select("*")
    .eq("id", "global")
    .maybeSingle()

  if (!state || state.status !== "running") {
    return NextResponse.json({ error: "Cashout unavailable" }, { status: 400 })
  }

  const multiplier = Number(state.current_multiplier || 1)

  const { data: bet } = await supabaseAdmin
    .from("aviator_bets")
    .select("*")
    .eq("round_id", state.round_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  if (!bet) {
    return NextResponse.json({ error: "No active bet found" }, { status: 400 })
  }

  const betAmount = Number(bet.bet_amount || 0)
  const payout = Number((betAmount * multiplier).toFixed(2))
  const profit = Number((payout - betAmount).toFixed(2))

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .maybeSingle()

  const newBalance = Number(profile?.balance || 0) + payout

  await supabaseAdmin
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id)

  await supabaseAdmin
    .from("aviator_bets")
    .update({
      status: "cashed_out",
      cashout_multiplier: multiplier,
      payout,
      profit,
      cashed_out_at: new Date().toISOString(),
    })
    .eq("id", bet.id)

  await supabaseAdmin.from("wallet_transactions").insert({
    user_id: user.id,
    type: "game",
    amount: payout,
    status: "completed",
    description: `KBC AVIATOR cashout at ${multiplier}x`,
  })

  return NextResponse.json({
    success: true,
    multiplier,
    payout,
    profit,
    balance: newBalance,
    message: `Cashed out at ${multiplier}x`,
  })
}
