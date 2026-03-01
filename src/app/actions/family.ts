'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export type FamilyMemberRole = 'admin' | 'member' | 'child'

export interface FamilyGroup {
  id: string
  name: string
  createdById: string
  createdAt: Date
  members: FamilyMember[]
}

export interface FamilyMember {
  id: string
  userId: string
  name: string | null
  email: string
  image: string | null
  role: FamilyMemberRole
  joinedAt: Date
}

/**
 * Create a new family group
 */
export async function createFamilyGroup(name: string): Promise<{ success: boolean; error?: string; group?: FamilyGroup }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Create family group and add creator as admin
    const group = await prisma.$transaction(async (tx) => {
      const familyGroup = await tx.familyGroup.create({
        data: {
          name,
          createdById: user.id,
        },
      })

      await tx.familyMember.create({
        data: {
          familyGroupId: familyGroup.id,
          userId: user.id,
          role: 'admin',
        },
      })

      return familyGroup
    })

    const fullGroup = await prisma.familyGroup.findUnique({
      where: { id: group.id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    revalidatePath('/family')

    return {
      success: true,
      group: fullGroup ? {
        id: fullGroup.id,
        name: fullGroup.name,
        createdById: fullGroup.createdById,
        createdAt: fullGroup.createdAt,
        members: fullGroup.members.map(m => ({
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
          role: m.role as FamilyMemberRole,
          joinedAt: m.joinedAt,
        })),
      } : undefined,
    }
  } catch (error) {
    console.error('Create family group error:', error)
    return { success: false, error: 'Failed to create family group' }
  }
}

/**
 * Get user's family groups
 */
export async function getUserFamilyGroups(): Promise<{ success: boolean; groups?: FamilyGroup[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const memberships = await prisma.familyMember.findMany({
      where: { userId: user.id },
      include: {
        familyGroup: {
          include: {
            members: {
              include: {
                user: true,
              },
              orderBy: {
                joinedAt: 'asc',
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    const groups = memberships.map(m => ({
      id: m.familyGroup.id,
      name: m.familyGroup.name,
      createdById: m.familyGroup.createdById,
      createdAt: m.familyGroup.createdAt,
      members: m.familyGroup.members.map(fm => ({
        id: fm.id,
        userId: fm.userId,
        name: fm.user.name,
        email: fm.user.email,
        image: fm.user.image,
        role: fm.role as FamilyMemberRole,
        joinedAt: fm.joinedAt,
      })),
    }))

    return { success: true, groups }
  } catch (error) {
    console.error('Get family groups error:', error)
    return { success: false, error: 'Failed to get family groups' }
  }
}

/**
 * Invite a user to a family group
 */
export async function inviteToFamily(
  familyGroupId: string,
  email: string,
  role: FamilyMemberRole = 'member'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is admin
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyGroupId,
        userId: user.id,
      },
    })

    if (!membership || membership.role !== 'admin') {
      return { success: false, error: 'Only admins can invite members' }
    }

    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!invitedUser) {
      return { success: false, error: 'User not found. They must sign up first.' }
    }

    // Check if already a member
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        familyGroupId,
        userId: invitedUser.id,
      },
    })

    if (existingMember) {
      return { success: false, error: 'User is already a member of this family' }
    }

    await prisma.familyMember.create({
      data: {
        familyGroupId,
        userId: invitedUser.id,
        role,
      },
    })

    revalidatePath('/family')
    return { success: true }
  } catch (error) {
    console.error('Invite to family error:', error)
    return { success: false, error: 'Failed to invite member' }
  }
}

/**
 * Remove a member from family group
 */
export async function removeFamilyMember(
  familyGroupId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is admin or removing themselves
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyGroupId,
        userId: user.id,
      },
    })

    if (!membership) {
      return { success: false, error: 'Not a member of this family' }
    }

    const memberToRemove = await prisma.familyMember.findUnique({
      where: { id: memberId },
    })

    if (!memberToRemove || memberToRemove.familyGroupId !== familyGroupId) {
      return { success: false, error: 'Member not found' }
    }

    // Only admins can remove others, or users can remove themselves
    if (membership.role !== 'admin' && memberToRemove.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Cannot remove the last admin
    if (memberToRemove.role === 'admin') {
      const adminCount = await prisma.familyMember.count({
        where: {
          familyGroupId,
          role: 'admin',
        },
      })
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot remove the last admin' }
      }
    }

    await prisma.familyMember.delete({
      where: { id: memberId },
    })

    revalidatePath('/family')
    return { success: true }
  } catch (error) {
    console.error('Remove family member error:', error)
    return { success: false, error: 'Failed to remove member' }
  }
}

/**
 * Update a family member's role
 */
export async function updateFamilyMemberRole(
  familyGroupId: string,
  memberId: string,
  newRole: FamilyMemberRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if current user is admin
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyGroupId,
        userId: user.id,
        role: 'admin',
      },
    })

    if (!membership) {
      return { success: false, error: 'Only admins can update roles' }
    }

    const memberToUpdate = await prisma.familyMember.findUnique({
      where: { id: memberId },
    })

    if (!memberToUpdate || memberToUpdate.familyGroupId !== familyGroupId) {
      return { success: false, error: 'Member not found' }
    }

    // Cannot demote the last admin
    if (memberToUpdate.role === 'admin' && newRole !== 'admin') {
      const adminCount = await prisma.familyMember.count({
        where: {
          familyGroupId,
          role: 'admin',
        },
      })
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot demote the last admin' }
      }
    }

    await prisma.familyMember.update({
      where: { id: memberId },
      data: { role: newRole },
    })

    revalidatePath('/family')
    return { success: true }
  } catch (error) {
    console.error('Update role error:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

/**
 * Get family members' rounds (for family view)
 */
export async function getFamilyRounds(familyGroupId: string): Promise<{ success: boolean; rounds?: any[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify user is member of this family
    const membership = await prisma.familyMember.findFirst({
      where: {
        familyGroupId,
        userId: user.id,
      },
    })

    if (!membership) {
      return { success: false, error: 'Not a member of this family' }
    }

    // Get all family member user IDs
    const familyMembers = await prisma.familyMember.findMany({
      where: { familyGroupId },
      select: { userId: true },
    })

    const familyUserIds = familyMembers.map(m => m.userId)

    // Get rounds for all family members with family or public visibility
    const rounds = await prisma.round.findMany({
      where: {
        userId: { in: familyUserIds },
        visibility: { in: ['family', 'public'] },
      },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return { success: true, rounds }
  } catch (error) {
    console.error('Get family rounds error:', error)
    return { success: false, error: 'Failed to get family rounds' }
  }
}
