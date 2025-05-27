import { type NextRequest, NextResponse } from "next/server"
import { getStorage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "当前密码和新密码不能为空" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "新密码长度至少6位" }, { status: 400 })
    }

    const storage = getStorage((request as any).env)
    const success = await storage.updateAdminPassword(currentPassword, newPassword)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "密码修改成功",
      })
    } else {
      return NextResponse.json({ error: "当前密码错误" }, { status: 400 })
    }
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "密码修改失败" }, { status: 500 })
  }
}
