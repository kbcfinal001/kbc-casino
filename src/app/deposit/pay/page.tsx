import { Suspense } from "react"
import DepositPayClient from "./DepositPayClient"

export default function DepositPayPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090816] text-white flex items-center justify-center">
          Loading payment page...
        </main>
      }
    >
      <DepositPayClient />
    </Suspense>
  )
}
