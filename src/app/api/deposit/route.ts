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

    const formData = await request.formData()

    const amount = Number(formData.get("amount"))
    const qrId = String(formData.get("qrId") || "")
    const proof = formData.get("proof") as File | null

    if (!amount || amount <= 0 || !qrId || !proof) {
      return NextResponse.json(
        { error: "Amount, QR and proof are required" },
        { status: 400 }
      )
    }

    const bytes = await proof.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = proof.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("deposit-proofs")
      .upload(fileName, buffer, {
        contentType: proof.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("deposit-proofs")
      .getPublicUrl(fileName)

    const { error } = await supabaseAdmin.from("deposits").insert({
      user_id: user.id,
      amount,
      qr_id: qrId,
      proof_url: urlData.publicUrl,
      status: "pending",
      method: "qr",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount,
      status: "pending",
      description: "Deposit proof submitted",
    })

    return NextResponse.json({
      success: true,
      message: "Deposit proof submitted. Waiting for admin approval.",
    })
  } catch (error) {
    console.error("Deposit error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
