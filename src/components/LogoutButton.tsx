"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()

    await supabase.auth.signOut()

    router.push("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 px-8 py-4 font-black text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105 transition"
    >
      Logout
    </button>
  )
}
