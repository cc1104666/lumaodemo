import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")
    const username = searchParams.get("username")

    let records = dataStore.getDogRecords()

    // Apply filters
    if (search) {
      records = records.filter(
        (record) =>
          record.name.toLowerCase().includes(search.toLowerCase()) ||
          record.ca.toLowerCase().includes(search.toLowerCase()) ||
          record.narrative.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (status && status !== "all") {
      records = records.filter((record) => record.status === status)
    }

    if (userId) {
      records = records.filter((record) => record.userId === Number.parseInt(userId))
    }

    if (username) {
      records = records.filter((record) => record.username.toLowerCase().includes(username.toLowerCase()))
    }

    // Sort by creation date (newest first)
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(records)
  } catch (error) {
    console.error("Error fetching dog records:", error)
    return NextResponse.json({ error: "Failed to fetch dog records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 简单的验证
    const isAdmin = body.isAdmin || false
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ca, userId = 1, username = "Anni" } = body

    // Check if CA already exists
    const existingRecords = dataStore.getDogRecords()
    const existing = existingRecords.find((record) => record.ca === ca)

    if (existing) {
      return NextResponse.json({ error: "CA address already exists" }, { status: 409 })
    }

    // For demo purposes, create a mock token info
    const mockTokenInfo = {
      name: "Unknown Token",
      marketCap: Math.random() * 1000000,
      priceChange24h: (Math.random() - 0.5) * 100,
    }

    // Determine status based on mock data
    let status = "正常"
    let reason = "代币状态正常"

    if (mockTokenInfo.marketCap === 0) {
      status = "已归零"
      reason = "代币价格归零"
    } else if (mockTokenInfo.marketCap < 10000 || mockTokenInfo.priceChange24h < -90) {
      status = "濒临归零"
      reason = "市值极低，濒临归零"
    } else if (mockTokenInfo.priceChange24h < -50) {
      status = "大幅下跌"
      reason = "价格大幅下跌"
    }

    const currentTime = new Date().toISOString()

    const newRecord = dataStore.createDogRecord({
      userId,
      username,
      name: mockTokenInfo.name,
      ca,
      narrative: "自动获取的代币信息",
      time: currentTime,
      currentMarketCap: mockTokenInfo.marketCap,
      status,
      reason,
      commentCount: 0,
      lastUpdated: currentTime,
    })

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error("Error creating dog record:", error)
    return NextResponse.json({ error: "Failed to create dog record" }, { status: 500 })
  }
}
