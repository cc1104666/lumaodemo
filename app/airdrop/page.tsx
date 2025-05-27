"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, MessageCircle, Star, DollarSign } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

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

const AirdropPage = () => {
  const router = useRouter()
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()
  const [userFilter, setUserFilter] = useState("")
  const [showMyOnly, setShowMyOnly] = useState(false)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (userFilter) params.append("username", userFilter)
      if (showMyOnly && user) params.append("userId", user.id.toString())

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "进行中":
        return "bg-yellow-100 text-yellow-800"
      case "已完成":
        return "bg-green-100 text-green-800"
      case "已结束":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "简单":
        return "bg-green-50 text-green-700 border border-green-100"
      case "中等":
        return "bg-yellow-50 text-yellow-700 border border-yellow-100"
      case "困难":
        return "bg-red-50 text-red-700 border border-red-100"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-100"
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">撸毛记录</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="搜索项目或平台..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="进行中">进行中</SelectItem>
              <SelectItem value="已完成">已完成</SelectItem>
              <SelectItem value="已结束">已结束</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="用户名筛选"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-32"
          />
          {user && (
            <Button
              variant={showMyOnly ? "default" : "outline"}
              onClick={() => setShowMyOnly(!showMyOnly)}
              className="whitespace-nowrap"
            >
              我的记录
            </Button>
          )}
          <Button onClick={fetchRecords}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <Card
              key={record.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/airdrop/${record.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{record.project}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      发布者: {record.username} • {formatDate(record.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    <Badge variant="outline" className={getDifficultyColor(record.difficulty)}>
                      {record.difficulty}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">平台</p>
                    <p className="font-medium">{record.platform}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">预期奖励</p>
                    <p className="font-medium">{record.reward}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">融资情况</p>
                    <p className="font-medium">{record.funding}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">实际奖励</p>
                    <p className="font-medium text-green-600">
                      {record.finalReward ? `$${record.finalReward}` : "暂无"}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{record.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {record.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {record.difficulty}
                    </span>
                  </div>
                  {record.finalReward > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <DollarSign className="h-3 w-3 mr-1" />${record.finalReward}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AirdropPage
