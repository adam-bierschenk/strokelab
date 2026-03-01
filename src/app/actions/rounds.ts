'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

interface UpdateRoundData {
  id: string
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

    // Verify ownership
    const { data: existingRound, error: findError } = await supabase
      .from('Round')
      .select('id, userId')
      .eq('id', data.id)
      .eq('userId', user.id)
      .single()

    if (findError || !existingRound) {
      return { error: 'Round not found' }
    }

    const { error } = await supabase
      .from('Round')
      .update({
        totalScore: data.totalScore,
        totalPutts: data.totalPutts || 0,
        notes: data.notes || null
      })
      .eq('id', data.id)

    if (error) throw error

    revalidatePath('/rounds')
    revalidatePath(`/rounds/${data.id}`)
    revalidatePath('/dashboard')

    return { success: true }
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

    // Verify ownership
    const { data: existingRound, error: findError } = await supabase
      .from('Round')
      .select('id, userId')
      .eq('id', roundId)
      .eq('userId', user.id)
      .single()

    if (findError || !existingRound) {
      return { error: 'Round not found' }
    }

    // Delete scores first
    await supabase.from('Score').delete().eq('roundId', roundId)

    // Delete round
    const { error } = await supabase
      .from('Round')
      .delete()
      .eq('id', roundId)

    if (error) throw error

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
    const scoresJson = formData.get('scores') as string
    // Family support
    const playedForUserId = formData.get('playedForUserId') as string
    const visibility = (formData.get('visibility') as string) || 'private'

    if (!courseId || !date) {
      return { error: 'Course and date are required' }
    }

    // Parse scores from JSON
    const holeScores: { holeId: string; score: number; putts: number }[] = scoresJson 
      ? JSON.parse(scoresJson) 
      : []
    
    // Calculate totals
    const totalScore = holeScores.reduce((sum, h) => sum + (h.score || 0), 0)
    const totalPutts = holeScores.reduce((sum, h) => sum + (h.putts || 0), 0)

    // Family support: the round owner is the person it's played for
    // The enteredById is the current user
    const roundUserId = playedForUserId || user.id
    const isFamilyRound = playedForUserId && playedForUserId !== user.id

    // Validation: If entering for a family member, verify they're actually family
    if (isFamilyRound) {
      const { data: familyCheck, error: familyError } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', roundUserId)
        .or(`family_group_id.in.(select family_group_id from family_members where user_id.eq.${user.id}))`)
        .maybeSingle()
      
      if (!familyCheck) {
        return { error: 'Not authorized to enter rounds for this user' }
      }
    }

    // Create the round
    const roundData: Record<string, any> = {
      userId: roundUserId,
      courseId,
      date: new Date(date).toISOString(),
      totalScore,
      totalPutts,
      notes: notes || null,
      visibility,
    }

    // If entering on behalf of someone else, track who entered it
    if (isFamilyRound) {
      roundData.enteredById = user.id
    }

    const { data: round, error: roundError } = await supabase
      .from('Round')
      .insert(roundData)
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
    if (isFamilyRound) {
      revalidatePath('/family')
    }

    return { success: true, round }
  } catch (error) {
    console.error('Error creating round:', error)
    return { error: 'Failed to create round' }
  }
}
