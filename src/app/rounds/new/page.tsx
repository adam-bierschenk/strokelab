import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { RoundEntryForm } from '@/components/rounds/round-entry-form'
import { getUserFamilyGroups } from '@/app/actions/family'

export const metadata: Metadata = {
  title: 'New Round | StrokeLab',
}

async function getCourses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      par,
      holes:holes (
        id,
        holeNumber,
        par,
        length
      )
    `)
    .order('name')

  if (error || !courses) {
    console.error('Error fetching courses:', error)
    return []
  }

  // Transform to match component interface
  return courses.map(course => ({
    id: course.id,
    name: course.name,
    par: course.par,
    holes: (course.holes || []).map((h: any) => ({
      id: h.id,
      number: h.number,
      par: h.par,
      yardage: h.length
    })).sort((a: any, b: any) => a.number - b.number)
  }))
}

export default async function NewRoundPage() {
  const [courses, familyResult] = await Promise.all([
    getCourses(),
    getUserFamilyGroups()
  ])
  
  if (courses === null) {
    redirect('/signin')
  }

  // Build family members list for "Play as" selector
  const familyMembers = familyResult.success && familyResult.groups
    ? familyResult.groups.flatMap(g => 
        g.members.map(m => ({
          userId: m.userId,
          name: m.name || m.email,
          email: m.email,
          groupName: g.name
        }))
      ).filter((m, i, self) => 
        // Remove duplicates (user might be in multiple groups)
        self.findIndex(t => t.userId === m.userId) === i
      )
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Round</h1>
          <p className="text-gray-600">Enter your round scores</p>
        </div>
        
        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No courses available.</p>
            <p className="text-sm text-gray-500">Please add a course first.</p>
          </div>
        ) : (
          <RoundEntryForm courses={courses} familyMembers={familyMembers} />
        )}
      </div>
    </div>
  )
}
