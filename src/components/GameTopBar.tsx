import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function GameTopBar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let balance = 0

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .maybeSingle()

    balance = Number(profile?.balance || 0)
  }

  return (
    <div className="fixed top-4 left-1/2 z-50 w-[92%] max-w-4xl -translate-x-1/2 rounded-[28px] border border-violet-400/20 bg-[#151029]/95 backdrop-blur-xl px-5 py-3 shadow-[0_0_45px_rgba(139,92,246,0.45)]">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard" className="text-2xl font-black text-violet-200">
          KBC
        </Link>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-violet-400/20 bg-white/10 px-4 py-2">
            <p className="text-xs text-violet-200">Wallet</p>
            <p className="font-black text-emerald-300">
              Rs {balance}
            </p>
          </div>

          <Link
            href="/deposit"
            className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:bg-violet-500 transition"
          >
            + Deposit
          </Link>
        </div>
      </div>
    </div>
  )
}
