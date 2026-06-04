import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { betAmount } = await request.json()
  const bet = Number(betAmount)

  if (!bet || bet <= 0) {
    return NextResponse.json({ error: "Invalid bet" }, { status: 400 })
  }

  const { data: state } = await supabaseAdmin
    .from("aviator_state")
    .select("*")
    .eq("id", "global")
    .maybeSingle()

  if (!state || state.status !== "waiting") {
    return NextResponse.json({ error: "Betting closed. Wait for next round." }, { status: 400 })
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("balance,balance_locked")
    .eq("id", user.id)
    .maybeSingle()

  const balance = Number(profile?.balance || 0)

  if (profile?.balance_locked) {
    return NextResponse.json({ error: "Wallet locked" }, { status: 403 })
  }

  if (balance < bet) {
    return NextResponse.json({ error: "Insufficient balance. Deposit first.", needDeposit: true }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from("aviator_bets")
    .select("id")
    .eq("round_id", state.round_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: "You already placed bet this round" }, { status: 400 })
  }

  await supabaseAdmin
    .from("profiles")
    .update({ balance: balance - bet })
    .eq("id", user.id)

  const { data: placedBet, error } = await supabaseAdmin
    .from("aviator_bets")
    .insert({
      round_id: state.round_id,
      user_id: user.id,
      bet_amount: bet,
      status: "active",
    })
    .select("*")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseAdmin.from("wallet_transactions").insert({
    user_id: user.id,
    type: "game",
    amount: -bet,
    status: "completed",
    description: "KBC AVIATOR bet placed",
  })

  return NextResponse.json({
    success: true,
    bet: placedBet,
    balance: balance - bet,
    message: "Bet placed. Wait for flight.",
  })
}
