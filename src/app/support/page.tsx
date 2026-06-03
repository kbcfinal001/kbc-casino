"use client"

import { useState } from "react"

const issues = [
  "Deposit",
  "Withdraw",
  "Account Status",
  "Password Change",
  "Balance Issue",
  "Other",
]

export default function SupportPage() {
  const [issueType, setIssueType] = useState("Deposit")
  const [message, setMessage] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  async function submitQuery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResponse("")

    const formData = new FormData()
    formData.append("issueType", issueType)
    formData.append("message", message)

    if (photo) {
      formData.append("photo", photo)
    }

    const res = await fetch("/api/support", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    setResponse(data.message || data.error || "Done")
    setLoading(false)

    if (res.ok) {
      setMessage("")
      setPhoto(null)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={submitQuery}
        className="w-full max-w-xl rounded-[30px] border border-red-500/20 bg-zinc-950 p-8 shadow-[0_0_45px_rgba(220,38,38,0.22)]"
      >
        <h1 className="text-4xl font-black text-red-500">
          Chat Support
        </h1>

        <p className="text-zinc-400 mt-2 mb-6">
          Submit your issue. Admin team will review it.
        </p>

        <label className="text-sm text-zinc-400">
          Select Issue
        </label>

        <select
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-4 outline-none focus:border-red-500"
        >
          {issues.map((issue) => (
            <option key={issue} value={issue}>
              {issue}
            </option>
          ))}
        </select>

        <label className="block mt-5 text-sm text-zinc-400">
          Message
        </label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explain your issue..."
          rows={5}
          className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-4 outline-none focus:border-red-500"
        />

        <label className="block mt-5 text-sm text-zinc-400">
          Upload Photo / Screenshot
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="mt-2 w-full rounded-2xl bg-black border border-zinc-800 px-4 py-4"
        />

        <button
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-red-600 py-4 font-bold hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Query"}
        </button>

        {response && (
          <p className="mt-4 text-center text-red-300">
            {response}
          </p>
        )}
      </form>
    </main>
  )
}
