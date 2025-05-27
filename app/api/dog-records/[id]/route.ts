import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const record = dataStore.getDogRecordById(id)

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error fetching dog record:", error)
    return NextResponse.json({ error: "Failed to fetch dog record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Get current record
    const currentRecord = dataStore.getDogRecordById(id)
    if (!currentRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Mock token info update
    const mockTokenInfo = {
      name: "Updated Token",
      marketCap: Math.random() * 1000000,
      priceChange24h: (Math.random() - 0.5) * 100,
    }

    // Determine status
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

    const updatedRecord = dataStore.updateDogRecord(id, {
      name: mockTokenInfo.name,
      currentMarketCap: mockTokenInfo.marketCap,
      status,
      reason,
      lastUpdated: currentTime,
    })

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating dog record:", error)
    return NextResponse.json({ error: "Failed to update dog record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const deleted = dataStore.deleteDogRecord(id)

    if (!deleted) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Dog record deleted successfully" })
  } catch (error) {
    console.error("Error deleting dog record:", error)
    return NextResponse.json({ error: "Failed to delete dog record" }, { status: 500 })
  }
}
