"use client"

import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface PostCardProps {
  post: {
    id: string
    url: string
    ogp: {
      title: string
      description: string
      image: string
    }
    author: {
      name: string
      avatar: string
    }
    likes: number
    comments: number
    timestamp: string
    isLiked: boolean
  }
  onLike: (postId: string) => void
  onComment: () => void
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  return (
    <article className="p-4">
      {/* Author Info */}
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
        </div>
      </div>

      {/* OGP Preview Card */}
      <Card className="overflow-hidden border-border bg-card mb-3">
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="relative aspect-[2/1] overflow-hidden bg-muted">
            <img
              src={post.ogp.image || "/placeholder.svg"}
              alt={post.ogp.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-base text-foreground mb-1 line-clamp-2 text-pretty">{post.ogp.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.ogp.description}</p>
            <p className="text-xs text-muted-foreground truncate break-all">{post.url}</p>
          </div>
        </a>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="sm" className="gap-2 h-11 min-w-[44px]" onClick={() => onLike(post.id)}>
            <motion.div animate={post.isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart className={`h-5 w-5 ${post.isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
            </motion.div>
            <span className="text-sm font-medium">{post.likes}</span>
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.9 }}>
          <Button variant="ghost" size="sm" className="gap-2 h-11 min-w-[44px]" onClick={onComment}>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{post.comments}</span>
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.9 }} className="ml-auto">
          <Button variant="ghost" size="sm" className="gap-2 h-11 min-w-[44px]">
            <Share2 className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </article>
  )
}
