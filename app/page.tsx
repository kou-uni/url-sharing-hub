"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, CalendarIcon, Trash2, ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import Link from "next/link"
import { getSessions, createSession, deleteSession, updateSession } from "@/app/actions/sessions"

interface StudySession {
  id: number
  date: string
  title: string
  agenda: string
}

function SimpleDatePicker({
  selected,
  onSelect,
}: {
  selected: Date | undefined
  onSelect: (date: Date) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"]

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <div className="flex items-center justify-between mb-4">
        <Button type="button" variant="ghost" size="sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-semibold text-sm">
          {year}年 {month + 1}月
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />
          }
          const date = new Date(year, month, day)
          const isSelected = selected && date.toDateString() === selected.toDateString()

          return (
            <button
              key={day}
              type="button"
              className={`h-8 w-8 text-sm rounded-md hover:bg-accent transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-transparent"
              }`}
              onClick={() => {
                console.log("[v0] Date button clicked:", day)
                onSelect(date)
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<StudySession | null>(null)
  const [newSession, setNewSession] = useState({
    date: "",
    title: "",
    agenda: "",
  })
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [editSelectedDate, setEditSelectedDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(true)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const localDateStr = `${year}-${month}-${day}`
    setNewSession({ ...newSession, date: localDateStr })
  }

  const handleEditDateSelect = (date: Date) => {
    setEditSelectedDate(date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const localDateStr = `${year}-${month}-${day}`
    if (editingSession) {
      setEditingSession({ ...editingSession, date: localDateStr })
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await getSessions()
      setSessions(data as StudySession[])
    } catch (error) {
      console.error("[v0] Error loading sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] handleAddSession called with newSession:", newSession)
    try {
      if (!newSession.date || !newSession.title || !newSession.agenda) {
        console.error("[v0] Missing required fields:", newSession)
        alert("すべてのフィールドを入力してください")
        return
      }
      console.log("[v0] Calling createSession...")
      await createSession(newSession)
      console.log("[v0] Session created, reloading...")
      await loadSessions()
      setNewSession({ date: "", title: "", agenda: "" })
      setSelectedDate(undefined)
      setIsDrawerOpen(false)
    } catch (error) {
      console.error("[v0] Error creating session:", error)
      alert("登録に失敗しました")
    }
  }

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session)
    const sessionDate = new Date(session.date)
    setEditSelectedDate(sessionDate)
    setIsEditDrawerOpen(true)
  }

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession) return

    try {
      await updateSession(editingSession.id, {
        date: editingSession.date,
        title: editingSession.title,
        agenda: editingSession.agenda,
      })
      await loadSessions()
      setIsEditDrawerOpen(false)
      setEditingSession(null)
      setEditSelectedDate(undefined)
    } catch (error) {
      console.error("[v0] Error updating session:", error)
      alert("更新に失敗しました")
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await deleteSession(sessionId)
      await loadSessions()
    } catch (error) {
      console.error("[v0] Error deleting session:", error)
    }
  }

  return (
    <div className="flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left font-light">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mx-auto max-w-screen-lg px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg text-foreground font-light text-left leading-8">HENKAKU生成AI会</h1>
          <Button size="icon" className="rounded-full h-9 w-9" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-screen-lg px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl text-foreground font-light">Line Up</h2>
        </div>
        {/* Study Session Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground whitespace-nowrap w-[140px]">
                    <div className="flex items-center gap-2 font-light font-sans">
                      <CalendarIcon className="h-4 w-4" />
                      日付
                    </div>
                  </th>
                  <th className="text-left p-4 text-foreground font-light font-sans">表題</th>
                  <th className="text-left p-4 text-muted-foreground font-sans font-light">アジェンダ</th>
                  <th className="text-right p-4 font-semibold text-foreground w-[160px]"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      読み込み中...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      勉強会がまだ登録されていません
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap font-light font-sans">
                        {format(new Date(session.date), "yyyy/MM/dd", { locale: ja })}
                      </td>
                      <td className="p-4 text-sm text-foreground font-light font-sans">{session.title}</td>
                      <td className="p-4 text-sm text-muted-foreground font-sans font-light">{session.agenda}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/session/${session.id}`}>
                            <Button size="sm" variant="default" className="h-9 font-light">
                              Open
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 w-9 p-0 font-light bg-transparent"
                            onClick={() => handleEditSession(session)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Add Session Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>新しい勉強会を追加</DrawerTitle>
            <DrawerDescription>勉強会の情報を入力してください</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleAddSession} className="px-4 pb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">日付</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  {selectedDate ? format(selectedDate, "yyyy年M月d日", { locale: ja }) : "日付を選択してください"}
                </div>
                <SimpleDatePicker selected={selectedDate} onSelect={handleDateSelect} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">表題</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="勉強会のタイトル"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agenda">アジェンダ</Label>
                <Input
                  id="agenda"
                  type="text"
                  placeholder="簡単なアジェンダ"
                  value={newSession.agenda}
                  onChange={(e) => setNewSession({ ...newSession, agenda: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
            </div>
            <DrawerFooter className="px-0 pt-4">
              <Button type="submit" className="h-12 w-full">
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

      {/* Edit Session Drawer */}
      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>勉強会を編集</DrawerTitle>
            <DrawerDescription>勉強会の情報を編集してください</DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleUpdateSession} className="px-4 pb-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">日付</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  {editSelectedDate
                    ? format(editSelectedDate, "yyyy年M月d日", { locale: ja })
                    : "日付を選択してください"}
                </div>
                <SimpleDatePicker selected={editSelectedDate} onSelect={handleEditDateSelect} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title">表題</Label>
                <Input
                  id="edit-title"
                  type="text"
                  placeholder="勉強会のタイトル"
                  value={editingSession?.title || ""}
                  onChange={(e) => editingSession && setEditingSession({ ...editingSession, title: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-agenda">アジェンダ</Label>
                <Input
                  id="edit-agenda"
                  type="text"
                  placeholder="簡単なアジェンダ"
                  value={editingSession?.agenda || ""}
                  onChange={(e) => editingSession && setEditingSession({ ...editingSession, agenda: e.target.value })}
                  className="h-12"
                  required
                />
              </div>
            </div>
            <DrawerFooter className="px-0 pt-4">
              <Button type="submit" className="h-12 w-full">
                更新
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
    </div>
  )
}
