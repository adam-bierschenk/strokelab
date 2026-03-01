'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FamilyGroup, FamilyMemberRole } from '@/app/actions/family'
import { InviteMemberDialog } from './InviteMemberDialog'
import { FamilyMemberList } from './FamilyMemberList'

interface FamilyGroupListProps {
  groups: FamilyGroup[]
}

export function FamilyGroupList({ groups }: FamilyGroupListProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div
            className="px-4 py-4 bg-gray-50 cursor-pointer flex items-center justify-between"
            onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`text-xs px-2 py-1 rounded-full mr-3 ${
                group.members.find(m => m.userId === group.createdById)?.role === 'admin'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {group.members.find(m => m.userId === group.createdById)?.role === 'admin' ? 'Admin' : 'Member'}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedGroup === group.id ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {expandedGroup === group.id && (
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Members</h4>
                <FamilyMemberList group={group} />
              </div>

              <div className="flex space-x-3">
                <InviteMemberDialog familyGroupId={group.id} />
                <Link
                  href={`/family/${group.id}/rounds`}
                  className="flex-1 py-2 px-4 bg-blue-100 text-blue-700 text-center font-medium rounded-md hover:bg-blue-200 transition-colors"
                >
                  View Family Rounds
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
