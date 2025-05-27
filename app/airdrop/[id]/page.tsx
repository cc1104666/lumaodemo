"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, DollarSign, MessageCircle, Star } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Record {
  id: number
  userId: number
  username: string
  project: string
  platform: string
  status: string
  reward: string
  difficulty: string
  description: string
  finalReward: number
  funding: string
  commentCount: number
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: number
  recordId: number
  recordType: string
  username: string
  content: string
  createdAt: string
}

export default function AirdropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [record, setRecord] = useState<Record | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [commentUsername, setCommentUsername] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRecord()
    fetchComments()
  }, [id])

  const fetchRecord = async () => {
    try {
      const response = await fetch(`/api/records/${id}`)
      if (response.ok) {
        const data = await response.json()
        setRecord(data)
      }
    } catch (error) {
      console.error("获取记录详情失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?recordId=${id}&recordType=airdrop`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("获取评论失败:", error)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !commentUsername.trim()) {
      alert("请填写用户名和评论内容")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordId: Number.parseInt(id),
          recordType: "airdrop",
          username: commentUsername,
          content: newComment,
        }),
      })

      if (response.ok) {
        setNewComment("")
        setCommentUsername("")
        fetchComments()
        fetchRecord() // 更新评论数量
      }
    } catch (error) {
      console.error("提交评论失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "已完成":
        return "bg-green-500"
      case "进行中":
        return "bg-blue-500"
      case "已结束":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "简单":
        return "bg-green-100 text-green-800"
      case "中等":
        return "bg-yellow-100 text-yellow-800"
      case "困难":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">记录不存在</h1>
            <p className="text-gray-600">请检查链接是否正确</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>

        {/* 项目详情 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{record.project}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>发布者: {record.username}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(record.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                <Badge variant="outline" className={getDifficultyColor(record.difficulty)}>
                  {record.difficulty}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">基本信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">平台:</span>
                    <span className="font-medium">{record.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">预期奖励:</span>
                    <span className="font-medium">{record.reward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">实际奖励:</span>
                    <span className="font-medium text-green-600">
                      {record.finalReward ? `$${record.finalReward}` : "暂无"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">融资情况:</span>
                    <span className="font-medium">{record.funding}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">项目描述</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{record.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {record.commentCount} 条评论
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  难度: {record.difficulty}
                </span>
              </div>
              {record.finalReward > 0 && (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <DollarSign className="h-4 w-4" />${record.finalReward}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 评论区 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              评论 ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 发表评论 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">发表评论</h3>
              <div className="space-y-3">
                <Input
                  placeholder="输入用户名"
                  value={commentUsername}
                  onChange={(e) => setCommentUsername(e.target.value)}
                  className="bg-white"
                />
                <Textarea
                  placeholder="写下你的评论..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="bg-white"
                />
                <Button onClick={handleSubmitComment} disabled={submitting} className="w-full">
                  {submitting ? "提交中..." : "发表评论"}
                </Button>
              </div>
            </div>

            {/* 评论列表 */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无评论，快来发表第一条评论吧！</div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{comment.username}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
