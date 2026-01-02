"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getComments(sessionId: number, entityType: string, entityId: number) {
  const comments = await sql`
    SELECT id, message, created_at
    FROM comments
    WHERE session_id = ${sessionId}
      AND entity_type = ${entityType}
      AND entity_id = ${entityId}
    ORDER BY created_at ASC
  `
  return comments
}

export async function createComment(data: {
  sessionId: number
  entityType: string
  entityId: number
  message: string
}) {
  console.log("[v0] createComment called with full data:", JSON.stringify(data))
  console.log("[v0] sessionId:", data.sessionId, "type:", typeof data.sessionId)
  console.log("[v0] entityType:", data.entityType, "type:", typeof data.entityType)
  console.log("[v0] entityId:", data.entityId, "type:", typeof data.entityId)
  console.log("[v0] message:", data.message, "type:", typeof data.message)

  const result = await sql`
    INSERT INTO comments (session_id, entity_type, entity_id, message, created_at)
    VALUES (${data.sessionId}, ${data.entityType}, ${data.entityId}, ${data.message}, CURRENT_TIMESTAMP)
    RETURNING id, message, created_at
  `
  console.log("[v0] createComment result:", result)
  revalidatePath(`/session/${data.sessionId}`)
  return result[0]
}

export async function deleteComment(commentId: number, sessionId: number) {
  await sql`
    DELETE FROM comments
    WHERE id = ${commentId}
  `
  revalidatePath(`/session/${sessionId}`)
}
