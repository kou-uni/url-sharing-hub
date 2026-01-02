"use client"

// Generate or retrieve a unique user ID for this browser
export function getUserId(): string {
  if (typeof window === "undefined") return ""

  let userId = localStorage.getItem("linkhub_user_id")
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem("linkhub_user_id", userId)
  }
  return userId
}
