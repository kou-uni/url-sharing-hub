"use client"

import { useState, useEffect } from "react"
import { Plus, Heart, MessageCircle, ExternalLink, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NewPostDrawer } from "@/components/new-post-drawer"
import { CommentSheet } from "@/components/comment-sheet"
import { getNewsPosts, createNewsPost, deleteNewsPost, toggleNewsLike } from "@/app/actions/news"
import { getUserId } from "@/lib/user"

interface NewsTabProps {
  sessionId: string
}

export function NewsTab({ sessionId }: NewsTabProps) {
  console.log("[v0] NewsTab rendered with sessionId:", sessionId)

  const [posts, setPosts] = useState([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    console.log("[v0] NewsTab userId useEffect triggered")
    setUserId(getUserId())
  }, [])

  useEffect(() => {
    console.log("[v0] NewsTab loadPosts useEffect triggered, userId:", userId, "sessionId:", sessionId)
    if (userId) {
      console.log("[v0] NewsTab calling loadPosts()")
      loadPosts()
    }
  }, [sessionId, userId])

  const loadPosts = async () => {
    console.log("[v0] loadPosts started for sessionId:", sessionId)
    try {
      console.log("[v0] Calling getNewsPosts with sessionId:", Number.parseInt(sessionId), "userId:", userId)
      const data = await getNewsPosts(Number.parseInt(sessionId), userId)
      console.log("[v0] getNewsPosts returned data:", data)
      console.log("[v0] Setting posts state with", data.length, "posts")
      setPosts(data)
    } catch (error) {
      console.error("[v0] Error loading news posts:", error)
    } finally {
      console.log("[v0] Setting isLoading to false")
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      await toggleNewsLike(Number.parseInt(postId), sessionId, userId, isLiked)
      await loadPosts()
    } catch (error) {
      console.error("[v0] Error toggling like:", error)
    }
  }

  const handleDelete = async (postId: string) => {
    try {
      await deleteNewsPost(Number.parseInt(postId), sessionId)
      await loadPosts()
    } catch (error) {
      console.error("[v0] Error deleting post:", error)
    }
  }

  const handleNewPost = async (url: string, ogp: any) => {
    try {
      console.log("[v0] handleNewPost called with url:", url, "ogp:", ogp)
      console.log("[v0] Creating news post with sessionId:", Number.parseInt(sessionId))
      await createNewsPost({
        sessionId: Number.parseInt(sessionId),
        url,
        title: ogp.title,
        description: ogp.description,
        imageUrl: ogp.image || "",
      })
      console.log("[v0] News post created, reloading...")
      await loadPosts()
    } catch (error) {
      console.error("[v0] Error creating post:", error)
    }
  }

  console.log("[v0] NewsTab rendering, posts count:", posts.length, "isLoading:", isLoading)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button size="sm" onClick={() => setIsDrawerOpen(true)} className="gap-2 ml-auto font-light">
          <Plus className="h-4 w-4" />
          追加
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="font-light">Loading...</p>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 group">
                  <h3 className="text-base mb-1 group-hover:text-primary transition-colors line-clamp-2 text-muted-foreground font-light">
                    {post.title}
                  </h3>
                  <p className="mb-1 group-hover:text-primary transition-colors line-clamp-2 font-light text-xs text-ring">{post.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-light">
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate break-all underline text-lg font-normal">{post.url}</span>
                  </div>
                </a>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-11 min-w-[44px]"
                    onClick={() => handleLike(post.id, post.is_liked)}
                  >
                    <motion.div animate={post.is_liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                      <Heart className={`h-5 w-5 ${post.is_liked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                    </motion.div>
                    <span className="text-sm font-light">{post.likes}</span>
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-11 min-w-[44px]"
                    onClick={() => setSelectedPostId(post.id)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-light">{post.comments}</span>
                  </Button>
                </motion.div>
              </div>
            </Card>
          ))
        )}
      </div>

      <NewPostDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} onSubmit={handleNewPost} />
      <CommentSheet
        postId={selectedPostId}
        open={!!selectedPostId}
        onOpenChange={(open) => !open && setSelectedPostId(null)}
        sessionId={Number.parseInt(sessionId)}
        entityType="news"
        onCommentAdded={loadPosts}
      />
    </div>
  )
}
