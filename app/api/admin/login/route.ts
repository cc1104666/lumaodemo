import { type NextRequest, NextResponse } from "next/server"
import { getStorage } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    const storage = getStorage((request as any).env)
    const isValid = await storage.validateAdmin(username, password)

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "登录成功",
        user: { username, isAdmin: true },
      })
    } else {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "登录失败" }, { status: 500 })
  }
}
