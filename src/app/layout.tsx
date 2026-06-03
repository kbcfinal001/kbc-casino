import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gaming Platform Admin",
  description: "Premium dark admin dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
