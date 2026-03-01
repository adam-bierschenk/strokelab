import { supabase } from '@/lib/supabase'

export async function createCourse(data: {
  name: string
  location?: string
  par: number
  holes?: Array<{
    number: number
    par: number
    yardage?: number
    handicap?: number
  }>
}) {
  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      name: data.name,
      location: data.location,
      par: data.par
    })
    .select()
    .single()

  if (error) throw error

  if (data.holes && course) {
    const holesToInsert = data.holes.map(h => ({
      number: h.number,
      par: h.par,
      yardage: h.yardage,
      handicap: h.handicap,
      courseId: course.id
    }))

    const { error: holesError } = await supabase
      .from('holes')
      .insert(holesToInsert)

    if (holesError) throw holesError
  }

  return course
}

export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      holes:holes (*)
    `)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getCourseById(id: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      holes:holes (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}