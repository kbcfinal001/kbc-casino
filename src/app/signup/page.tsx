'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage('Signup successful. Please login.')
    router.push('/login')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#040404]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,60,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(120,0,255,0.12),transparent_25%)]" />

      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-[28px] p-8 border border-red-500/20 shadow-[0_0_40px_rgba(255,0,60,0.18)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.15 }}
            className="text-center mb-8"
          >
            <h1 className="kbc-logo text-6xl md:text-7xl text-red-500 mb-4">
              KBC
            </h1>
            <p className="text-gray-400 tracking-[0.25em] uppercase text-xs">
              Create Your Access
            </p>
          </motion.div>

          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 rounded-2xl bg-[#0b0b0f] border border-red-500/20 text-white outline-none focus:border-red-500/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-2xl bg-[#0b0b0f] border border-red-500/20 text-white outline-none focus:border-red-500/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full p-4 rounded-2xl bg-red-600 hover:bg-red-500 transition font-semibold shadow-[0_0_25px_rgba(220,38,38,0.35)]"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-4">
            <Link
              href="/login"
              className="block w-full text-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition border border-white/10"
            >
              Back to Login
            </Link>
          </div>

          {message && (
            <p className="mt-4 text-sm text-red-300 text-center">{message}</p>
          )}
        </div>
      </motion.div>
    </main>
  )
}
