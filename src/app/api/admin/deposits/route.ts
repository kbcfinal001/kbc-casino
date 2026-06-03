import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get("status")
  const adminEmail = request.nextUrl.searchParams.get("adminEmail")

  let query = supabaseAdmin
    .from("deposits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  if (status) query = query.eq("status", status)
  if (adminEmail) query = query.ilike("approved_by_email", `%${adminEmail}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deposits: data || [] })
}
