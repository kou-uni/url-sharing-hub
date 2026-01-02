"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getEvidences(sessionId: number, userId: string) {
  const evidences = await sql`
    SELECT 
      e.id,
      e.session_id,
      e.image_url,
      e.description,
      e.created_at,
      COUNT(DISTINCT l.id) as likes,
      COUNT(DISTINCT c.id) as comments,
      EXISTS(
        SELECT 1 FROM likes l2 
        WHERE l2.entity_type = 'evidence' 
        AND l2.entity_id = e.id 
        AND l2.user_id = ${userId}
      ) as is_liked
    FROM evidences e
    LEFT JOIN likes l ON l.entity_type = 'evidence' AND l.entity_id = e.id
    LEFT JOIN comments c ON c.entity_type = 'evidence' AND c.entity_id = e.id
    WHERE e.session_id = ${sessionId}
    GROUP BY e.id, e.session_id, e.image_url, e.description, e.created_at
    ORDER BY e.created_at DESC
  `

  return evidences.map((e: any) => ({
    id: String(e.id),
    sessionId: e.session_id,
    imageUrl: e.image_url,
    description: e.description || "",
    likes: Number(e.likes),
    comments: Number(e.comments),
    isLiked: Boolean(e.is_liked),
    timestamp: e.created_at,
  }))
}

export async function createEvidence(data: { sessionId: number; imageUrl: string; description?: string }) {
  console.log("[v0] createEvidence called with:", data)

  const result = await sql`
    INSERT INTO evidences (session_id, image_url, description)
    VALUES (${data.sessionId}, ${data.imageUrl}, ${data.description || null})
    RETURNING id, session_id, image_url, description, created_at
  `

  console.log("[v0] createEvidence result:", result)
  revalidatePath(`/session/${data.sessionId}`)
  return result[0]
}

export async function deleteEvidence(evidenceId: number, sessionId: number) {
  await sql`DELETE FROM likes WHERE entity_type = 'evidence' AND entity_id = ${evidenceId}`
  await sql`DELETE FROM comments WHERE entity_type = 'evidence' AND entity_id = ${evidenceId}`
  await sql`DELETE FROM evidences WHERE id = ${evidenceId}`

  revalidatePath(`/session/${sessionId}`)
}

export async function toggleEvidenceLike(evidenceId: number, sessionId: number, userId: string) {
  const existing = await sql`
    SELECT id FROM likes 
    WHERE entity_type = 'evidence' 
    AND entity_id = ${evidenceId} 
    AND user_id = ${userId}
  `

  if (existing.length > 0) {
    await sql`
      DELETE FROM likes 
      WHERE entity_type = 'evidence' 
      AND entity_id = ${evidenceId} 
      AND user_id = ${userId}
    `
  } else {
    await sql`
      INSERT INTO likes (entity_type, entity_id, user_id, session_id)
      VALUES ('evidence', ${evidenceId}, ${userId}, ${sessionId})
    `
  }

  revalidatePath(`/session/${sessionId}`)
}
