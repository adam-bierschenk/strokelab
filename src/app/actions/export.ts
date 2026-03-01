'use server'

import { createClient } from '@/lib/supabase-server'
import Papa from 'papaparse'

interface RoundExportData {
  date: string
  courseName: string
  totalScore: number
  totalPutts: number
  fairwaysHit?: number
  greensInReg?: number
  notes?: string
}

export async function exportRoundsToCSV(): Promise<{ data?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: rounds, error } = await supabase
    .from('rounds')
    .select(`
      id,
      date,
      totalScore,
      totalPutts,
      fairwaysHit,
      greensInReg,
      notes,
      course:courses (
        name
      )
    `)
    .eq('userId', user.id)
    .order('date', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  if (!rounds || rounds.length === 0) {
    return { error: 'No rounds to export' }
  }

  // Format data for CSV
  const exportData = rounds.map((round: any) => ({
    Date: new Date(round.date).toLocaleDateString('en-US'),
    Course: round.course?.[0]?.name || 'Unknown',
    Score: round.totalScore,
    Par_Differential: '', // Will calculate below if we had course par
    Putts: round.totalPutts || '',
    Fairways_Hit: round.fairwaysHit || '',
    Greens_in_Regulation: round.greensInReg || '',
    Notes: round.notes || ''
  }))

  // Generate CSV
  const csv = Papa.unparse(exportData, {
    header: true
  })

  return { data: csv }
}

export async function getRoundsForPDF(): Promise<{ rounds?: any[]; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: rounds, error } = await supabase
    .from('rounds')
    .select(`
      id,
      date,
      totalScore,
      totalPutts,
      fairwaysHit,
      greensInReg,
      notes,
      course:courses (
        name,
        par
      )
    `)
    .eq('userId', user.id)
    .order('date', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { rounds: rounds || [] }
}

export async function getStatsForExport(): Promise<{ stats?: any; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: rounds, error } = await supabase
    .from('rounds')
    .select('totalScore, totalPutts, fairwaysHit, greensInReg')
    .eq('userId', user.id)

  if (error) {
    return { error: error.message }
  }

  if (!rounds || rounds.length === 0) {
    return { stats: null }
  }

  const totalRounds = rounds.length
  const scores = rounds.map((r: any) => r.totalScore)
  const avgScore = scores.reduce((sum: number, s: number) => sum + s, 0) / totalRounds
  const bestScore = Math.min(...scores)

  const puttsRounds = rounds.filter((r: any) => r.totalPutts)
  const avgPutts = puttsRounds.length > 0
    ? puttsRounds.reduce((sum: number, r: any) => sum + r.totalPutts, 0) / puttsRounds.length
    : 0

  return {
    stats: {
      totalRounds,
      avgScore: Math.round(avgScore * 10) / 10,
      bestScore,
      avgPutts: Math.round(avgPutts * 10) / 10
    }
  }
}
