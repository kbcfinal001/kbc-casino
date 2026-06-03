import GameTopBar from "@/components/GameTopBar"

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#090816] text-white pt-24">
      <GameTopBar />
      {children}
    </div>
  )
}
