import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

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

class DataStore {
  private getFilePath(filename: string): string {
    return path.join(DATA_DIR, filename)
  }

  private readFile<T>(filename: string, defaultData: T[] = []): T[] {
    const filePath = this.getFilePath(filename)
    try {
      if (!fs.existsSync(filePath)) {
        this.writeFile(filename, defaultData)
        return defaultData
      }
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    } catch (error) {
      console.error(`Error reading ${filename}:`, error)
      return defaultData
    }
  }

  private readConfigFile(): AdminConfig {
    const filePath = this.getFilePath("admin-config.json")
    try {
      if (!fs.existsSync(filePath)) {
        const defaultConfig: AdminConfig = {
          username: "admin",
          password: "123456",
          lastUpdated: new Date().toISOString(),
        }
        this.writeConfigFile(defaultConfig)
        return defaultConfig
      }
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    } catch (error) {
      console.error("Error reading admin config:", error)
      return {
        username: "admin",
        password: "123456",
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  private writeFile<T>(filename: string, data: T[]): void {
    const filePath = this.getFilePath(filename)
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
    } catch (error) {
      console.error(`Error writing ${filename}:`, error)
    }
  }

  private writeConfigFile(config: AdminConfig): void {
    const filePath = this.getFilePath("admin-config.json")
    try {
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8")
    } catch (error) {
      console.error("Error writing admin config:", error)
    }
  }

  private getNextId<T extends { id: number }>(data: T[]): number {
    return data.length > 0 ? Math.max(...data.map((item) => item.id)) + 1 : 1
  }

  // Admin config operations
  getAdminConfig(): AdminConfig {
    return this.readConfigFile()
  }

  updateAdminPassword(currentPassword: string, newPassword: string): boolean {
    const config = this.readConfigFile()
    if (config.password !== currentPassword) {
      return false
    }

    config.password = newPassword
    config.lastUpdated = new Date().toISOString()
    this.writeConfigFile(config)
    return true
  }

  validateAdmin(username: string, password: string): boolean {
    const config = this.readConfigFile()
    return config.username === username && config.password === password
  }

  // Records operations
  getRecords(): Record[] {
    return this.readFile<Record>("records.json", [])
  }

  getRecordById(id: number): Record | null {
    const records = this.getRecords()
    return records.find((record) => record.id === id) || null
  }

  createRecord(recordData: Omit<Record, "id" | "createdAt" | "updatedAt">): Record {
    const records = this.getRecords()
    const newRecord: Record = {
      ...recordData,
      id: this.getNextId(records),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    records.push(newRecord)
    this.writeFile("records.json", records)
    return newRecord
  }

  updateRecord(id: number, updateData: Partial<Record>): Record | null {
    const records = this.getRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return null

    records[index] = {
      ...records[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }
    this.writeFile("records.json", records)
    return records[index]
  }

  deleteRecord(id: number): boolean {
    const records = this.getRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return false

    records.splice(index, 1)
    this.writeFile("records.json", records)

    // 同时删除相关评论
    this.deleteCommentsByRecord(id, "airdrop")
    return true
  }

  // Dog Records operations
  getDogRecords(): DogRecord[] {
    return this.readFile<DogRecord>("dog-records.json", [])
  }

  getDogRecordById(id: number): DogRecord | null {
    const records = this.getDogRecords()
    return records.find((record) => record.id === id) || null
  }

  createDogRecord(recordData: Omit<DogRecord, "id" | "createdAt" | "updatedAt">): DogRecord {
    const records = this.getDogRecords()
    const newRecord: DogRecord = {
      ...recordData,
      id: this.getNextId(records),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    records.push(newRecord)
    this.writeFile("dog-records.json", records)
    return newRecord
  }

  updateDogRecord(id: number, updateData: Partial<DogRecord>): DogRecord | null {
    const records = this.getDogRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return null

    records[index] = {
      ...records[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }
    this.writeFile("dog-records.json", records)
    return records[index]
  }

  deleteDogRecord(id: number): boolean {
    const records = this.getDogRecords()
    const index = records.findIndex((record) => record.id === id)
    if (index === -1) return false

    records.splice(index, 1)
    this.writeFile("dog-records.json", records)

    // 同时删除相关评论
    this.deleteCommentsByRecord(id, "dog")
    return true
  }

  // Comments operations
  getComments(): Comment[] {
    return this.readFile<Comment>("comments.json", [])
  }

  getCommentsByRecord(recordId: number, recordType: string): Comment[] {
    const comments = this.getComments()
    return comments.filter((comment) => comment.recordId === recordId && comment.recordType === recordType)
  }

  createComment(commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">): Comment {
    const comments = this.getComments()
    const newComment: Comment = {
      ...commentData,
      id: this.getNextId(comments),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    comments.push(newComment)
    this.writeFile("comments.json", comments)

    // Update comment count in the corresponding record
    if (commentData.recordType === "airdrop") {
      const record = this.getRecordById(commentData.recordId)
      if (record) {
        this.updateRecord(commentData.recordId, {
          commentCount: record.commentCount + 1,
        })
      }
    } else if (commentData.recordType === "dog") {
      const record = this.getDogRecordById(commentData.recordId)
      if (record) {
        this.updateDogRecord(commentData.recordId, {
          commentCount: record.commentCount + 1,
        })
      }
    }

    return newComment
  }

  deleteComment(id: number): boolean {
    const comments = this.getComments()
    const index = comments.findIndex((comment) => comment.id === id)
    if (index === -1) return false

    const comment = comments[index]
    comments.splice(index, 1)
    this.writeFile("comments.json", comments)

    // Update comment count in the corresponding record
    if (comment.recordType === "airdrop") {
      const record = this.getRecordById(comment.recordId)
      if (record && record.commentCount > 0) {
        this.updateRecord(comment.recordId, {
          commentCount: record.commentCount - 1,
        })
      }
    } else if (comment.recordType === "dog") {
      const record = this.getDogRecordById(comment.recordId)
      if (record && record.commentCount > 0) {
        this.updateDogRecord(comment.recordId, {
          commentCount: record.commentCount - 1,
        })
      }
    }

    return true
  }

  deleteCommentsByRecord(recordId: number, recordType: string): void {
    const comments = this.getComments()
    const filteredComments = comments.filter(
      (comment) => !(comment.recordId === recordId && comment.recordType === recordType),
    )
    this.writeFile("comments.json", filteredComments)
  }
}

export const dataStore = new DataStore()
