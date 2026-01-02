"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface NewPostDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (url: string, ogp: any) => void
}

export function NewPostDrawer({ open, onOpenChange, onSubmit }: NewPostDrawerProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)

    // Simulate OGP fetch
    setTimeout(() => {
      const ogp = {
        title: "Shared Link",
        description: "This is a preview of the shared URL content.",
        image: "/shared-content-preview.jpg",
      }

      onSubmit(url, ogp)
      setUrl("")
      setIsLoading(false)
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Share a Link</DrawerTitle>
          <DrawerDescription>Paste a URL to share it with the community</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="px-4 pb-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-9 h-12"
                  required
                />
              </div>
            </div>
          </div>
          <DrawerFooter className="px-0 pt-4">
            <Button type="submit" className="h-12 w-full" disabled={isLoading || !url.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Preview...
                </>
              ) : (
                "Share Link"
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-12 w-full bg-transparent">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
