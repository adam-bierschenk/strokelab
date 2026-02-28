import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            ⛳ StrokeLab
          </h1>
          <nav className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Track. Analyze. Improve.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Personal golf statistics dashboard for serious golfers.
            Track your scores, analyze your performance, and take your game to the next level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signin">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="text-3xl mb-4">🏌️</div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Track Rounds
              </h3>
              <p className="text-muted-foreground">
                Log your scores on the course with our mobile-first interface.
                Quick entry for score and putts per hole.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Analyze Performance
              </h3>
              <p className="text-muted-foreground">
                View detailed statistics and trends. Track your progress over time
                with comprehensive analytics.
              </p>
            </div>

            <div className="p-6 border border-border rounded-lg bg-card">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                Set Goals
              </h3>
              <p className="text-muted-foreground">
                Set personal goals for your golf game. Track your improvement
                and celebrate milestones.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 StrokeLab. Built for golfers, by golfers. 🏌️‍♀️</p>
        </div>
      </footer>
    </div>
  )
}
