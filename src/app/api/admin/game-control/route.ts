import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin, hasPermission } from "@/lib/admin"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from("game_controls")
    .select("*")
    .eq("id", "kbc-aviator")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ control: data })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (
    !admin.is_super_admin &&
    !hasPermission(admin.permissions, "manage_games")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { crashPoint } = await request.json()
  const crash = Number(crashPoint)

  if (!crash || crash < 1.01) {
    return NextResponse.json({ error: "Crash point must be 1.01 or higher" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("game_controls")
    .upsert({
      id: "kbc-aviator",
      crash_point: crash,
      is_active: true,
      updated_by: admin.id,
      updated_by_email: admin.email,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: `KBC AVIATOR crash point set to ${crash}x`,
  })
}

export async function DELETE() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (
    !admin.is_super_admin &&
    !hasPermission(admin.permissions, "manage_games")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { error } = await supabaseAdmin
    .from("game_controls")
    .upsert({
      id: "kbc-aviator",
      crash_point: null,
      is_active: true,
      updated_by: admin.id,
      updated_by_email: admin.email,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: "KBC AVIATOR set to random mode",
  })
}
