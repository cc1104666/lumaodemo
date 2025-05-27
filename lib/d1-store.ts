import type { D1Database } from "@cloudflare/workers-types"

export interface Record {
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

export interface DogRecord {
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

export interface Comment {
  id: number
  recordId: number
  recordType: string
  username: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface AdminConfig {
  username: string
  password: string
  lastUpdated: string
}

class D1Store {
  private db: D1Database

  constructor(database: D1Database) {
    this.db = database
  }

  // 初始化数据库表
  async initTables(): Promise<void> {
    try {
      // 创建管理员配置表
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS admin_config (
          id INTEGER PRIMARY KEY,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          lastUpdated TEXT NOT NULL
        )
      `)

      // 创建撸毛记录表
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          username TEXT NOT NULL,
          project TEXT NOT NULL,
          platform TEXT NOT NULL,
          status TEXT NOT NULL,
          reward TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          description TEXT NOT NULL,
          finalReward REAL DEFAULT 0,
          funding TEXT NOT NULL,
          commentCount INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `)

      // 创建打狗记录表
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS dog_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER NOT NULL,
          username TEXT NOT NULL,
          name TEXT NOT NULL,
          ca TEXT NOT NULL UNIQUE,
          narrative TEXT NOT NULL,
          time TEXT NOT NULL,
          currentMarketCap REAL DEFAULT 0,
          status TEXT NOT NULL,
          reason TEXT NOT NULL,
          commentCount INTEGER DEFAULT 0,
          lastUpdated TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `)

      // 创建评论表
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recordId INTEGER NOT NULL,
          recordType TEXT NOT NULL,
          username TEXT NOT NULL,
          content TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `)

      // 插入默认管理员配置（如果不存在）
      const adminExists = await this.db.prepare("SELECT COUNT(*) as count FROM admin_config").first()
      if (adminExists && (adminExists as any).count === 0) {
        await this.db
          .prepare(`
          INSERT INTO admin_config (username, password, lastUpdated)
          VALUES (?, ?, ?)
        `)
          .bind("admin", "123456", new Date().toISOString())
          .run()
      }
    } catch (error) {
      console.error("Error initializing tables:", error)
    }
  }

