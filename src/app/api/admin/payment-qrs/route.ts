import { NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin, hasPermission } from "@/lib/admin"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (
      !admin.is_super_admin &&
      !hasPermission(admin.permissions, "manage_payment_qr")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()

    const title = String(formData.get("title") || "")
    const upiId = String(formData.get("upiId") || "")
    const qr = formData.get("qr") as File | null

    if (!title || !qr) {
      return NextResponse.json(
        { error: "Title and QR image are required" },
        { status: 400 }
      )
    }

    const bytes = await qr.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = qr.name.split(".").pop()
    const fileName = `${admin.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from("payment-qrs")
      .upload(fileName, buffer, {
        contentType: qr.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("payment-qrs")
      .getPublicUrl(fileName)

    await supabaseAdmin
      .from("payment_qrs")
      .update({ is_active: false })
      .eq("is_active", true)

    const { error } = await supabaseAdmin.from("payment_qrs").insert({
      title,
      upi_id: upiId || null,
      qr_image_url: urlData.publicUrl,
      is_active: true,
      created_by: admin.id,
      created_by_email: admin.email,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "QR uploaded and activated successfully",
    })
  } catch (error) {
    console.error("QR upload error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
