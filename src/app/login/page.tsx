"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleForgotPassword() {
    if (!email.trim()) {
      setMessage("Enter your email first")
      return
    }

    try {
      setResetLoading(true)
      setMessage("")

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (error) {
        setMessage(error.message)
        return
      }

      setMessage("Password reset email sent. Check your inbox.")
    } catch (error) {
      console.error("Forgot password error:", error)
      setMessage("Failed to send reset email")
    } finally {
      setResetLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (!email.trim() || !password.trim()) {
        setMessage("Email and password are required")
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error || !data.user) {
        setMessage(error?.message || "Login failed")
        return
      }

      const { data: admin } = await supabase
        .from("admin_users")
        .select("id,is_active")
        .eq("id", data.user.id)
        .eq("is_active", true)
        .maybeSingle()

      if (admin) {
        router.push("/admin")
        router.refresh()
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id,status,is_active,balance_locked")
        .eq("id", data.user.id)
        .maybeSingle()

      if (!profile) {
        await supabase.auth.signOut()
        setMessage("User profile not found")
        return
      }

      if (
        profile.is_active === false ||
        profile.status === "paused" ||
        profile.status === "deactivated"
      ) {
        await supabase.auth.signOut()
        setMessage("Your account is restricted. Contact support.")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,60,0.2),transparent_32%),radial-gradient(circle_at_bottom,rgba(120,0,255,0.14),transparent_28%)]" />

      <div className="relative z-10 w-full max-w-md rounded-[30px] border border-red-500/20 bg-white/5 backdrop-blur-xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.22)]">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-red-500">KBC</h1>
          <p className="text-zinc-400 mt-2">Login to your casino account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            autoComplete="email"
            value={email}
            disabled={loading || resetLoading}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-black/70 border border-zinc-800 px-4 py-4 outline-none focus:border-red-500 disabled:opacity-60"
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            disabled={loading || resetLoading}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl bg-black/70 border border-zinc-800 px-4 py-4 outline-none focus:border-red-500 disabled:opacity-60"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading || resetLoading}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-60 transition"
            >
              {resetLoading ? "Sending..." : "Forgot Password?"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || resetLoading}
            className="w-full rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed py-4 font-bold shadow-[0_0_25px_rgba(220,38,38,0.45)] transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-300">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          New user?{" "}
          <Link
            href="/signup"
            className="text-red-400 hover:text-red-300 font-semibold"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  )
}