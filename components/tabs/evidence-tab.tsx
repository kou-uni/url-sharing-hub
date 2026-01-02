"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Plus, Heart, MessageCircle, Trash2, Upload, X } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { getEvidences, createEvidence, deleteEvidence, toggleEvidenceLike } from "@/app/actions/evidences"
import { getUserId } from "@/lib/user"

interface Evidence {
  id: string
  description: string
  imageUrl: string
  likes: number
  comments: number
  timestamp: string
  isLiked: boolean
}

interface EvidenceTabProps {
  sessionId: string
}

export function EvidenceTab({ sessionId }: EvidenceTabProps) {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null)
  const [newEvidence, setNewEvidence] = useState({
    description: "",
    imageUrl: "",
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const pasteAreaRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEvidences()
  }, [sessionId])

  const loadEvidences = async () => {
    try {
      setError(null)
      setIsLoading(true)
      const userId = getUserId()
      const data = await getEvidences(Number.parseInt(sessionId), userId)
      setEvidenceList(data as Evidence[])
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (evidenceId: string) => {
    try {
      const userId = getUserId()
      await toggleEvidenceLike(Number.parseInt(evidenceId), Number.parseInt(sessionId), userId)
      await loadEvidences()
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleDelete = async (evidenceId: string) => {
    try {
      await deleteEvidence(Number.parseInt(evidenceId), Number.parseInt(sessionId))
      await loadEvidences()
    } catch (error) {
      console.error("Error deleting evidence:", error)
    }
  }

  const handleClearImage = () => {
    setPreviewImage(null)
    setNewEvidence((prev) => ({ ...prev, imageUrl: "" }))
  }

  useEffect(() => {
    if (!isDrawerOpen) return

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile()
          if (blob) {
            const reader = new FileReader()
            reader.onloadend = () => {
              const result = reader.result as string
              setPreviewImage(result)
              setNewEvidence((prev) => ({ ...prev, imageUrl: result }))
            }
            reader.readAsDataURL(blob)
          }
          e.preventDefault()
          break
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isDrawerOpen])

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEvidence({
        sessionId: Number.parseInt(sessionId),
        imageUrl: newEvidence.imageUrl,
        description: newEvidence.description,
      })
      await loadEvidences()
      setNewEvidence({ description: "", imageUrl: "" })
      setPreviewImage(null)
      setIsDrawerOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <div>
      {isLoading ? (
        <p className="font-light">Loading evidences...</p>
      ) : error ? (
        <div className="p-4 border border-red-500 rounded">
          <p className="text-red-500 font-light">Error: {error}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Button size="sm" onClick={() => setIsDrawerOpen(true)} className="gap-2 ml-auto font-light">
              <Plus className="h-4 w-4" />
              エビデンスを追加
            </Button>
          </div>

          {evidenceList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 font-light">
              エビデンスがまだありません。追加ボタンから登録してください。
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidenceList.map((evidence) => (
                <Card key={evidence.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={evidence.imageUrl || "/placeholder.svg?height=400&width=600"}
                      alt="Evidence"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <p className="text-sm text-muted-foreground flex-1 font-light">{evidence.description}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                        onClick={() => handleDelete(evidence.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 h-9 min-w-[44px]"
                          onClick={() => handleLike(evidence.id)}
                        >
                          <motion.div
                            animate={evidence.isLiked ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Heart
                              className={`h-4 w-4 ${evidence.isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`}
                            />
                          </motion.div>
                          <span className="text-sm font-light">{evidence.likes}</span>
                        </Button>
                      </motion.div>

                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 h-9 min-w-[44px]"
                          onClick={() => setSelectedEvidenceId(evidence.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm font-light">{evidence.comments}</span>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>新しいエビデンスを追加</DrawerTitle>
                <DrawerDescription>Ctrl+Vでスクリーンショットを貼り付けてください</DrawerDescription>
              </DrawerHeader>
              <form onSubmit={handleAddEvidence} className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenshot">スクリーンショット</Label>
                    {previewImage ? (
                      <div className="relative w-full max-h-[200px] rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={previewImage || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full max-h-[200px] object-contain bg-muted"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={handleClearImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        ref={pasteAreaRef}
                        className="w-full h-[120px] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 bg-muted/50"
                      >
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center px-4 font-light">
                          Ctrl+V でスクリーンショットを貼り付け
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">説明（任意）</Label>
                    <Textarea
                      id="description"
                      placeholder="説明や補足情報"
                      value={newEvidence.description}
                      onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                      className="h-[80px] resize-none overflow-y-auto"
                    />
                  </div>
                </div>
                <DrawerFooter className="px-0 pt-4">
                  <Button type="submit" className="h-12 w-full text-base font-light" disabled={!newEvidence.imageUrl}>
                    保存
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
            postId={selectedEvidenceId}
            sessionId={Number.parseInt(sessionId)}
            entityType="evidence"
            open={!!selectedEvidenceId}
            onOpenChange={(open) => !open && setSelectedEvidenceId(null)}
            onCommentAdded={loadEvidences}
          />
        </>
      )}
    </div>
  )
}
