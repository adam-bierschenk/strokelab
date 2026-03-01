'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

interface UpdateRoundData {
  id: string
  userId: string
  totalScore: number
  totalPutts?: number
  fairwaysHit?: number
  greensInReg?: number
  notes?: string
}

export async function updateRound(data: UpdateRoundData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { id, ...roundData } = data

    // Verify the round belongs to the user
    const { data: existingRound, error: findError } = await supabase
      .from('Round')
      .select('id')
      .eq('id', id)
      .eq('userId', user.id)
      .single()

    if (findError || !existingRound) {
      return { error: 'Round not found' }
    }

    // Update the round
    const { data: updatedRound, error: updateError } = await supabase
      .from('Round')
      .update(roundData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return { error: 'Failed to update round' }
    }

    revalidatePath('/rounds')
    revalidatePath(`/rounds/${id}`)
    revalidatePath('/dashboard')

    return { success: true, round: updatedRound }
  } catch (error) {
    console.error('Error updating round:', error)
    return { error: 'Failed to update round' }
  }
}

export async function deleteRound(roundId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify the round belongs to the user
    const { data: existingRound, error: findError } = await supabase
      .from('Round')
      .select('id')
      .eq('id', roundId)
      .eq('userId', user.id)
      .single()

    if (findError || !existingRound) {
      return { error: 'Round not found' }
    }

    // Delete related scores first
    await supabase
      .from('Score')
      .delete()
      .eq('roundId', roundId)

    // Delete the round
    const { error: deleteError } = await supabase
      .from('Round')
      .delete()
      .eq('id', roundId)

    if (deleteError) {
      return { error: 'Failed to delete round' }
    }

    revalidatePath('/rounds')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error deleting round:', error)
    return { error: 'Failed to delete round' }
  }
}

export async function createRound(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const courseId = formData.get('courseId') as string
    const date = formData.get('date') as string
    const notes = formData.get('notes') as string

    // Get hole scores from form data
    const holeScores: { holeId: string; score: number; putts: number }[] = []
    let totalScore = 0
    let totalPutts = 0

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('hole-') && key.endsWith('-score')) {
        const holeId = key.replace('hole-', '').replace('-score', '')
        const score = parseInt(value as string, 10)
        const puttsKey = `hole-${holeId}-putts`
        const puttsValue = formData.get(puttsKey)
        const putts = puttsValue ? parseInt(puttsValue as string, 10) : 0

        if (score > 0) {
          holeScores.push({ holeId, score, putts })
          totalScore += score
          totalPutts += putts
        }
      }
    }

    // Create the round
    const { data: round, error: roundError } = await supabase
      .from('Round')
      .insert({
        userId: user.id,
        courseId,
        date: new Date(date).toISOString(),
        totalScore,
        totalPutts,
        notes: notes || null
      })
      .select()
      .single()

    if (roundError || !round) {
      return { error: 'Failed to create round' }
    }

    // Create scores
    if (holeScores.length > 0) {
      const { error: scoresError } = await supabase
        .from('Score')
        .insert(
          holeScores.map(hs => ({
            roundId: round.id,
            holeId: hs.holeId,
            score: hs.score,
            putts: hs.putts
          }))
        )

      if (scoresError) {
        console.error('Error creating scores:', scoresError)
      }
    }

    revalidatePath('/rounds')
    revalidatePath('/dashboard')

    return { success: true, round }
  } catch (error) {
    console.error('Error creating round:', error)
    return { error: 'Failed to create round' }
  }
}
