"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

// Mock courses data for demo
const mockCourses = [
  {
    id: "white-eagle",
    name: "White Eagle Golf Club",
    location: "Naperville, IL",
    par: 72,
    holes: [
      { id: "1", number: 1, par: 4, yardage: 420 },
      { id: "2", number: 2, par: 3, yardage: 180 },
      { id: "3", number: 3, par: 4, yardage: 400 },
      { id: "4", number: 4, par: 5, yardage: 550 },
      { id: "5", number: 5, par: 4, yardage: 430 },
      { id: "6", number: 6, par: 4, yardage: 390 },
      { id: "7", number: 7, par: 3, yardage: 170 },
      { id: "8", number: 8, par: 4, yardage: 410 },
      { id: "9", number: 9, par: 4, yardage: 450 },
      { id: "10", number: 10, par: 4, yardage: 440 },
      { id: "11", number: 11, par: 5, yardage: 530 },
      { id: "12", number: 12, par: 3, yardage: 190 },
      { id: "13", number: 13, par: 4, yardage: 380 },
      { id: "14", number: 14, par: 4, yardage: 420 },
      { id: "15", number: 15, par: 4, yardage: 400 },
      { id: "16", number: 16, par: 3, yardage: 160 },
      { id: "17", number: 17, par: 5, yardage: 510 },
      { id: "18", number: 18, par: 4, yardage: 440 },
    ],
  },
]

export async function createRound(_formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Parse form data for future use
  const data = Object.fromEntries(_formData.entries())
  console.log("Round data:", data)

  // For MVP: just redirect to dashboard
  // In production: This would save to database
  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function getCourses() {
  return mockCourses
}

export async function getRounds() {
  const session = await auth()

  if (!session?.user?.id) {
    return []
  }

  // Return empty array for MVP
  return []
}
