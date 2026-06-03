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

    const { betAmount, betType } = await request.json()
    const bet = Number(betAmount)

    if (!bet || bet <= 0) {
      return NextResponse.json({ error: "Invalid bet amount" }, { status: 400 })
    }

    if (!["big", "small", "triple"].includes(betType)) {
      return NextResponse.json({ error: "Invalid bet type" }, { status: 400 })
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

    if (currentBalance <= 0 || currentBalance < bet) {
      return NextResponse.json(
        {
          error: "Insufficient balance. Please deposit first.",
          needDeposit: true,
        },
        { status: 400 }
      )
    }

    const dice = [
      Math.ceil(Math.random() * 6),
      Math.ceil(Math.random() * 6),
      Math.ceil(Math.random() * 6),
    ]

    const total = dice.reduce((sum, n) => sum + n, 0)
    const isTriple = dice[0] === dice[1] && dice[1] === dice[2]

    let resultType = total >= 11 ? "big" : "small"
    if (isTriple) resultType = "triple"

    const isWin = betType === resultType

    const multiplier = betType === "triple" ? 8 : 2
    const payout = isWin ? bet * multiplier : 0
    const profit = isWin ? payout - bet : -bet
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
      game_key: "sicbo",
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
      description: `Sic Bo ${result} | Bet ${betType} | Dice ${dice.join("-")} | Total ${total}`,
    })

    return NextResponse.json({
      success: true,
      result,
      betType,
      resultType,
      dice,
      total,
      isTriple,
      betAmount: bet,
      payout,
      profit,
      balance: newBalance,
      message: isWin ? "You won!" : "You lost!",
    })
  } catch (error) {
    console.error("Sic Bo error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
