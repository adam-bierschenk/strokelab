'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Course {
  id: string
  name: string
  par: number
  holes: number
}

interface CourseSearchProps {
  initialCourses: Course[]
}

export default function CourseSearch({ initialCourses }: CourseSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourses = searchTerm
    ? initialCourses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : initialCourses

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 rounded-md border border-gray-300 px-3 py-2"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span>{initialCourses.length} courses total</span>
          {searchTerm && (
            <span>{filteredCourses.length} matching &quot;{searchTerm}&quot;</span>
          )}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No courses found matching &quot;{searchTerm}&quot;</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredCourses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/courses/${course.id}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-500">{course.holes} holes • Par {course.par}</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
