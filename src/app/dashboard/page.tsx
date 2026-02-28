import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">⛳ StrokeLab</h1>
          </div>
          <nav className="flex items-center gap-4">
            <form
              action={async () => {
                "use server"
                import("next-auth/react").then(({ signOut }) => signOut({ callbackUrl: "/" }))
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome, {session.user.name || session.user.email?.split("@")[0] || "Golfer"}! 👋
          </h2>
          <p className="text-muted-foreground mt-2">
            Ready to track your next round?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Start New Round
            </h3>
            <p className="text-muted-foreground mb-4">
              Enter your score for a new round at White Eagle.
            </p>
            <Link href="/rounds/new">
              <Button className="w-full">Enter Score</Button>
            </Link>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Round History
            </h3>
            <p className="text-muted-foreground mb-4">
              View your past rounds and performance trends.
            </p>
            <Link href="#">
              <Button variant="outline" className="w-full">View History</Button>
            </Link>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Statistics
            </h3>
            <p className="text-muted-foreground mb-4">
              Analyze your game with detailed statistics.
            </p>
            <Link href="#">
              <Button variant="outline" className="w-full">View Stats</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
