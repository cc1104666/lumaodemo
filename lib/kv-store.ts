import { kv } from "@vercel/kv"

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

class KVStore {
  private async getNextId(key: string): Promise<number> {
    const data = (await kv.get<any[]>(key)) || []
    return data.length > 0 ? Math.max(...data.map((item: any) => item.id)) + 1 : 1
  }

  // Admin config operations
  async getAdminConfig(): Promise<AdminConfig> {
    const config = await kv.get<AdminConfig>("admin-config")
    if (!config) {
      const defaultConfig: AdminConfig = {
        username: "admin",
        password: "123456",
        lastUpdated: new Date().toISOString(),
      }
      await kv.set("admin-config", defaultConfig)
      return defaultConfig
    }
    return config
  }

  async updateAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const config = await this.getAdminConfig()
    if (config.password !== currentPassword) {
      return false
    }

    config.password = newPassword
    config.lastUpdated = new Date().toISOString()
    await kv.set("admin-config", config)
    return true
  }

  async validateAdmin(username: string, password: string): Promise<boolean> {
    const config = await this.getAdminConfig()
    return config.username === username && config.password === password
  }

  // Records operations
  async getRecords(): Promise<Record[]> {
    return (await kv.get<Record[]>("records")) || []
  }

  async getRecordById(id: number): Promise<Record | null> {
    const records = await this.getRecords()
    return records.find((record) => record.id === id) || null
  }

  async createRecord(recordData: Omit<Record, "id" | "createdAt" | "updatedAt">): Promise<Record> {
    const records = await this.getRecords()
    const newRecord: Record = {
      ...recordData,
      id: await this.getNextId("records"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    records.push(newRecord)
    await kv.set("records", records)
    return newRecord
  }

  async updateRecord(id: number, updateData: Partial<Record>): Promise<Record | null> {
    const records = await this.getRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return null

    records[index] = {
      ...records[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }
    await kv.set("records", records)
    return records[index]
  }

  async deleteRecord(id: number): Promise<boolean> {
    const records = await this.getRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return false

    records.splice(index, 1)
    await kv.set("records", records)

    // 同时删除相关评论
    await this.deleteCommentsByRecord(id, "airdrop")
    return true
  }

  // Dog Records operations
  async getDogRecords(): Promise<DogRecord[]> {
    return (await kv.get<DogRecord[]>("dog-records")) || []
  }

  async getDogRecordById(id: number): Promise<DogRecord | null> {
    const records = await this.getDogRecords()
    return records.find((record) => record.id === id) || null
  }

  async createDogRecord(recordData: Omit<DogRecord, "id" | "createdAt" | "updatedAt">): Promise<DogRecord> {
    const records = await this.getDogRecords()
    const newRecord: DogRecord = {
      ...recordData,
      id: await this.getNextId("dog-records"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    records.push(newRecord)
    await kv.set("dog-records", records)
    return newRecord
  }

  async updateDogRecord(id: number, updateData: Partial<DogRecord>): Promise<DogRecord | null> {
    const records = await this.getDogRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return null

    records[index] = {
      ...records[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }
    await kv.set("dog-records", records)
    return records[index]
  }

  async deleteDogRecord(id: number): Promise<boolean> {
    const records = await this.getDogRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return false

    records.splice(index, 1)
    await kv.set("dog-records", records)

    // 同时删除相关评论
    await this.deleteCommentsByRecord(id, "dog")
    return true
  }

  // Comments operations
  async getComments(): Promise<Comment[]> {
    return (await kv.get<Comment[]>("comments")) || []
  }

  async getCommentsByRecord(recordId: number, recordType: string): Promise<Comment[]> {
    const comments = await this.getComments()
    return comments.filter((comment) => comment.recordId === recordId && comment.recordType === recordType)
  }

  async createComment(commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">): Promise<Comment> {
    const comments = await this.getComments()
    const newComment: Comment = {
      ...commentData,
      id: await this.getNextId("comments"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    comments.push(newComment)
    await kv.set("comments", comments)

    // Update comment count in the corresponding record
    if (commentData.recordType === "airdrop") {
      const record = await this.getRecordById(commentData.recordId)
      if (record) {
        await this.updateRecord(commentData.recordId, {
          commentCount: record.commentCount + 1,
        })
      }
    } else if (commentData.recordType === "dog") {
      const record = await this.getDogRecordById(commentData.recordId)
      if (record) {
        await this.updateDogRecord(commentData.recordId, {
          commentCount: record.commentCount + 1,
        })
      }
    }

    return newComment
  }

  async deleteComment(id: number): Promise<boolean> {
    const comments = await this.getComments()
    const index = comments.findIndex((comment) => comment.id === id)
    if (index === -1) return false

    const comment = comments[index]
    comments.splice(index, 1)
    await kv.set("comments", comments)

    // Update comment count in the corresponding record
    if (comment.recordType === "airdrop") {
      const record = await this.getRecordById(comment.recordId)
      if (record && record.commentCount > 0) {
        await this.updateRecord(comment.recordId, {
          commentCount: record.commentCount - 1,
        })
      }
    } else if (comment.recordType === "dog") {
      const record = await this.getDogRecordById(comment.recordId)
      if (record && record.commentCount > 0) {
        await this.updateDogRecord(comment.recordId, {
          commentCount: record.commentCount - 1,
        })
      }
    }

    return true
  }

  async deleteCommentsByRecord(recordId: number, recordType: string): Promise<void> {
    const comments = await this.getComments()
    const filteredComments = comments.filter(
      (comment) => !(comment.recordId === recordId && comment.recordType === recordType),
    )
    await kv.set("comments", filteredComments)
  }
}

export const kvStore = new KVStore()
