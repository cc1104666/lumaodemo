// 统一的存储接口，根据环境自动选择存储方式
import { dataStore } from "./data-store"
import { createD1Store } from "./d1-store"

const isCloudflare = typeof globalThis.process === "undefined" || globalThis.process?.env?.CF_PAGES === "1"
const isVercel = process.env.VERCEL === "1"

export function getStorage(env?: any) {
  if (isCloudflare && env?.DB) {
    const d1Store = createD1Store(env.DB)
    // 初始化数据库表
    d1Store.initTables().catch(console.error)
    return d1Store
  }

  // 本地开发或其他环境使用文件存储
  return dataStore
}
