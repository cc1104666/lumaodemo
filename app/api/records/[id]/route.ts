import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const record = dataStore.getRecordById(id)

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error fetching record:", error)
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    const { project, platform, status, reward, difficulty, description, finalReward, funding } = body

    const updatedRecord = dataStore.updateRecord(id, {
      project,
      platform,
      status,
      reward,
      difficulty,
      description,
      finalReward: finalReward || 0,
      funding,
    })

    if (!updatedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating record:", error)
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const deleted = dataStore.deleteRecord(id)

    if (!deleted) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Record deleted successfully" })
  } catch (error) {
    console.error("Error deleting record:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
}
