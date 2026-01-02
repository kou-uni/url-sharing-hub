"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { NewsTab } from "@/components/tabs/news-tab"
import { TopicTab } from "@/components/tabs/topic-tab"
import { EvidenceTab } from "@/components/tabs/evidence-tab"
import { useParams } from "next/navigation"

export default function SessionPage() {
  const params = useParams()
  const sessionId = params.id as string

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-light">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mx-auto max-w-screen-lg px-4 h-14 flex items-center gap-3 font-light">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg text-foreground font-light">Line Up</h1>
        </div>
      </header>

      {/* Tabs */}
      <main className="mx-auto max-w-screen-lg px-4 py-6">
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="news">ニュース共有</TabsTrigger>
            <TabsTrigger value="topic">トピック発表</TabsTrigger>
            <TabsTrigger value="evidence">エビデンス</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="mt-0">
            <NewsTab sessionId={sessionId} />
          </TabsContent>

          <TabsContent value="topic" className="mt-0">
            <TopicTab sessionId={sessionId} />
          </TabsContent>

          <TabsContent value="evidence" className="mt-0">
            <EvidenceTab sessionId={sessionId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
