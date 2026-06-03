import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function WalletPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance,balance_locked,balance_lock_reason")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black text-red-500">Wallet</h1>

      <div className="mt-8 rounded-3xl border border-red-500/20 bg-zinc-950 p-8 max-w-xl">
        <p className="text-zinc-400">Available Balance</p>
        <h2 className="text-6xl font-black text-green-400 mt-3">?{profile?.balance || 0}</h2>

        <p className="mt-6 text-sm text-zinc-400">
          Status: {profile?.balance_locked ? "Locked" : "Unlocked"}
        </p>

        {profile?.balance_lock_reason && (
          <p className="mt-2 text-red-300">{profile.balance_lock_reason}</p>
        )}
      </div>
    </main>
  )
}
