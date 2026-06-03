'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#030304]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,60,0.18),transparent_25%),radial-gradient(circle_at_bottom,rgba(120,0,255,0.10),transparent_25%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10 text-center"
      >
        <motion.h1
          initial={{ opacity: 0, filter: 'blur(12px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="kbc-logo text-7xl md:text-9xl text-red-500"
        >
          KBC
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-4 text-gray-400 uppercase tracking-[0.35em] text-sm"
        >
          Neon Gaming Interface
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <Link href="/login" className="lux-btn bg-red-600 glow-gold">
            Enter
          </Link>

          <Link href="/signup" className="lux-btn bg-white/10 border border-white/10">
            Sign Up
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
