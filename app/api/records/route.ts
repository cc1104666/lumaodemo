import { type NextRequest, NextResponse } from "next/server"
import { getStorage } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")
    const username = searchParams.get("username")

    const storage = getStorage((request as any).env)
    let records = await storage.getRecords()

    // Apply filters
    if (search) {
      records = records.filter(
        (record) =>
          record.project.toLowerCase().includes(search.toLowerCase()) ||
          record.platform.toLowerCase().includes(search.toLowerCase()),
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
    console.error("Error fetching records:", error)
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 简单的验证 - 在实际应用中应该使用 JWT 或其他安全方法
    const isAdmin = body.isAdmin || false
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      project,
      platform,
      status,
      reward,
      difficulty,
      description,
      finalReward,
      funding,
      userId = 1,
      username = "Anni",
    } = body

    const storage = getStorage((request as any).env)
    const newRecord = await storage.createRecord({
      userId,
      username,
      project,
      platform,
      status,
      reward,
      difficulty,
      description,
      finalReward: finalReward || 0,
      funding,
      commentCount: 0,
    })

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error("Error creating record:", error)
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 })
  }
}
