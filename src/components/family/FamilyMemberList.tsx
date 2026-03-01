'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FamilyGroup, FamilyMemberRole } from '@/app/actions/family'
import { removeFamilyMember, updateFamilyMemberRole } from '@/app/actions/family'
import { useRouter } from 'next/navigation'

interface FamilyMemberListProps {
  group: FamilyGroup
}

export function FamilyMemberList({ group }: FamilyMemberListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const router = useRouter()

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setRemovingId(memberId)
    const result = await removeFamilyMember(group.id, memberId)
    setRemovingId(null)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to remove member')
    }
  }

  const handleRoleChange = async (memberId: string, newRole: FamilyMemberRole) => {
    setUpdatingId(memberId)
    const result = await updateFamilyMemberRole(group.id, memberId, newRole)
    setUpdatingId(null)

    if (!result.success) {
      alert(result.error || 'Failed to update role')
    } else {
      router.refresh()
    }
  }

  const currentUserIsAdmin = group.members.some(
    m => m.role === 'admin' && m.userId === group.createdById
  )

  return (
    <div className="space-y-2">
      {group.members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center">
            {member.image ? (
              <Image
                src={member.image}
                alt={member.name || member.email}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                {(member.name || member.email)?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {member.name || member.email}
              </p>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentUserIsAdmin && member.userId !== group.createdById ? (
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value as FamilyMemberRole)}
                disabled={updatingId === member.id}
                className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="child">Child</option>
              </select>
            ) : (
              <span className={`text-xs px-2 py-1 rounded-full ${
                member.role === 'admin'
                  ? 'bg-green-100 text-green-700'
                  : member.role === 'child'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            )}

            {currentUserIsAdmin && member.userId !== group.createdById && (
              <button
                onClick={() => handleRemove(member.id)}
                disabled={removingId === member.id}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove member"
              >
                {removingId === member.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
