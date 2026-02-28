'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

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
    const { id, userId, ...roundData } = data

    // Verify the round belongs to the user
    const existingRound = await prisma.round.findFirst({
      where: { id, userId }
    })

    if (!existingRound) {
      return { error: 'Round not found' }
    }

    // Update the round
    const updatedRound = await prisma.round.update({
      where: { id },
      data: roundData
    })

    revalidatePath('/rounds')
    revalidatePath(`/rounds/${id}`)
    revalidatePath('/dashboard')

    return { success: true, round: updatedRound }
  } catch (error) {
    console.error('Error updating round:', error)
    return { error: 'Failed to update round' }
  }
}

export async function deleteRound(roundId: string, userId: string) {
  try {
    // Verify the round belongs to the user
    const existingRound = await prisma.round.findFirst({
      where: { id: roundId, userId }
    })

    if (!existingRound) {
      return { error: 'Round not found' }
    }

    // Delete the round (cascade will delete associated scores)
    await prisma.round.delete({
      where: { id: roundId }
    })

    revalidatePath('/rounds')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error deleting round:', error)
    return { error: 'Failed to delete round' }
  }
}
