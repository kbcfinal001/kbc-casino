import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("aviator_state")
      .select("*")
      .eq("id", "global")
      .maybeSingle()

    if (error) {
      return NextResponse.json({
        multiplier: 1,
        status: "waiting",
        error: error.message,
      })
    }

    return NextResponse.json({
      multiplier: Number(data?.current_multiplier || 1),
      status: data?.status || "waiting",
      roundId: data?.round_id || null,
      crashPoint: Number(data?.crash_point || 0),
      countdownEndsAt: data?.countdown_ends_at || null,
    })
  } catch (error) {
    console.error("Aviator live error:", error)

    return NextResponse.json({
      multiplier: 1,
      status: "waiting",
      error: "Live API failed",
    })
  }
}
