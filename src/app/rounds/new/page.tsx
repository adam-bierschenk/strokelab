import { auth } from "@/auth"
import { getCourses } from "@/app/actions/rounds"
import { RoundEntryForm } from "@/components/rounds/round-entry-form"
import { redirect } from "next/navigation"

export default async function RoundEntryPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/signin")
  }

  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">⛳ StrokeLab</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <RoundEntryForm courses={courses} />
      </main>
    </div>
  )
}