  // Admin config operations
  async getAdminConfig(): Promise<AdminConfig> {
    try {
      const result = await this.db.prepare("SELECT * FROM admin_config LIMIT 1").first()
      if (!result) {
        const defaultConfig: AdminConfig = {
          username: "admin",
          password: "123456",
          lastUpdated: new Date().toISOString(),
        }
        await this.db
          .prepare(`
          INSERT INTO admin_config (username, password, lastUpdated)
          VALUES (?, ?, ?)
        `)
          .bind(defaultConfig.username, defaultConfig.password, defaultConfig.lastUpdated)
          .run()
        return defaultConfig
      }
      return result as AdminConfig
    } catch (error) {
      console.error("Error getting admin config:", error)
      return {
        username: "admin",
        password: "123456",
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  async updateAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const config = await this.getAdminConfig()
      if (config.password !== currentPassword) {
        return false
      }

      await this.db
        .prepare(`
        UPDATE admin_config 
        SET password = ?, lastUpdated = ?
        WHERE username = ?
      `)
        .bind(newPassword, new Date().toISOString(), config.username)
        .run()

      return true
    } catch (error) {
      console.error("Error updating admin password:", error)
      return false
    }
  }

  async validateAdmin(username: string, password: string): Promise<boolean> {
    try {
      const config = await this.getAdminConfig()
      return config.username === username && config.password === password
    } catch (error) {
      console.error("Error validating admin:", error)
      return false
    }
  }

  // Records operations
  async getRecords(): Promise<Record[]> {
    try {
      const results = await this.db.prepare("SELECT * FROM records ORDER BY createdAt DESC").all()
      return results.results as Record[]
    } catch (error) {
      console.error("Error getting records:", error)
      return []
    }
  }

  async getRecordById(id: number): Promise<Record | null> {
    try {
      const result = await this.db.prepare("SELECT * FROM records WHERE id = ?").bind(id).first()
      return (result as Record) || null
    } catch (error) {
      console.error("Error getting record by id:", error)
      return null
    }
  }

  async createRecord(recordData: Omit<Record, "id" | "createdAt" | "updatedAt">): Promise<Record> {
    try {
      const now = new Date().toISOString()
      const result = await this.db
        .prepare(`
        INSERT INTO records (userId, username, project, platform, status, reward, difficulty, description, finalReward, funding, commentCount, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          recordData.userId,
          recordData.username,
          recordData.project,
          recordData.platform,
          recordData.status,
          recordData.reward,
          recordData.difficulty,
          recordData.description,
          recordData.finalReward,
          recordData.funding,
          recordData.commentCount,
          now,
          now,
        )
        .run()

      const newRecord = await this.getRecordById(result.meta.last_row_id as number)
      return newRecord!
    } catch (error) {
      console.error("Error creating record:", error)
      throw error
    }
  }

  async updateRecord(id: number, updateData: Partial<Record>): Promise<Record | null> {
    try {
      const now = new Date().toISOString()
      const fields = Object.keys(updateData).filter((key) => key !== "id" && key !== "createdAt")
      const setClause = fields.map((field) => `${field} = ?`).join(", ")
      const values = fields.map((field) => (updateData as any)[field])

      await this.db
        .prepare(`
        UPDATE records 
        SET ${setClause}, updatedAt = ?
        WHERE id = ?
      `)
        .bind(...values, now, id)
        .run()

      return await this.getRecordById(id)
    } catch (error) {
      console.error("Error updating record:", error)
      return null
    }
  }

  async deleteRecord(id: number): Promise<boolean> {
    try {
      await this.db.prepare("DELETE FROM records WHERE id = ?").bind(id).run()
      await this.deleteCommentsByRecord(id, "airdrop")
      return true
    } catch (error) {
      console.error("Error deleting record:", error)
      return false
    }
  }

  // Dog Records operations
  async getDogRecords(): Promise<DogRecord[]> {
    try {
      const results = await this.db.prepare("SELECT * FROM dog_records ORDER BY createdAt DESC").all()
      return results.results as DogRecord[]
    } catch (error) {
      console.error("Error getting dog records:", error)
      return []
    }
  }

  async getDogRecordById(id: number): Promise<DogRecord | null> {
    try {
      const result = await this.db.prepare("SELECT * FROM dog_records WHERE id = ?").bind(id).first()
      return (result as DogRecord) || null
    } catch (error) {
      console.error("Error getting dog record by id:", error)
      return null
    }
  }

  async createDogRecord(recordData: Omit<DogRecord, "id" | "createdAt" | "updatedAt">): Promise<DogRecord> {
    try {
      const now = new Date().toISOString()
      const result = await this.db
        .prepare(`
        INSERT INTO dog_records (userId, username, name, ca, narrative, time, currentMarketCap, status, reason, commentCount, lastUpdated, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          recordData.userId,
          recordData.username,
          recordData.name,
          recordData.ca,
          recordData.narrative,
          recordData.time,
          recordData.currentMarketCap,
          recordData.status,
          recordData.reason,
          recordData.commentCount,
          recordData.lastUpdated,
          now,
          now,
        )
        .run()

      const newRecord = await this.getDogRecordById(result.meta.last_row_id as number)
      return newRecord!
    } catch (error) {
      console.error("Error creating dog record:", error)
      throw error
    }
  }

  async updateDogRecord(id: number, updateData: Partial<DogRecord>): Promise<DogRecord | null> {
    try {
      const now = new Date().toISOString()
      const fields = Object.keys(updateData).filter((key) => key !== "id" && key !== "createdAt")
      const setClause = fields.map((field) => `${field} = ?`).join(", ")
      const values = fields.map((field) => (updateData as any)[field])

      await this.db
        .prepare(`
        UPDATE dog_records 
        SET ${setClause}, updatedAt = ?
        WHERE id = ?
      `)
        .bind(...values, now, id)
        .run()

      return await this.getDogRecordById(id)
    } catch (error) {
      console.error("Error updating dog record:", error)
      return null
    }
  }

  async deleteDogRecord(id: number): Promise<boolean> {
    try {
      await this.db.prepare("DELETE FROM dog_records WHERE id = ?").bind(id).run()
      await this.deleteCommentsByRecord(id, "dog")
      return true
    } catch (error) {
      console.error("Error deleting dog record:", error)
      return false
    }
  }

  // Comments operations
  async getComments(): Promise<Comment[]> {
    try {
      const results = await this.db.prepare("SELECT * FROM comments ORDER BY createdAt DESC").all()
      return results.results as Comment[]
    } catch (error) {
      console.error("Error getting comments:", error)
      return []
    }
  }

  async getCommentsByRecord(recordId: number, recordType: string): Promise<Comment[]> {
    try {
      const results = await this.db
        .prepare("SELECT * FROM comments WHERE recordId = ? AND recordType = ? ORDER BY createdAt DESC")
        .bind(recordId, recordType)
        .all()
      return results.results as Comment[]
    } catch (error) {
      console.error("Error getting comments by record:", error)
      return []
    }
  }

  async createComment(commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">): Promise<Comment> {
    try {
      const now = new Date().toISOString()
      const result = await this.db
        .prepare(`
        INSERT INTO comments (recordId, recordType, username, content, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
        .bind(commentData.recordId, commentData.recordType, commentData.username, commentData.content, now, now)
        .run()

      // Update comment count
      if (commentData.recordType === "airdrop") {
        await this.db
          .prepare(`
          UPDATE records 
          SET commentCount = commentCount + 1
          WHERE id = ?
        `)
          .bind(commentData.recordId)
          .run()
      } else if (commentData.recordType === "dog") {
        await this.db
          .prepare(`
          UPDATE dog_records 
          SET commentCount = commentCount + 1
          WHERE id = ?
        `)
          .bind(commentData.recordId)
          .run()
      }

      const newComment = await this.db
        .prepare("SELECT * FROM comments WHERE id = ?")
        .bind(result.meta.last_row_id)
        .first()
      return newComment as Comment
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  }

  async deleteComment(id: number): Promise<boolean> {
    try {
      const comment = (await this.db.prepare("SELECT * FROM comments WHERE id = ?").bind(id).first()) as Comment
      if (!comment) return false

      await this.db.prepare("DELETE FROM comments WHERE id = ?").bind(id).run()

      // Update comment count
      if (comment.recordType === "airdrop") {
        await this.db
          .prepare(`
          UPDATE records 
          SET commentCount = MAX(0, commentCount - 1)
          WHERE id = ?
        `)
          .bind(comment.recordId)
          .run()
      } else if (comment.recordType === "dog") {
        await this.db
          .prepare(`
          UPDATE dog_records 
          SET commentCount = MAX(0, commentCount - 1)
          WHERE id = ?
        `)
          .bind(comment.recordId)
          .run()
      }

      return true
    } catch (error) {
      console.error("Error deleting comment:", error)
      return false
    }
  }

  async deleteCommentsByRecord(recordId: number, recordType: string): Promise<void> {
    try {
      await this.db
        .prepare("DELETE FROM comments WHERE recordId = ? AND recordType = ?")
        .bind(recordId, recordType)
        .run()
    } catch (error) {
      console.error("Error deleting comments by record:", error)
    }
  }
}

export function createD1Store(database: D1Database): D1Store {
  return new D1Store(database)
}
