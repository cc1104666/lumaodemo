"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, DollarSign, MessageCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface DogRecord {
  id: number
  userId: number
  username: string
  name: string
  ca: string
  narrative: string
  time: string
  currentMarketCap: number
  status: string
  reason: string
  commentCount: number
  lastUpdated: string
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

export default function DogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [record, setRecord] = useState<DogRecord | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [commentUsername, setCommentUsername] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchRecord()
    fetchComments()
  }, [id])

  const fetchRecord = async () => {
    try {
      const response = await fetch(`/api/dog-records/${id}`)
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
      const response = await fetch(`/api/comments?recordId=${id}&recordType=dog`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("获取评论失败:", error)
    }
  }

  const handleUpdateRecord = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/dog-records/${id}`, {
        method: "PUT",
      })
      if (response.ok) {
        const data = await response.json()
        setRecord(data)
      }
    } catch (error) {
      console.error("更新记录失败:", error)
    } finally {
      setUpdating(false)
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
          recordType: "dog",
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
      case "已归零":
        return "bg-red-500"
      case "濒临归零":
        return "bg-orange-500"
      case "大幅下跌":
        return "bg-yellow-500"
      case "正常":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatMarketCap = (value: number) => {
    if (value === 0) return "$0"
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
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
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{record.name}</CardTitle>
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
                <Button variant="outline" size="sm" onClick={handleUpdateRecord} disabled={updating}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${updating ? "animate-spin" : ""}`} />
                  更新状态
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">代币信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">合约地址:</span>
                    <span className="font-mono text-xs break-all">{record.ca}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">当前市值:</span>
                    <span className="font-medium">{formatMarketCap(record.currentMarketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">记录时间:</span>
                    <span className="font-medium">{formatDate(record.time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最后更新:</span>
                    <span className="font-medium">{formatDate(record.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">项目叙述</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{record.narrative}</p>
              </div>
            </div>

            {/* 风险警告 */}
            {record.status !== "正常" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">风险警告</h4>
                    <p className="text-sm text-red-700">{record.reason}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {record.commentCount} 条评论
                </span>
                <Badge variant={record.status === "正常" ? "default" : "destructive"}>{record.status}</Badge>
              </div>
              <div className="flex items-center gap-1 text-gray-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                {formatMarketCap(record.currentMarketCap)}
              </div>
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
