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
