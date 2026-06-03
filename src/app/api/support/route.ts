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

    const issueType = String(formData.get("issueType") || "")
    const message = String(formData.get("message") || "")
    const file = formData.get("photo") as File | null

    if (!issueType || !message) {
      return NextResponse.json(
        { error: "Issue type and message are required" },
        { status: 400 }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email,full_name")
      .eq("id", user.id)
      .maybeSingle()

    let photoUrl: string | null = null

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from("support-uploads")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 500 }
        )
      }

      const { data } = supabaseAdmin.storage
        .from("support-uploads")
        .getPublicUrl(fileName)

      photoUrl = data.publicUrl
    }

    const { error } = await supabaseAdmin.from("support_queries").insert({
      user_id: user.id,
      email: profile?.email || user.email,
      full_name: profile?.full_name || null,
      issue_type: issueType,
      message,
      photo_url: photoUrl,
      status: "open",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Support query submitted successfully",
    })
  } catch (error) {
    console.error("Support query error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
