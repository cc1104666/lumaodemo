"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { formatDate, formatMarketCap, getStatusColor } from "@/lib/utils"
import { MessageCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

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

const DogsPage = () => {
  const router = useRouter()
  const [records, setRecords] = useState<DogRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newCA, setNewCA] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()

  const [userFilter, setUserFilter] = useState("")
  const [showMyOnly, setShowMyOnly] = useState(false)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (userFilter) params.append("username", userFilter)
      if (showMyOnly && user) params.append("userId", user.id.toString())

      const response = await fetch(`/api/dog-records?${params}`)
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

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleAddCA = async () => {
    if (!newCA.trim()) {
      alert("请输入CA地址")
      return
    }

    // 检查是否已登录
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      alert("请先登录后台管理系统才能添加记录")
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
        setShowAddForm(false)
        fetchRecords()
        alert("CA地址添加成功")
      } else {
        const error = await response.text()
        alert(error)
      }
    } catch (error) {
      console.error("添加CA失败:", error)
      alert("添加CA失败")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">打狗记录</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="搜索代币名称、CA地址或叙述..."
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
              <SelectItem value="已归零">已归零</SelectItem>
              <SelectItem value="濒临归零">濒临归零</SelectItem>
              <SelectItem value="大幅下跌">大幅下跌</SelectItem>
              <SelectItem value="正常">正常</SelectItem>
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

      <Button onClick={() => setShowAddForm(!showAddForm)} className="mb-4">
        {showAddForm ? "取消" : "添加CA"}
      </Button>

      {showAddForm && (
        <div className="flex gap-2 mt-4 mb-6">
          <Input placeholder="CA地址" value={newCA} onChange={(e) => setNewCA(e.target.value)} className="w-64" />
          <Button onClick={handleAddCA} disabled={submitting}>
            {submitting ? "提交中..." : "提交"}
          </Button>
        </div>
      )}

      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <Card
              key={record.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dogs/${record.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">{record.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      发布者: {record.username} • {formatDate(record.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">合约地址</p>
                    <p className="font-mono text-xs break-all">{record.ca}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">当前市值</p>
                    <p className="font-medium">{formatMarketCap(record.currentMarketCap)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">记录时间</p>
                    <p className="font-medium">{formatDate(record.time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">最后更新</p>
                    <p className="font-medium">{formatDate(record.lastUpdated)}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{record.narrative}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {record.commentCount}
                    </span>
                    <span className="text-xs">原因: {record.reason}</span>
                  </div>
                  <Badge variant={record.status === "正常" ? "default" : "destructive"}>{record.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default DogsPage
