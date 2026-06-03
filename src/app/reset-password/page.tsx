"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const supabase = createClient()

  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Password updated successfully")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-zinc-950 p-8">
        <h1 className="text-3xl font-bold mb-6">
          Reset Password
        </h1>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 mb-4"
        />

        <button
          onClick={updatePassword}
          className="w-full rounded-xl bg-red-600 py-3 font-bold"
        >
          Update Password
        </button>

        {message && (
          <p className="mt-4 text-center text-red-300">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
