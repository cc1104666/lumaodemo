"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, DollarSign, TrendingUp, Users, Plus, Search, Filter, Zap, MessageSquare } from "lucide-react"

interface Record {
  id: number
  project: string
  platform: string
  status: "进行中" | "已完成" | "已失效"
  reward: string
  difficulty: "简单" | "中等" | "困难"
  description: string
  createdAt: string
  finalReward: number
  funding: string
  commentCount: number
}

interface Comment {
  id: number
  recordId: number
  recordType: string
  username: string
  content: string
  createdAt: string
}

export default function HomePage() {
  const [records, setRecords] = useState<Record[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [guestName, setGuestName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [newRecord, setNewRecord] = useState({
    project: "",
    platform: "",
    status: "进行中" as const,
    reward: "",
    difficulty: "简单" as const,
    description: "",
    finalReward: 0,
    funding: "",
  })

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/records?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error("获取记录失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (recordId: number) => {
    try {
      const response = await fetch(`/api/comments?recordId=${recordId}&recordType=airdrop`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("获取评论失败:", error)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !guestName.trim() || !selectedRecordId) {
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
          recordId: selectedRecordId,
          recordType: "airdrop",
          username: guestName,
          content: newComment,
        }),
      })

      if (response.ok) {
        setNewComment("")
        setGuestName("")
        fetchComments(selectedRecordId)
        fetchRecords() // 更新评论数量
      }
    } catch (error) {
      console.error("提交评论失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    if (selectedRecordId) {
      fetchComments(selectedRecordId)
    }
  }, [selectedRecordId])

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.platform.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRewards = records.reduce((sum, record) => sum + (record.finalReward || 0), 0)
  const activeProjects = records.filter((r) => r.status === "进行中").length
  const completedProjects = records.filter((r) => r.status === "已完成").length

  const handleAddRecord = async () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      alert("请先登录后台管理系统才能添加记录")
      return
    }

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newRecord,
          userId: 1,
          username: "Anni",
          isAdmin: true, // 添加管理员标识
        }),
      })

      if (response.ok) {
        fetchRecords()
        setNewRecord({
          project: "",
          platform: "",
          status: "进行中",
          reward: "",
          difficulty: "简单",
          description: "",
          finalReward: 0,
          funding: "",
        })
        setIsAddDialogOpen(false)
      } else {
        alert("添加失败，请重新登录")
      }
    } catch (error) {
      console.error("添加记录失败:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "进行中":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "已完成":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "已失效":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "简单":
        return "bg-gradient-to-r from-green-400 to-green-600 text-white"
      case "中等":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
      case "困难":
        return "bg-gradient-to-r from-red-400 to-red-600 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCommentClick = (recordId: number) => {
    setSelectedRecordId(recordId)
    setIsCommentDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Anni的撸毛日记
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    添加记录
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">添加新记录</DialogTitle>
                    <DialogDescription className="text-slate-400">添加一个新的撸毛项目记录</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project" className="text-white">
                        项目名称
                      </Label>
                      <Input
                        id="project"
                        value={newRecord.project}
                        onChange={(e) => setNewRecord({ ...newRecord, project: e.target.value })}
                        placeholder="输入项目名称"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="platform" className="text-white">
                        平台
                      </Label>
                      <Input
                        id="platform"
                        value={newRecord.platform}
                        onChange={(e) => setNewRecord({ ...newRecord, platform: e.target.value })}
                        placeholder="输入平台名称"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status" className="text-white">
                        状态
                      </Label>
                      <Select
                        value={newRecord.status}
                        onValueChange={(value: any) => setNewRecord({ ...newRecord, status: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="进行中">进行中</SelectItem>
                          <SelectItem value="已完成">已完成</SelectItem>
                          <SelectItem value="已失效">已失效</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="difficulty" className="text-white">
                        难度
                      </Label>
                      <Select
                        value={newRecord.difficulty}
                        onValueChange={(value: any) => setNewRecord({ ...newRecord, difficulty: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="简单">简单</SelectItem>
                          <SelectItem value="中等">中等</SelectItem>
                          <SelectItem value="困难">困难</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reward" className="text-white">
                        奖励
                      </Label>
                      <Input
                        id="reward"
                        value={newRecord.reward}
                        onChange={(e) => setNewRecord({ ...newRecord, reward: e.target.value })}
                        placeholder="输入奖励信息"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="finalReward" className="text-white">
                        最终收益 (USD)
                      </Label>
                      <Input
                        id="finalReward"
                        type="number"
                        value={newRecord.finalReward}
                        onChange={(e) => setNewRecord({ ...newRecord, finalReward: Number(e.target.value) })}
                        placeholder="输入最终收益"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="funding" className="text-white">
                        融资情况
                      </Label>
                      <Input
                        id="funding"
                        value={newRecord.funding}
                        onChange={(e) => setNewRecord({ ...newRecord, funding: e.target.value })}
                        placeholder="输入融资情况"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="text-white">
                        描述
                      </Label>
                      <Textarea
                        id="description"
                        value={newRecord.description}
                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                        placeholder="输入项目描述"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="border-slate-600 text-white hover:bg-slate-800"
                    >
                      取消
                    </Button>
                    <Button onClick={handleAddRecord} className="bg-gradient-to-r from-purple-500 to-pink-500">
                      添加
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">总记录数</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{records.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">进行中项目</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{activeProjects}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">已完成项目</CardTitle>
              <Calendar className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{completedProjects}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">总收益</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${totalRewards}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索项目或平台..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 backdrop-blur-md"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/10 border-white/20 text-white backdrop-blur-md">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="筛选状态" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="进行中">进行中</SelectItem>
              <SelectItem value="已完成">已完成</SelectItem>
              <SelectItem value="已失效">已失效</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={fetchRecords}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white">{record.project}</CardTitle>
                    <CardDescription className="text-gray-300">{record.platform}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">难度:</span>
                    <Badge className={getDifficultyColor(record.difficulty)}>{record.difficulty}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">奖励:</span>
                    <span className="font-medium text-white">{record.reward}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">最终收益:</span>
                    <span className="font-medium text-green-400">${record.finalReward || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">融资情况:</span>
                    <span className="text-sm text-blue-400">{record.funding}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 line-clamp-2">{record.description}</p>
                </div>
              </CardContent>
              <div className="flex justify-between items-center p-4">
                <Button variant="ghost" size="sm" onClick={() => handleCommentClick(record.id)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  评论 ({record.commentCount || 0})
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">没有找到匹配的记录</p>
          </div>
        )}
      </main>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">评论</DialogTitle>
            <DialogDescription className="text-slate-400">发表你的评论</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Comment Form */}
            <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg">
              <div className="grid gap-2">
                <Label htmlFor="guestName" className="text-white">
                  昵称
                </Label>
                <Input
                  id="guestName"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="输入您的昵称"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comment" className="text-white">
                  评论内容
                </Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="分享您对这个项目的看法..."
                  className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                />
              </div>
              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim() || !guestName.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {submitting ? "提交中..." : "发表评论"}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">评论 ({comments.length})</h4>
              {comments.length === 0 ? (
                <p className="text-gray-400 text-center py-4">暂无评论，来发表第一条评论吧！</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-blue-400 font-medium">{comment.username}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-white text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
