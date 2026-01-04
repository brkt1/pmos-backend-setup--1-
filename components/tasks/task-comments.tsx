"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { MessageSquare, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Comment {
  id: string
  comment: string
  created_at: string
  user_id: string
  users?: { email: string; full_name: string | null }
}

export default function TaskComments({ taskId, userId }: { taskId: string; userId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadComments()
  }, [taskId])

  const loadComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("task_comments")
      .select("*, users(email, full_name)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })

    if (data) {
      setComments(data)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsLoading(true)
    const supabase = createClient()

    await supabase.from("task_comments").insert({
      task_id: taskId,
      user_id: userId,
      comment: newComment.trim(),
    })

    setNewComment("")
    setIsLoading(false)
    loadComments()
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold">
                    {comment.users?.full_name || comment.users?.email || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm">{comment.comment}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={isLoading || !newComment.trim()} size="sm">
            <Send className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

