'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

interface UploadPhotoData {
  roundId: string
  file: File
  caption?: string
}

export async function uploadRoundPhoto(data: UploadPhotoData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify round ownership
  const { data: round } = await supabase
    .from('rounds')
    .select('userId')
    .eq('id', data.roundId)
    .single()

  if (!round || round.userId !== user.id) {
    return { error: 'Round not found' }
  }

  try {
    // Generate unique filename
    const timestamp = Date.now()
    const fileExt = data.file.name.split('.').pop() || 'jpg'
    const fileName = `${user.id}/${data.roundId}/${timestamp}.${fileExt}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('round-photos')
      .upload(fileName, data.file, {
        contentType: data.file.type,
        upsert: false
      })

    if (uploadError) {
      return { error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('round-photos')
      .getPublicUrl(fileName)

    // Save photo record to database
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        roundId: data.roundId,
        userId: user.id,
        url: publicUrl,
        caption: data.caption || null,
        fileName: fileName
      })
      .select()
      .single()

    if (dbError) {
      // Rollback storage upload
      await supabase.storage.from('round-photos').remove([fileName])
      return { error: dbError.message }
    }

    revalidatePath(`/rounds/${data.roundId}`)
    return { success: true, photo }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: 'Failed to upload photo' }
  }
}

export async function deleteRoundPhoto(photoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get photo details
  const { data: photo } = await supabase
    .from('photos')
    .select('userId, fileName, roundId')
    .eq('id', photoId)
    .single()

  if (!photo || photo.userId !== user.id) {
    return { error: 'Photo not found' }
  }

  // Delete from storage
  if (photo.fileName) {
    await supabase.storage.from('round-photos').remove([photo.fileName])
  }

  // Delete from database
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/rounds/${photo.roundId}`)
  return { success: true }
}

export async function getRoundPhotos(roundId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', photos: [] }
  }

  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('roundId', roundId)
    .order('createdAt', { ascending: false })

  if (error) {
    return { error: error.message, photos: [] }
  }

  return { photos: photos || [] }
}
