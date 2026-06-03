'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setMessage('Email and password are required')
      return
    }

    try {
      setLoading(true)
      setMessage('')

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (error || !data.user) {
        setMessage(error?.message || 'Login failed')
        return
      }

      const { data: admin, error: adminError } =
        await supabase
          .from('admin_users')
          .select(
            'id,email,is_active,is_super_admin'
          )
          .eq('id', data.user.id)
          .eq('is_active', true)
          .maybeSingle()

      if (adminError || !admin) {
        await supabase.auth.signOut()

        setMessage(
          'You do not have admin access'
        )

        return
      }

      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error(
        'Admin login error:',
        error
      )

      setMessage(
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#040404] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,60,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(120,0,255,0.12),transparent_25%)]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 35,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.7,
          ease: 'easeOut',
        }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-[28px] p-8 border border-red-500/20 bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(255,0,60,0.18)]">
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-7xl font-black text-red-500 mb-4">
              KBC
            </h1>

            <p className="text-gray-300 tracking-wide text-base">
              Admin Control Access
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <input
              type="email"
              placeholder="Admin Email"
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-[#0b0b0f] border border-red-500/20 text-white outline-none focus:border-red-500/50"
            />

            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              disabled={loading}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full p-4 rounded-2xl bg-[#0b0b0f] border border-red-500/20 text-white outline-none focus:border-red-500/50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full p-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition font-semibold shadow-[0_0_25px_rgba(220,38,38,0.35)]"
            >
              {loading
                ? 'Checking Access...'
                : 'Enter Admin Panel'}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-red-300 text-center">
              {message}
            </p>
          )}
        </div>
      </motion.div>
    </main>
  )
}
