/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export type GoalType = 'SCORE_AVG' | 'ROUNDS_COUNT' | 'FAIRWAY_PCT' | 'GIR_PCT' | 'PUTTS_AVG'

interface CreateGoalData {
  type: GoalType
  title: string
  description?: string
  targetValue: number
  deadline?: string
}

interface UpdateGoalData {
  id: string
  title?: string
  description?: string
  targetValue?: number
  deadline?: string
  status?: 'active' | 'completed' | 'failed'
}

export async function createGoal(data: CreateGoalData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      userId: user.id,
      type: data.type,
      title: data.title,
      description: data.description || null,
      targetValue: data.targetValue,
      currentValue: 0,
      deadline: data.deadline || null,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/goals')
  return { success: true, goal }
}

export async function updateGoal(data: UpdateGoalData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existingGoal } = await supabase
    .from('goals')
    .select('userId')
    .eq('id', data.id)
    .single()

  if (!existingGoal || existingGoal.userId !== user.id) {
    return { error: 'Goal not found' }
  }

  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.targetValue !== undefined) updateData.targetValue = data.targetValue
  if (data.deadline !== undefined) updateData.deadline = data.deadline
  if (data.status !== undefined) updateData.status = data.status

  const { data: goal, error } = await supabase
    .from('goals')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/goals')
  return { success: true, goal }
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: existingGoal } = await supabase
    .from('goals')
    .select('userId')
    .eq('id', goalId)
    .single()

  if (!existingGoal || existingGoal.userId !== user.id) {
    return { error: 'Goal not found' }
  }

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/goals')
  return { success: true }
}

export async function getGoals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', goals: [] }
  }

  const { data: goals, error } = await supabase
    .from('goals')
    .select('*')
    .eq('userId', user.id)
    .order('createdAt', { ascending: false })

  if (error) {
    return { error: error.message, goals: [] }
  }

  // Calculate current values based on rounds
  const { data: rounds } = await supabase
    .from('rounds')
    .select('totalScore, fairwaysHit, greensInReg, totalPutts')
    .eq('userId', user.id)

  const calculatedGoals = (goals || []).map(goal => {
    let currentValue = goal.currentValue
    
    if (rounds && rounds.length > 0) {
      switch (goal.type) {
        case 'SCORE_AVG':
          currentValue = rounds.reduce((sum, r) => sum + r.totalScore, 0) / rounds.length
          break
        case 'ROUNDS_COUNT':
          currentValue = rounds.length
          break
        case 'FAIRWAY_PCT':
          const totalFairways = rounds.length * 14 // Max 14 fairways per round
          const fairwaysHit = rounds.reduce((sum, r) => sum + (r.fairwaysHit || 0), 0)
          currentValue = totalFairways > 0 ? (fairwaysHit / totalFairways) * 100 : 0
          break
        case 'GIR_PCT':
          const totalGreens = rounds.length * 18
          const greensHit = rounds.reduce((sum, r) => sum + (r.greensInReg || 0), 0)
          currentValue = totalGreens > 0 ? (greensHit / totalGreens) * 100 : 0
          break
        case 'PUTTS_AVG':
          const roundsWithPutts = rounds.filter(r => r.totalPutts != null)
          currentValue = roundsWithPutts.length > 0
            ? roundsWithPutts.reduce((sum, r) => sum + r.totalPutts, 0) / roundsWithPutts.length
            : 0
          break
      }
    }

    return {
      ...goal,
      currentValue: Math.round(currentValue * 10) / 10
    }
  })

  return { goals: calculatedGoals }
}
