import Link from "next/link"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#090816] text-white relative overflow-hidden pb-24">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,90,255,0.45),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,0,120,0.28),transparent_35%)] pointer-events-none" />

      <div className="relative z-10">
        {children}
      </div>

      <nav className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-[28px] border border-violet-400/20 bg-[#151029]/90 backdrop-blur-xl px-4 py-3 shadow-[0_0_45px_rgba(139,92,246,0.45)]">
        <div className="grid grid-cols-5 text-center text-xs">
          <BottomLink href="/dashboard" label="Home" icon="⌂" />
          <BottomLink href="/games/kbc-quiz" label="Games" icon="♠" />
          <BottomLink href="/profile" label="Wallet" icon="◆" />
          <BottomLink href="/rewards" label="Rewards" icon="★" />
          <BottomLink href="/profile" label="Profile" icon="●" />
        </div>
      </nav>
    </div>
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
    <Link href={href} className="text-violet-200 hover:text-white transition">
      <div className="text-lg">{icon}</div>
      <div className="mt-1">{label}</div>
    </Link>
  )
}
