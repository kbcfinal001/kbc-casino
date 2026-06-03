import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/admin"
import { supabaseAdmin } from "@/lib/supabase/admin"

export default async function AdminQueriesPage() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect("/admin-login")
  }

  const { data: queries } = await supabaseAdmin
    .from("support_queries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-black text-red-500">
        User Queries
      </h1>

      <p className="text-zinc-400 mt-2 mb-8">
        Deposit, withdrawal, account, password and other support issues.
      </p>

      <div className="space-y-5">
        {queries?.length ? (
          queries.map((query) => (
            <div
              key={query.id}
              className="rounded-3xl border border-red-500/20 bg-zinc-950 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <p className="text-red-400 font-bold">
                    {query.issue_type}
                  </p>

                  <h2 className="text-xl font-bold mt-1">
                    {query.full_name || "Unknown User"}
                  </h2>

                  <p className="text-zinc-400 text-sm">
                    {query.email}
                  </p>

                  <p className="text-xs text-zinc-600 mt-1 break-all">
                    User ID: {query.user_id}
                  </p>
                </div>

                <div className="text-sm text-zinc-400">
                  {query.created_at
                    ? new Date(query.created_at).toLocaleString()
                    : "-"}
                </div>
              </div>

              <p className="mt-5 text-zinc-200 whitespace-pre-wrap">
                {query.message}
              </p>

              {query.photo_url && (
                <div className="mt-5">
                  <a
                    href={query.photo_url}
                    target="_blank"
                    className="text-red-400 underline"
                  >
                    Open uploaded photo
                  </a>
                </div>
              )}

              <div className="mt-5 inline-flex rounded-full bg-zinc-800 px-3 py-1 text-xs">
                Status: {query.status || "open"}
              </div>
            </div>
          ))
        ) : (
          <p className="text-zinc-400">No queries yet.</p>
        )}
      </div>
    </main>
  )
}

