import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/admin"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await getCurrentAdmin()

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { action } = await request.json()

  const { data: deposit, error: depositError } = await supabaseAdmin
    .from("deposits")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (depositError || !deposit) {
    return NextResponse.json({ error: "Deposit not found" }, { status: 404 })
  }

  if (deposit.status !== "pending") {
    return NextResponse.json({ error: "Deposit already processed" }, { status: 400 })
  }

  if (action === "reject") {
    const { error } = await supabaseAdmin
      .from("deposits")
      .update({
        status: "rejected",
        rejected_by: admin.id,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  if (action !== "approve") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("balance")
    .eq("id", deposit.user_id)
    .maybeSingle()

  const oldBalance = Number(profile?.balance || 0)
  const amount = Number(deposit.amount || 0)
  const newBalance = oldBalance + amount

  const { error: updateBalanceError } = await supabaseAdmin
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", deposit.user_id)

  if (updateBalanceError) {
    return NextResponse.json({ error: updateBalanceError.message }, { status: 500 })
  }

  const { error: updateDepositError } = await supabaseAdmin
    .from("deposits")
    .update({
      status: "approved",
      approved_by: admin.id,
      approved_by_email: admin.email,
      approved_by_name: admin.full_name,
      approved_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateDepositError) {
    return NextResponse.json({ error: updateDepositError.message }, { status: 500 })
  }

  await supabaseAdmin.from("wallet_transactions").insert({
    user_id: deposit.user_id,
    type: "deposit",
    amount,
    status: "completed",
    description: `Deposit approved by ${admin.email}`,
  })

  return NextResponse.json({ success: true })
}
