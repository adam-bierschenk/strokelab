'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface LessonNoteInput {
  title: string
  content: string
  category: string
  coachName?: string
}

export interface LessonNote {
  id: string
  title: string
  content: string
  category: string
  coachName: string | null
  sharedWith: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new lesson note
 */
export async function createLessonNote(data: LessonNoteInput): Promise<{
  success: boolean
  note?: LessonNote
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const note = await prisma.lessonNote.create({
      data: {
        userId: user.id,
        title: data.title,
        content: data.content,
        category: data.category,
        coachName: data.coachName || null,
      }
    })

    revalidatePath('/lesson-notes')

    return {
      success: true,
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        coachName: note.coachName,
        sharedWith: note.sharedWith,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }
    }
  } catch (error) {
    console.error('Create lesson note error:', error)
    return { success: false, error: 'Failed to create lesson note' }
  }
}

/**
 * Get user's lesson notes
 */
export async function getUserLessonNotes(): Promise<{
  success: boolean
  notes?: LessonNote[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const notes = await prisma.lessonNote.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      notes: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        coachName: note.coachName,
        sharedWith: note.sharedWith,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }))
    }
  } catch (error) {
    console.error('Get lesson notes error:', error)
    return { success: false, error: 'Failed to get lesson notes' }
  }
}

/**
 * Get a single lesson note
 */
export async function getLessonNote(id: string): Promise<{
  success: boolean
  note?: LessonNote & { userId: string }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const note = await prisma.lessonNote.findUnique({
      where: { id }
    })

    if (!note) {
      return { success: false, error: 'Lesson note not found' }
    }

    // Check if user owns it or it's shared with them
    if (note.userId !== user.id && !note.sharedWith.includes(user.id)) {
      return { success: false, error: 'Not authorized' }
    }

    return {
      success: true,
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        coachName: note.coachName,
        sharedWith: note.sharedWith,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        userId: note.userId,
      }
    }
  } catch (error) {
    console.error('Get lesson note error:', error)
    return { success: false, error: 'Failed to get lesson note' }
  }
}

/**
 * Update a lesson note
 */
export async function updateLessonNote(
  id: string,
  data: Partial<LessonNoteInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify ownership
    const existing = await prisma.lessonNote.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    await prisma.lessonNote.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.coachName !== undefined && { coachName: data.coachName }),
      }
    })

    revalidatePath('/lesson-notes')
    revalidatePath(`/lesson-notes/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Update lesson note error:', error)
    return { success: false, error: 'Failed to update lesson note' }
  }
}

/**
 * Delete a lesson note
 */
export async function deleteLessonNote(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify ownership
    const existing = await prisma.lessonNote.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    await prisma.lessonNote.delete({
      where: { id }
    })

    revalidatePath('/lesson-notes')

    return { success: true }
  } catch (error) {
    console.error('Delete lesson note error:', error)
    return { success: false, error: 'Failed to delete lesson note' }
  }
}

/**
 * Share a lesson note with another user
 */
export async function shareLessonNote(
  noteId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify ownership
    const note = await prisma.lessonNote.findUnique({
      where: { id: noteId }
    })

    if (!note || note.userId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() }
    })

    if (!targetUser) {
      return { success: false, error: 'User not found' }
    }

    if (targetUser.id === user.id) {
      return { success: false, error: 'Cannot share with yourself' }
    }

    // Check if already shared
    if (note.sharedWith.includes(targetUser.id)) {
      return { success: false, error: 'Already shared with this user' }
    }

    await prisma.lessonNote.update({
      where: { id: noteId },
      data: {
        sharedWith: {
          push: targetUser.id
        }
      }
    })

    revalidatePath('/lesson-notes')

    return { success: true }
  } catch (error) {
    console.error('Share lesson note error:', error)
    return { success: false, error: 'Failed to share lesson note' }
  }
}

/**
 * Remove sharing from a user
 */
export async function unshareLessonNote(
  noteId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify ownership
    const note = await prisma.lessonNote.findUnique({
      where: { id: noteId }
    })

    if (!note || note.userId !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    await prisma.lessonNote.update({
      where: { id: noteId },
      data: {
        sharedWith: {
          set: note.sharedWith.filter(id => id !== userId)
        }
      }
    })

    revalidatePath('/lesson-notes')

    return { success: true }
  } catch (error) {
    console.error('Unshare lesson note error:', error)
    return { success: false, error: 'Failed to unshare lesson note' }
  }
}

/**
 * Get lesson notes shared with current user
 */
export async function getSharedLessonNotes(): Promise<{
  success: boolean
  notes?: (LessonNote & { ownerName: string | null; ownerEmail: string })[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const notes = await prisma.lessonNote.findMany({
      where: {
        sharedWith: {
          has: user.id
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return {
      success: true,
      notes: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        coachName: note.coachName,
        sharedWith: note.sharedWith,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        ownerName: note.user.name,
        ownerEmail: note.user.email,
      }))
    }
  } catch (error) {
    console.error('Get shared lesson notes error:', error)
    return { success: false, error: 'Failed to get shared notes' }
  }
}
