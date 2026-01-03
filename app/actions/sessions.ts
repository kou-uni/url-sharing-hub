"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getSessions() {
  console.log("[v0] getSessions called")
  try {
    const result = await sql`
      SELECT id, date, title, agenda, created_at
      FROM sessions
      ORDER BY date DESC, created_at DESC
    `
    console.log("[v0] getSessions result:", result)
    console.log("[v0] getSessions result length:", result.length)
    return result
  } catch (error) {
    console.error("[v0] getSessions error:", error)
    return []
  }
}

export async function createSession(data: { date: string; title: string; agenda: string }) {
  console.log("[v0] createSession called with data:", data)
  try {
    // Ensure date is in YYYY-MM-DD format
    const dateStr = data.date.split("T")[0]
    const result = await sql`
      INSERT INTO sessions (date, title, agenda)
      VALUES (${dateStr}::date, ${data.title}, ${data.agenda})
      RETURNING id, date, title, agenda, created_at
    `
    console.log("[v0] createSession result:", result)
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error("[v0] createSession error:", error)
    throw error
  }
}

export async function updateSession(sessionId: number, data: { date: string; title: string; agenda: string }) {
  console.log("[v0] updateSession called with id:", sessionId, "data:", data)
  try {
    let dateStr: string

    // Check if it's an ISO timestamp string
    if (typeof data.date === "string" && data.date.includes("T")) {
      // Extract YYYY-MM-DD from ISO format
      dateStr = data.date.split("T")[0]
    }
    // Check if it's already in YYYY-MM-DD format
    else if (typeof data.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      dateStr = data.date
    }
    // Otherwise, parse and format manually
    else {
      const date = new Date(data.date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      dateStr = `${year}-${month}-${day}`
    }

    console.log("[v0] Formatted date:", dateStr)

    const result = await sql`
      UPDATE sessions
      SET date = ${dateStr}::date, title = ${data.title}, agenda = ${data.agenda}
      WHERE id = ${sessionId}
      RETURNING id, date, title, agenda, created_at
    `
    console.log("[v0] updateSession result:", result)
    revalidatePath("/")
    return result[0]
  } catch (error) {
    console.error("[v0] updateSession error:", error)
    throw error
  }
}

export async function deleteSession(sessionId: number) {
  console.log("[v0] deleteSession called with id:", sessionId)
  try {
    await sql`
      DELETE FROM sessions WHERE id = ${sessionId}
    `
    console.log("[v0] deleteSession successful")
    revalidatePath("/")
  } catch (error) {
    console.error("[v0] deleteSession error:", error)
    throw error
  }
}
