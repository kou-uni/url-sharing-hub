"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getComments, createComment, deleteComment } from "@/app/actions/comments"

interface CommentSheetProps {
  postId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: number
  entityType: string
  onCommentAdded?: () => void
}

export function CommentSheet({ postId, open, onOpenChange, sessionId, entityType, onCommentAdded }: CommentSheetProps) {
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    if (open && postId) {
      loadComments()
    }
  }, [open, postId])

  const loadComments = async () => {
    if (!postId) return
    try {
      const data = await getComments(sessionId, entityType, Number.parseInt(postId))
      setComments(data)
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !postId) return

    const commentData = {
      sessionId,
      entityType,
      entityId: Number.parseInt(postId),
      message: comment,
    }

    try {
      await createComment(commentData)
      setComment("")
      await loadComments()
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (error) {
      console.error("Error creating comment:", error)
    }
  }

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId, sessionId)
      await loadComments()
      if (onCommentAdded) {
        onCommentAdded()
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle>Comments</SheetTitle>
          <SheetDescription>Share your thoughts</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 font-light">まだコメントがありません</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="group border-l-2 border-border pl-4 py-2 flex items-start justify-between gap-2 hover:bg-muted/50 transition-colors rounded-r"
              >
                <p className="text-sm text-foreground break-words flex-1 font-light">{comment.message}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(comment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを追加..."
              className="flex-1 h-11"
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={!comment.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
