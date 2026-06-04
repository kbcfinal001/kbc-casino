import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const { data } = await supabaseAdmin
    .from("aviator_state")
    .select("*")
    .eq("id", "global")
    .single()

  const current = Number(data?.current_multiplier || 1)

  const next = Number((current + 0.03 + current * 0.01).toFixed(2))

  await supabaseAdmin
    .from("aviator_state")
    .update({
      current_multiplier: next,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "global")

  return NextResponse.json({
    success: true,
    multiplier: next,
  })
}
