"use server"

import { sql } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getNewsPosts(sessionId: number, userId: string) {
  console.log("[v0] getNewsPosts called with sessionId:", sessionId, "userId:", userId)

  try {
    const posts = await sql`
      SELECT 
        np.id, 
        np.session_id, 
        np.url, 
        np.title, 
        np.description, 
        np.image_url, 
        np.created_at,
        COUNT(DISTINCT l.id) as likes,
        COUNT(DISTINCT c.id) as comments,
        CASE WHEN EXISTS (
          SELECT 1 FROM likes l2 
          WHERE l2.entity_type = 'news' 
            AND l2.entity_id = np.id 
            AND l2.user_id = ${userId}
        ) THEN true ELSE false END as is_liked
      FROM news_posts np
      LEFT JOIN likes l ON l.entity_type = 'news' AND l.entity_id = np.id
      LEFT JOIN comments c ON c.entity_type = 'news' AND c.entity_id = np.id
      WHERE np.session_id = ${sessionId}
      GROUP BY np.id
      ORDER BY np.created_at DESC
    `

    console.log("[v0] getNewsPosts result:", posts)
    console.log("[v0] getNewsPosts count:", posts.length)
    return posts
  } catch (error) {
    console.error("[v0] getNewsPosts error:", error)
    throw error
  }
}

export async function createNewsPost(data: {
  sessionId: number
  url: string
  title: string
  description: string
  imageUrl: string
}) {
  console.log("[v0] createNewsPost called with data:", data)

  try {
    const result = await sql`
      INSERT INTO news_posts (session_id, url, title, description, image_url)
      VALUES (${data.sessionId}, ${data.url}, ${data.title}, ${data.description}, ${data.imageUrl})
      RETURNING id, session_id, url, title, description, image_url, likes, created_at
    `
    console.log("[v0] createNewsPost result:", result)
    revalidatePath(`/session/${data.sessionId}`)
    return result[0]
  } catch (error) {
    console.error("[v0] createNewsPost error:", error)
    throw error
  }
}

export async function deleteNewsPost(postId: number, sessionId: number) {
  console.log("[v0] deleteNewsPost called with postId:", postId, "sessionId:", sessionId)

  try {
    await sql`
      DELETE FROM news_posts WHERE id = ${postId}
    `
    console.log("[v0] deleteNewsPost success")
    revalidatePath(`/session/${sessionId}`)
  } catch (error) {
    console.error("[v0] deleteNewsPost error:", error)
    throw error
  }
}

export async function toggleNewsLike(postId: number, sessionId: number, userId: string, isLiked: boolean) {
  console.log("[v0] toggleNewsLike called with postId:", postId, "userId:", userId, "isLiked:", isLiked)

  try {
    if (isLiked) {
      // Unlike - remove the like record
      await sql`
        DELETE FROM likes 
        WHERE user_id = ${userId} 
          AND entity_type = 'news' 
          AND entity_id = ${postId}
      `
      console.log("[v0] Unlike successful")
    } else {
      // Like - add a like record
      await sql`
        INSERT INTO likes (user_id, entity_type, entity_id, session_id)
        VALUES (${userId}, 'news', ${postId}, ${sessionId})
        ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
      `
      console.log("[v0] Like successful")
    }
    revalidatePath(`/session/${sessionId}`)
  } catch (error) {
    console.error("[v0] toggleNewsLike error:", error)
    throw error
  }
}
