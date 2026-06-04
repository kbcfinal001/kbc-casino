import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

function randomCrashPoint() {
  const r = Math.random()

  if (r < 0.5) return Number((1 + Math.random() * 1.2).toFixed(2))
  if (r < 0.85) return Number((2.2 + Math.random() * 2.8).toFixed(2))
  if (r < 0.97) return Number((5 + Math.random() * 7).toFixed(2))

  return Number((12 + Math.random() * 25).toFixed(2))
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { betAmount, cashoutMultiplier } = await request.json()

    const bet = Number(betAmount)
    const cashout = Number(cashoutMultiplier)

    if (!bet || bet <= 0) {
      return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 })
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("balance,balance_locked")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (profile.balance_locked) {
      return NextResponse.json({ error: "Wallet is locked by admin" }, { status: 403 })
    }

    const currentBalance = Number(profile.balance || 0)

    if (currentBalance < bet) {
      return NextResponse.json(
        { error: "Insufficient balance. Please deposit first.", needDeposit: true },
        { status: 400 }
      )
    }

    const { data: control } = await supabaseAdmin
      .from("game_controls")
      .select("crash_point,is_active")
      .eq("id", "kbc-aviator")
      .maybeSingle()

    const adminCrash = Number(control?.crash_point || 0)

    const crashPoint =
      control?.is_active && adminCrash >= 1.01
        ? Number(adminCrash.toFixed(2))
        : randomCrashPoint()

    const isWin = cashout <= crashPoint

    const payout = isWin ? Number((bet * cashout).toFixed(2)) : 0
    const profit = isWin ? Number((payout - bet).toFixed(2)) : -bet
    const newBalance = Number((currentBalance + profit).toFixed(2))
    const result = isWin ? "win" : "crash"

    const { error: balanceError } = await supabaseAdmin
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id)

    if (balanceError) {
      return NextResponse.json({ error: balanceError.message }, { status: 500 })
    }

    await supabaseAdmin.from("flyx_rounds").insert({
      user_id: user.id,
      bet_amount: bet,
      crash_point: crashPoint,
      cashout_multiplier: cashout,
      payout,
      profit,
      result,
    })

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: user.id,
      type: "game",
      amount: profit,
      status: "completed",
      description: `KBC AVIATOR ${result} | Crash ${crashPoint}x | Cashout ${cashout}x`,
    })

    return NextResponse.json({
      success: true,
      result,
      crashPoint,
      cashoutMultiplier: cashout,
      payout,
      profit,
      balance: newBalance,
      message: isWin ? `Cashed out at ${cashout}x` : `Crashed at ${crashPoint}x`,
    })
  } catch (error) {
    console.error("Aviator error:", error)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
