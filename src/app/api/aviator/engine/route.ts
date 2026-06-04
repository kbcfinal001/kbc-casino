import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

function randomCrashPoint() {
  const r = Math.random()

  if (r < 0.55) return Number((1.05 + Math.random() * 1.15).toFixed(2))
  if (r < 0.88) return Number((2.2 + Math.random() * 2.8).toFixed(2))
  if (r < 0.98) return Number((5 + Math.random() * 8).toFixed(2))

  return Number((13 + Math.random() * 25).toFixed(2))
}

export async function GET() {
  try {
    const now = Date.now()

    let { data: state } = await supabaseAdmin
      .from("aviator_state")
      .select("*")
      .eq("id", "global")
      .maybeSingle()

    if (!state) {
      await supabaseAdmin.from("aviator_state").insert({
        id: "global",
        status: "waiting",
        current_multiplier: 1,
        crash_point: 2,
        countdown_ends_at: new Date(now + 3000).toISOString(),
      })

      return NextResponse.json({
        status: "waiting",
        multiplier: 1,
        countdownMs: 3000,
      })
    }

    if (state.status === "waiting" && !state.countdown_ends_at) {
      const countdownEndsAt = new Date(now + 3000).toISOString()

      await supabaseAdmin
        .from("aviator_state")
        .update({
          current_multiplier: 1,
          countdown_ends_at: countdownEndsAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "global")

      return NextResponse.json({
        status: "waiting",
        multiplier: 1,
        countdownMs: 3000,
      })
    }

    if (state.status === "waiting") {
      const countdownEnds = new Date(state.countdown_ends_at).getTime()

      if (now < countdownEnds) {
        return NextResponse.json({
          status: "waiting",
          multiplier: 1,
          countdownMs: countdownEnds - now,
        })
      }

      const crashPoint = randomCrashPoint()
      const roundId = crypto.randomUUID()

      await supabaseAdmin
        .from("aviator_state")
        .update({
          status: "running",
          round_id: roundId,
          current_multiplier: 1,
          crash_point: crashPoint,
          round_started_at: new Date().toISOString(),
          round_crashed_at: null,
          countdown_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "global")

      return NextResponse.json({
        status: "running",
        multiplier: 1,
        crashPoint,
        roundId,
      })
    }

    if (state.status === "running") {
      const startedAt = state.round_started_at
        ? new Date(state.round_started_at).getTime()
        : now

      const elapsed = Math.max(0, now - startedAt)
      const multiplier = Number(
        (1 + elapsed / 1800 + Math.pow(elapsed / 9000, 2)).toFixed(2)
      )

      const crashPoint = Number(state.crash_point || 2)

      if (multiplier >= crashPoint) {
        const countdownEndsAt = new Date(now + 4000).toISOString()

        await supabaseAdmin
          .from("aviator_state")
          .update({
            status: "crashed",
            current_multiplier: crashPoint,
            round_crashed_at: new Date().toISOString(),
            countdown_ends_at: countdownEndsAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", "global")

        return NextResponse.json({
          status: "crashed",
          multiplier: crashPoint,
          crashPoint,
          countdownMs: 4000,
        })
      }

      await supabaseAdmin
        .from("aviator_state")
        .update({
          current_multiplier: multiplier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "global")

      return NextResponse.json({
        status: "running",
        multiplier,
        crashPoint,
        roundId: state.round_id,
      })
    }

    if (state.status === "crashed") {
      const countdownEnds = state.countdown_ends_at
        ? new Date(state.countdown_ends_at).getTime()
        : now

      if (now >= countdownEnds) {
        const nextCountdownEndsAt = new Date(now + 3000).toISOString()

        await supabaseAdmin
          .from("aviator_state")
          .update({
            status: "waiting",
            current_multiplier: 1,
            countdown_ends_at: nextCountdownEndsAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", "global")

        return NextResponse.json({
          status: "waiting",
          multiplier: 1,
          countdownMs: 3000,
        })
      }

      return NextResponse.json({
        status: "crashed",
        multiplier: Number(state.current_multiplier || 1),
        crashPoint: Number(state.crash_point || 0),
        countdownMs: countdownEnds - now,
      })
    }

    return NextResponse.json({
      status: "waiting",
      multiplier: 1,
    })
  } catch (error) {
    console.error("Aviator engine error:", error)

    return NextResponse.json({
      status: "waiting",
      multiplier: 1,
      error: "Engine failed",
    })
  }
}
