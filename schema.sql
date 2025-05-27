-- 管理员配置表
CREATE TABLE IF NOT EXISTS admin_config (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  lastUpdated TEXT NOT NULL
);

-- 撸毛记录表
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
);

-- 打狗记录表
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
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recordId INTEGER NOT NULL,
  recordType TEXT NOT NULL,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- 插入默认管理员账户
INSERT OR IGNORE INTO admin_config (id, username, password, lastUpdated)
VALUES (1, 'admin', '123456', datetime('now'));

-- 插入示例数据
INSERT OR IGNORE INTO records (id, userId, username, project, platform, status, reward, difficulty, description, finalReward, funding, commentCount, createdAt, updatedAt)
VALUES 
(1, 1, 'Anni', 'Arbitrum空投', 'Arbitrum', '已完成', '1000 ARB', '中等', '通过在Arbitrum网络上进行交易获得空投奖励', 1200, 'A轮 1.2亿美元', 0, '2024-01-15T10:30:00.000Z', '2024-01-15T10:30:00.000Z'),
(2, 1, 'Anni', 'LayerZero测试网', 'LayerZero', '进行中', '待定', '困难', '参与LayerZero跨链协议测试网活动', 0, 'A轮 1.35亿美元', 0, '2024-01-20T14:20:00.000Z', '2024-01-20T14:20:00.000Z'),
(3, 1, 'Anni', 'zkSync Era', 'zkSync', '已完成', '500 ZK', '简单', '在zkSync Era主网上进行交易和使用DeFi协议', 800, 'B轮 2亿美元', 0, '2024-01-10T09:15:00.000Z', '2024-01-10T09:15:00.000Z');

INSERT OR IGNORE INTO dog_records (id, userId, username, name, ca, narrative, time, currentMarketCap, status, reason, commentCount, lastUpdated, createdAt, updatedAt)
VALUES 
(1, 1, 'Anni', 'SafeMoon', '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3', '安全到月球的代币，承诺持有者获得反射奖励', '2024-01-10T14:30:25.000Z', 12000000, '大幅下跌', '团队抛售，流动性问题', 0, '2024-01-25T10:30:00.000Z', '2024-01-10T14:30:25.000Z', '2024-01-25T10:30:00.000Z'),
(2, 1, 'Anni', 'SQUID Token', '0x87230146e138d3f296a9a77e497a2a83012e9bc5', '基于鱿鱼游戏的Play-to-Earn代币', '2024-01-12T09:45:12.000Z', 0, '已归零', 'Rug Pull，开发者跑路', 0, '2024-01-25T10:30:00.000Z', '2024-01-12T09:45:12.000Z', '2024-01-25T10:30:00.000Z');
