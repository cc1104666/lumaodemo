import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get("recordId")
    const recordType = searchParams.get("recordType")

    let comments = dataStore.getComments()

    if (recordId && recordType) {
      comments = dataStore.getCommentsByRecord(Number.parseInt(recordId), recordType)
    } else if (recordId) {
      comments = comments.filter((comment) => comment.recordId === Number.parseInt(recordId))
    } else if (recordType) {
      comments = comments.filter((comment) => comment.recordType === recordType)
    }

    // Sort by creation date (newest first)
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recordId, recordType, username, content } = body

    if (!recordId || !recordType || !username || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newComment = dataStore.createComment({
      recordId: Number.parseInt(recordId),
      recordType,
      username,
      content,
    })

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
    }

    const deleted = dataStore.deleteComment(Number.parseInt(id))

    if (!deleted) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
