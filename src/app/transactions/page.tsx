import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black text-red-500">Transaction History</h1>

      <div className="mt-8 space-y-4">
        {transactions?.length ? (
          transactions.map((tx) => (
            <div key={tx.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 flex justify-between">
              <div>
                <p className="font-bold capitalize">{tx.type}</p>
                <p className="text-sm text-zinc-400">{tx.description}</p>
                <p className="text-xs text-zinc-600">{new Date(tx.created_at).toLocaleString()}</p>
              </div>

              <div className="text-right">
                <p className="text-xl font-black text-red-400">?{tx.amount}</p>
                <p className="text-xs text-zinc-400">{tx.status}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-zinc-400">No transactions yet.</p>
        )}
      </div>
    </main>
  )
}
