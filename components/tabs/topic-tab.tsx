"use client"

import { useState } from "react"
import type React from "react"
import { useEffect } from "react"
import { Plus, Wand2, Heart, MessageCircle, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { CommentSheet } from "@/components/comment-sheet"
import { getTopics, createTopic, deleteTopic } from "@/app/actions/topics"

interface Topic {
  id: string
  title: string
  memo: string
  generatedContent?: string
  likes: number
  comments: number
  timestamp: string
  isLiked: boolean // Added isLiked property
}

interface TopicTabProps {
  sessionId: string
}

export function TopicTab({ sessionId }: TopicTabProps) {
  console.log("[v0] TopicTab rendered with sessionId:", sessionId)

  const [topics, setTopics] = useState<Topic[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [newTopic, setNewTopic] = useState({
    title: "",
    memo: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] TopicTab useEffect triggered, loading topics for session:", sessionId)
    loadTopics()
  }, [sessionId])

  const loadTopics = async () => {
    console.log("[v0] loadTopics started for sessionId:", sessionId)
    try {
      console.log("[v0] Fetching topics...")
      const { getUserId } = await import("@/lib/user")
      const userId = getUserId()
      console.log("[v0] Got userId:", userId)
      console.log("[v0] Calling getTopics with sessionId:", Number.parseInt(sessionId))
      const data = await getTopics(Number.parseInt(sessionId), userId)
      console.log("[v0] Topics loaded:", data)
      console.log("[v0] Setting topics state with", data.length, "topics")
      setTopics(data as Topic[])
    } catch (error) {
      console.error("[v0] Error loading topics:", error)
    } finally {
      console.log("[v0] Setting isLoading to false")
      setIsLoading(false)
    }
  }

  const handleLike = async (topicId: string) => {
    try {
      const { getUserId } = await import("@/lib/user")
      const userId = getUserId()
      const { toggleTopicLike, checkTopicUserLike } = await import("@/app/actions/topics")

      const currentlyLiked = await checkTopicUserLike(Number.parseInt(topicId), userId)
      await toggleTopicLike(Number.parseInt(topicId), userId, !currentlyLiked)
      await loadTopics()
    } catch (error) {
      console.error("[v0] Error toggling like:", error)
    }
  }

  const handleDelete = async (topicId: string) => {
    try {
      await deleteTopic(Number.parseInt(topicId), sessionId)
      await loadTopics()
    } catch (error) {
      console.error("[v0] Error deleting topic:", error)
    }
  }

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] handleAddTopic called with:", newTopic)
    setIsGenerating(true)

    try {
      console.log("[v0] Calling generate-topic API...")
      const response = await fetch("/api/generate-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTopic.title,
          memo: newTopic.memo,
        }),
      })

      console.log("[v0] API response status:", response.status)
      const data = await response.json()
      console.log("[v0] Generated HTML length:", data.html?.length)

      console.log("[v0] Creating topic in database...")
      await createTopic({
        sessionId,
        title: newTopic.title,
        memo: newTopic.memo,
        generatedReport: data.html,
      })
      console.log("[v0] Topic created, reloading...")
      await loadTopics()
      setNewTopic({ title: "", memo: "" })
      setIsDrawerOpen(false)
    } catch (error) {
      console.error("[v0] Error generating topic:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  console.log("[v0] TopicTab rendering, topics count:", topics.length, "isLoading:", isLoading)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Button size="sm" onClick={() => setIsDrawerOpen(true)} className="gap-2 ml-auto font-light">
          <Plus className="h-4 w-4" />
          追加
        </Button>
      </div>

      {isLoading ? (
        <p className="font-light">Loading topics...</p>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="p-4">
              <div className="flex items-start justify-end gap-3 mb-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  onClick={() => handleDelete(topic.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {topic.generatedContent && (
                <Card className="mb-4 overflow-hidden border border-border bg-muted/30">
                  <div
                    className="p-6 prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground"
                    dangerouslySetInnerHTML={{ __html: topic.generatedContent }}
                  />
                </Card>
              )}

              <div className="flex items-center gap-1">
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-11 min-w-[44px]"
                    onClick={() => handleLike(topic.id)}
                  >
                    <motion.div animate={topic.isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                      <Heart className={`h-5 w-5 ${topic.isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                    </motion.div>
                    <span className="text-sm font-light">{topic.likes}</span>
                  </Button>
                </motion.div>

                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-11 min-w-[44px]"
                    onClick={() => setSelectedTopicId(topic.id)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-light">{topic.comments}</span>
                  </Button>
                </motion.div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>新しいトピックを追加</DrawerTitle>
            <DrawerDescription>メモから論点をまとめたページを自動生成します</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleAddTopic} className="px-4 pb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">トピック名</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="発表のタイトル"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memo">メモ</Label>
                <Textarea
                  id="memo"
                  placeholder="発表の内容や要点を記入してください"
                  value={newTopic.memo}
                  onChange={(e) => setNewTopic({ ...newTopic, memo: e.target.value })}
                  className="h-[120px] resize-none overflow-y-auto"
                  required
                />
              </div>
            </div>
            <DrawerFooter className="px-0 pt-4">
              <Button type="submit" className="h-12 w-full gap-2" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Wand2 className="h-4 w-4 animate-spin" />
                    ページ生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    生成して保存
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="h-12 w-full bg-transparent">
                  キャンセル
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <CommentSheet
        postId={selectedTopicId}
        sessionId={Number.parseInt(sessionId)}
        entityType="topic"
        open={!!selectedTopicId}
        onOpenChange={(open) => !open && setSelectedTopicId(null)}
        onCommentAdded={loadTopics}
      />
    </div>
  )
}
