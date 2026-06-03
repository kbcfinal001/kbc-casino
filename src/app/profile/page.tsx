import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LogoutButton from "@/components/LogoutButton"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const name = profile?.full_name || profile?.email || "Player"

  return (
    <main className="min-h-screen text-white p-6 pb-32">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-[36px] border border-violet-400/20 bg-[#151029]/90 p-8 shadow-[0_0_45px_rgba(139,92,246,0.25)]">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-4xl font-black border border-white/20">
              {name[0].toUpperCase()}
            </div>

            <div>
              <h1 className="text-4xl font-black text-violet-200">
                {name}
              </h1>
              <p className="text-violet-200/70 mt-1">
                {profile?.email || user.email}
              </p>
              <p className="text-3xl font-black text-emerald-300 mt-3">
                Rs {profile?.balance || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ProfileCard title="Wallet" desc="View wallet balance" href="/wallet" />
          <ProfileCard title="Transactions" desc="View transaction history" href="/transactions" />
          <ProfileCard title="Withdraw" desc="Request withdrawal" href="/withdrawals" />
          <ProfileCard title="Deposit" desc="Add funds" href="/deposit" />
          <ProfileCard title="Support" desc="Raise query" href="/support" />
          <ProfileCard title="Rewards" desc="Claim bonus" href="/rewards" />
        </div>

        <div className="mt-10 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </main>
  )
}

function ProfileCard({
  title,
  desc,
  href,
}: {
  title: string
  desc: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-[28px] border border-violet-400/20 bg-[#151029]/90 p-6 hover:border-violet-300/60 hover:bg-violet-950/30 transition"
    >
      <h2 className="text-2xl font-black text-violet-100">{title}</h2>
      <p className="mt-2 text-violet-100/60">{desc}</p>
    </Link>
  )
}
