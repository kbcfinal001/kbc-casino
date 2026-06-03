import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,balance,status,balance_locked")
    .eq("id", user.id)
    .maybeSingle()

  const name = profile?.full_name || profile?.email || "Player"
  const avatar = name[0]?.toUpperCase() || "U"

  return (
    <main className="min-h-screen bg-[#090816] text-white overflow-hidden relative pb-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,90,255,0.55),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,0,120,0.35),transparent_35%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 py-5">
        <header className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-[#171035] border border-violet-400/30 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.55)]">
              <span className="text-2xl">K</span>
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-widest text-violet-100">
                KBC
              </h1>
              <p className="text-xs text-violet-300">Casino Royale</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block rounded-2xl border border-violet-400/20 bg-white/10 backdrop-blur px-4 py-2">
              <p className="text-xs text-violet-200">Wallet</p>
              <p className="text-lg font-black text-emerald-300">
                Rs {profile?.balance || 0}
              </p>
            </div>

            <Link
              href="/deposit"
              className="rounded-2xl bg-violet-600 hover:bg-violet-500 px-5 py-3 text-sm font-black shadow-[0_0_28px_rgba(139,92,246,0.7)] transition"
            >
              + Deposit
            </Link>

            <Link
              href="/profile"
              className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center font-black border border-white/20 shadow-[0_0_25px_rgba(236,72,153,0.6)]"
            >
              {avatar}
            </Link>
          </div>
        </header>

        <section className="mt-10">
          <p className="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm text-violet-100">
            Welcome back, {name}
          </p>

          <h2 className="mt-6 text-5xl md:text-7xl font-black leading-tight">
            Choose Your
            <span className="block text-violet-300 drop-shadow-[0_0_25px_rgba(167,139,250,0.9)]">
              Game Arena
            </span>
          </h2>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <GameCard
            title="Sic Bo Dice"
            desc="Roll 3 dice. Bet on Big or Small and test your luck."
            href="/games/sicbo"
            badge="Dice"
            icon="🎲"
          />

          <GameCard
            title="KBC Flip"
            desc="Flip your luck. Win 2x or lose your bet."
            href="/games/kbc-flip"
            badge="2x Win"
            icon="🃏"
          />

          <GameCard
            title="KBC Quiz Arena"
            desc="Answer questions, climb levels and win rewards."
            href="/games/kbc-quiz"
            badge="Quiz"
            icon="👑"
          />

          <GameCard
            title="Daily Missions"
            desc="Complete tasks and collect daily rewards."
            href="/programs"
            badge="Daily"
            icon="🔥"
          />

          <GameCard
            title="Rewards Zone"
            desc="Claim bonuses, cashback and VIP perks."
            href="/rewards"
            badge="Bonus"
            icon="⭐"
          />

          <GameCard
            title="Leaderboard"
            desc="Check top winners and your rank."
            href="/leaderboard"
            badge="Rank"
            icon="🏆"
          />
        </section>
      </div>

      <BottomPanel />
    </main>
  )
}

function GameCard({
  title,
  desc,
  href,
  badge,
  icon,
}: {
  title: string
  desc: string
  href: string
  badge: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[34px] border border-violet-400/20 bg-[#151029]/90 p-7 min-h-56 hover:border-violet-300/60 hover:scale-[1.02] transition shadow-[0_0_35px_rgba(109,40,217,0.18)]"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/20 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="h-16 w-16 rounded-3xl bg-violet-600/30 border border-violet-300/20 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(139,92,246,0.55)]">
            {icon}
          </div>

          <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-violet-100">
            {badge}
          </span>
        </div>

        <h3 className="mt-8 text-3xl font-black">{title}</h3>
        <p className="mt-3 text-sm text-violet-100/65">{desc}</p>

        <p className="mt-8 text-violet-300 font-black group-hover:translate-x-1 transition">
          Play Now →
        </p>
      </div>
    </Link>
  )
}

function BottomPanel() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-3xl -translate-x-1/2 rounded-[34px] border border-violet-400/20 bg-[#151029]/95 backdrop-blur-xl px-5 py-4 shadow-[0_0_45px_rgba(139,92,246,0.45)]">
      <div className="grid grid-cols-5 text-center">
        <BottomLink href="/dashboard" label="Home" icon="⌂" />
        <BottomLink href="/games/sicbo" label="Games" icon="♠" />
        <BottomLink href="/profile" label="Wallet" icon="◆" />
        <BottomLink href="/rewards" label="Rewards" icon="★" />
        <BottomLink href="/profile" label="Profile" icon="●" />
      </div>
    </nav>
  )
}

function BottomLink({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: string
}) {
  return (
    <Link href={href} className="text-white hover:text-violet-300 transition">
      <div className="text-2xl leading-none">{icon}</div>
      <div className="mt-2 text-sm">{label}</div>
    </Link>
  )
}
