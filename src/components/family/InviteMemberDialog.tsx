'use client'

import { useState } from 'react'
import { inviteToFamily, FamilyMemberRole } from '@/app/actions/family'
import { useRouter } from 'next/navigation'

interface InviteMemberDialogProps {
  familyGroupId: string
}

export function InviteMemberDialog({ familyGroupId }: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<FamilyMemberRole>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')
    setSuccess(false)

    const result = await inviteToFamily(familyGroupId, email.trim(), role)

    if (result.success) {
      setEmail('')
      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        router.refresh()
      }, 1500)
    } else {
      setError(result.error || 'Failed to invite member')
    }

    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
      >
        + Invite Member
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Invite Family Member</h3>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setEmail('')
                  setError('')
                  setSuccess(false)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="family@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">They must have a StrokeLab account</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as FamilyMemberRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="admin">Admin - Full access</option>
                  <option value="member">Member - Can view all stats</option>
                  <option value="child">Child - Limited access</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {role === 'admin' && 'Can manage members and view all family data'}
                  {role === 'member' && 'Can view family stats and enter scores'}
                  {role === 'child' && 'Can only view own stats'}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-600">Member invited successfully!</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex-1 py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setEmail('')
                    setError('')
                    setSuccess(false)
                  }}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
