"use client"

import { useRouter } from "next/navigation"

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2 font-bold text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] transition"
    >
      ? Back
    </button>
  )
}
