import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { betAmount } = await request.json()
    const bet = Number(betAmount)

    if (!bet || bet <= 0) {
      return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("balance,balance_locked")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.balance_locked) {
      return NextResponse.json({ error: "Balance is locked" }, { status: 403 })
    }

    const currentBalance = Number(profile.balance || 0)

    if (currentBalance < bet) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const isWin = Math.random() < 0.48
    const payout = isWin ? bet * 2 : 0
    const profit = isWin ? bet : -bet
    const newBalance = currentBalance + profit

    const result = isWin ? "win" : "lose"

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await supabaseAdmin.from("game_rounds").insert({
      user_id: user.id,
      game_key: "kbc-flip",
      bet_amount: bet,
      result,
      payout,
      profit,
    })

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: user.id,
      type: "game",
      amount: profit,
      status: "completed",
      description: `KBC Flip ${result}`,
    })

    return NextResponse.json({
      success: true,
      result,
      betAmount: bet,
      payout,
      profit,
      balance: newBalance,
      message: isWin ? "You won!" : "You lost!",
    })
  } catch (error) {
    console.error("KBC Flip error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
