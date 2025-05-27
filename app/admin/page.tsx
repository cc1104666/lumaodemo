"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { DollarSign, TrendingUp, Users, Plus, Zap, Target, MessageSquare, LogOut, Settings, Trash2 } from "lucide-react"
import Link from "next/link"

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

interface DogRecord {
  id: number
  name: string
  ca: string
  narrative: string
  time: string
  currentMarketCap: number
  status: "已归零" | "濒临归零" | "大幅下跌" | "正常"
  reason: string
  createdAt: string
  commentCount: number
  lastUpdated: string
}

export default function AdminPage() {
  const router = useRouter()
  const [records, setRecords] = useState<Record[]>([])
  const [dogRecords, setDogRecords] = useState<DogRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("airdrop")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAddDogDialogOpen, setIsAddDogDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
  const [newCA, setNewCA] = useState("")

  useEffect(() => {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }

    fetchRecords()
    fetchDogRecords()
  }, [router])

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/records")
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

  const fetchDogRecords = async () => {
    try {
      const response = await fetch("/api/dog-records")
      if (response.ok) {
        const data = await response.json()
        setDogRecords(data)
      }
    } catch (error) {
      console.error("获取打狗记录失败:", error)
    }
  }

  const handleAddRecord = async () => {
    setSubmitting(true)
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
          isAdmin: true,
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
        alert("记录添加成功")
      } else {
        alert("添加失败，请重试")
      }
    } catch (error) {
      console.error("添加记录失败:", error)
      alert("添加失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddDogRecord = async () => {
    if (!newCA.trim()) {
      alert("请输入CA地址")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/dog-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ca: newCA.trim(),
          userId: 1,
          username: "Anni",
          isAdmin: true,
        }),
      })

      if (response.ok) {
        setNewCA("")
        setIsAddDogDialogOpen(false)
        fetchDogRecords()
        alert("CA地址添加成功")
      } else {
        const errorData = await response.json()
        alert(errorData.error || "添加失败")
      }
    } catch (error) {
      console.error("添加CA失败:", error)
      alert("添加失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRecord = async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return

    try {
      const response = await fetch(`/api/records/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchRecords()
        alert("删除成功")
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("删除记录失败:", error)
      alert("删除失败")
    }
  }

  const handleDeleteDogRecord = async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return

    try {
      const response = await fetch(`/api/dog-records/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchDogRecords()
        alert("删除成功")
      } else {
        alert("删除失败")
      }
    } catch (error) {
      console.error("删除记录失败:", error)
      alert("删除失败")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "进行中":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "已完成":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "已失效":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      case "已归零":
        return "bg-gradient-to-r from-red-600 to-red-800 text-white"
      case "濒临归零":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white"
      case "大幅下跌":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "正常":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white"
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

  const formatMarketCap = (value: number) => {
    if (value === 0) return "$0"
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
    return `$${value.toFixed(2)}`
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
                  Anni的撸毛日记 - 管理后台
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  返回首页
                </Button>
              </Link>
              <Link href="/admin/change-password">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Settings className="w-4 h-4 mr-2" />
                  修改密码
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">撸毛记录</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{records.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">已完成项目</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{records.filter((r) => r.status === "已完成").length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/20 to-red-700/20 border-red-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">打狗记录</CardTitle>
              <Target className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{dogRecords.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">总收益</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${records.reduce((sum, record) => sum + (record.finalReward || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "airdrop" ? "default" : "outline"}
            onClick={() => setActiveTab("airdrop")}
            className={
              activeTab === "airdrop"
                ? "bg-gradient-to-r from-purple-500 to-pink-500"
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }
          >
            撸毛记录管理
          </Button>
          <Button
            variant={activeTab === "dog" ? "default" : "outline"}
            onClick={() => setActiveTab("dog")}
            className={
              activeTab === "dog"
                ? "bg-gradient-to-r from-red-500 to-orange-500"
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }
          >
            打狗记录管理
          </Button>
        </div>

        {/* Airdrop Records Tab */}
        {activeTab === "airdrop" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">撸毛记录管理</h2>
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
                    <Button
                      onClick={handleAddRecord}
                      disabled={submitting}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      {submitting ? "添加中..." : "添加"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((record) => (
                <Card
                  key={record.id}
                  className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
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
                    <span className="text-sm text-gray-400">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      {record.commentCount || 0} 评论
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Dog Records Tab */}
        {activeTab === "dog" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">打狗记录管理</h2>
              <Dialog open={isAddDogDialogOpen} onOpenChange={setIsAddDogDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    添加记录
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">添加打狗记录</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      只需输入合约地址，系统将自动获取代币信息
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="ca" className="text-white">
                        合约地址 (CA)
                      </Label>
                      <Input
                        id="ca"
                        value={newCA}
                        onChange={(e) => setNewCA(e.target.value)}
                        placeholder="输入合约地址，如：0x..."
                        className="bg-slate-800 border-slate-600 text-white font-mono text-sm"
                      />
                      <p className="text-xs text-slate-400">系统将自动获取代币名称、当前市值、价格变化等信息</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDogDialogOpen(false)}
                      className="border-slate-600 text-white hover:bg-slate-800"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleAddDogRecord}
                      disabled={submitting}
                      className="bg-gradient-to-r from-red-500 to-orange-500"
                    >
                      {submitting ? "添加中..." : "添加"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogRecords.map((record) => (
                <Card
                  key={record.id}
                  className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-white">{record.name}</CardTitle>
                        <CardDescription className="text-gray-300 font-mono text-xs break-all">
                          {record.ca}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">当前市值:</span>
                        <span className="font-medium text-white">{formatMarketCap(record.currentMarketCap)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">状态:</span>
                        <span className="font-medium text-red-400">{record.reason}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-2 line-clamp-2">{record.narrative}</p>
                    </div>
                  </CardContent>
                  <div className="flex justify-between items-center p-4">
                    <span className="text-sm text-gray-400">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      {record.commentCount || 0} 评论
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30"
                        onClick={() => handleDeleteDogRecord(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
