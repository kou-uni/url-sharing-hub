"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getTopics(sessionId: number, userId?: string) {
  console.log("[v0] getTopics called with sessionId:", sessionId, "userId:", userId)
  const topics = await sql`
    SELECT id, session_id, title, memo, generated_report, created_at
    FROM topics
    WHERE session_id = ${sessionId}
    ORDER BY created_at DESC
  `
  console.log("[v0] getTopics SQL result:", topics)
  console.log("[v0] getTopics count:", topics.length)

  const topicsWithCounts = await Promise.all(
    topics.map(async (topic: any) => {
      const [likeCount] = await sql`
        SELECT COUNT(*) as count FROM likes
        WHERE entity_type = 'topic' AND entity_id = ${topic.id}
      `
      const [commentCount] = await sql`
        SELECT COUNT(*) as count FROM comments
        WHERE entity_type = 'topic' AND entity_id = ${topic.id}
      `

      let isLiked = false
      if (userId) {
        const userLike = await sql`
          SELECT id FROM likes
          WHERE entity_type = 'topic' AND entity_id = ${topic.id} AND user_id = ${userId}
        `
        isLiked = userLike.length > 0
      }

      return {
        id: topic.id.toString(),
        title: topic.title,
        memo: topic.memo,
        generatedContent: topic.generated_report,
        likes: Number.parseInt(likeCount.count) || 0,
        comments: Number.parseInt(commentCount.count) || 0,
        timestamp: topic.created_at,
        isLiked,
      }
    }),
  )

  return topicsWithCounts
}

export async function createTopic(data: {
  sessionId: string
  title: string
  memo: string
  generatedReport: string
}) {
  console.log("[v0] createTopic called with data:", {
    ...data,
    generatedReport: `${data.generatedReport.length} chars`,
  })
  const result = await sql`
    INSERT INTO topics (session_id, title, memo, generated_report)
    VALUES (${data.sessionId}, ${data.title}, ${data.memo}, ${data.generatedReport})
    RETURNING id, session_id, title, memo, generated_report, created_at
  `
  console.log("[v0] createTopic result:", result)
  revalidatePath(`/session/${data.sessionId}`)
  return result[0]
}

export async function deleteTopic(topicId: number, sessionId: string) {
  await sql`DELETE FROM likes WHERE entity_type = 'topic' AND entity_id = ${topicId}`
  await sql`DELETE FROM comments WHERE entity_type = 'topic' AND entity_id = ${topicId}`
  await sql`DELETE FROM topics WHERE id = ${topicId}`
  revalidatePath(`/session/${sessionId}`)
}

export async function toggleTopicLike(topicId: number, userId: string, shouldLike: boolean): Promise<void> {
  if (shouldLike) {
    await sql`
      INSERT INTO likes (entity_type, entity_id, user_id)
      VALUES ('topic', ${topicId}, ${userId})
      ON CONFLICT DO NOTHING
    `
  } else {
    await sql`
      DELETE FROM likes
      WHERE entity_type = 'topic' AND entity_id = ${topicId} AND user_id = ${userId}
    `
  }
}

export async function checkTopicUserLike(topicId: number, userId: string): Promise<boolean> {
  const result = await sql`
    SELECT id FROM likes
    WHERE entity_type = 'topic' AND entity_id = ${topicId} AND user_id = ${userId}
  `
  return result.length > 0
}
