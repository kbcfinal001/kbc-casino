import BackButton from "@/components/BackButton"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-black/90 backdrop-blur p-4">
        <BackButton />
      </div>

      {children}
    </div>
  )
}
