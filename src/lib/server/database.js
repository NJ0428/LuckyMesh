import Database from 'better-sqlite3';
import { dev } from '$app/environment';

// 데이터베이스 파일 경로
const dbPath = dev ? 'casino.db' : 'casino.db';

// 데이터베이스 연결
const db = new Database(dbPath);

// WAL 모드 활성화 (성능 향상)
db.pragma('journal_mode = WAL');

// 사용자 테이블 생성
const createUserTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    balance INTEGER DEFAULT 10000,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    vip_tier TEXT DEFAULT 'silver',
    vip_points INTEGER DEFAULT 0,
    total_wagered INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 세션 테이블 생성
const createSessionTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 게임 기록 테이블 생성
const createGameHistoryTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    bet_amount INTEGER NOT NULL,
    win_amount INTEGER DEFAULT 0,
    result TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 랭킹 테이블 생성
const createRankingsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS rankings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ranking_type TEXT NOT NULL,
    game_type TEXT NOT NULL,
    vip_tier TEXT NOT NULL,
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    total_winnings INTEGER DEFAULT 0,
    total_bet_amount INTEGER DEFAULT 0,
    net_profit INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    win_rate REAL DEFAULT 0,
    rank INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 랭킹 보상 설정 테이블 생성
const createRankingRewardsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS ranking_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ranking_type TEXT NOT NULL,
    game_type TEXT NOT NULL,
    vip_tier TEXT NOT NULL,
    rank_from INTEGER NOT NULL,
    rank_to INTEGER NOT NULL,
    reward_type TEXT NOT NULL,
    reward_amount INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 보상 지급 내역 테이블 생성
const createRewardDistributionsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS reward_distributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ranking_id INTEGER NOT NULL,
    reward_id INTEGER NOT NULL,
    reward_type TEXT NOT NULL,
    reward_amount INTEGER NOT NULL,
    is_claimed BOOLEAN DEFAULT FALSE,
    distributed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    claimed_at DATETIME,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (ranking_id) REFERENCES rankings (id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES ranking_rewards (id) ON DELETE CASCADE
  )
`);

// 테이블 생성 실행
createUserTable.run();
createSessionTable.run();
createGameHistoryTable.run();
createRankingsTable.run();
createRankingRewardsTable.run();
createRewardDistributionsTable.run();

// 기존 사용자들의 잔액이 0인 경우 10000으로 업데이트
const updateZeroBalances = db.prepare(`
  UPDATE users SET balance = 10000 WHERE balance = 0
`);
updateZeroBalances.run();

// VIP 관련 컬럼 추가 (마이그레이션)
try {
  db.exec(`
    ALTER TABLE users ADD COLUMN vip_tier TEXT DEFAULT 'silver';
  `);
} catch (e) {
  // 컬럼이 이미 존재하면 무시
}

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN vip_points INTEGER DEFAULT 0;
  `);
} catch (e) {
  // 컬럼이 이미 존재하면 무시
}

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN total_wagered INTEGER DEFAULT 0;
  `);
} catch (e) {
  // 컬럼이 이미 존재하면 무시
}

// 인덱스 생성 (랭킹 테이블)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rankings_period ON rankings(period_start, period_end);
    CREATE INDEX IF NOT EXISTS idx_rankings_type_game ON rankings(ranking_type, game_type);
    CREATE INDEX IF NOT EXISTS idx_rankings_vip_tier ON rankings(vip_tier);
    CREATE INDEX IF NOT EXISTS idx_rankings_rank ON rankings(rank);
    CREATE INDEX IF NOT EXISTS idx_rankings_user_period ON rankings(user_id, period_start, period_end);
  `);
} catch (e) {
  console.error('Index creation error:', e);
}

// 인덱스 생성 (보상 지급 내역)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_reward_distributions_user ON reward_distributions(user_id);
    CREATE INDEX IF NOT EXISTS idx_reward_distributions_claimed ON reward_distributions(is_claimed, expires_at);
    CREATE INDEX IF NOT EXISTS idx_reward_distributions_ranking ON reward_distributions(ranking_id);
  `);
} catch (e) {
  console.error('Index creation error:', e);
}

// 사용자 관련 쿼리들
export const userQueries = {
  // 사용자 생성
  create: db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, phone, date_of_birth, balance)
    VALUES (?, ?, ?, ?, ?, ?, 10000)
  `),

  // 이메일로 사용자 찾기
  findByEmail: db.prepare(`
    SELECT * FROM users WHERE email = ?
  `),

  // 사용자명으로 사용자 찾기
  findByUsername: db.prepare(`
    SELECT * FROM users WHERE username = ?
  `),

  // ID로 사용자 찾기
  findById: db.prepare(`
    SELECT * FROM users WHERE id = ?
  `),

  // 사용자 정보 업데이트
  update: db.prepare(`
    UPDATE users
    SET full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 잔액 업데이트
  updateBalance: db.prepare(`
    UPDATE users
    SET balance = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 사용자 활성화/비활성화
  updateStatus: db.prepare(`
    UPDATE users
    SET is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
};

// 세션 관련 쿼리들
export const sessionQueries = {
  // 세션 생성
  create: db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `),

  // 세션 ID로 찾기
  findById: db.prepare(`
    SELECT s.*, u.id as user_id, u.username, u.email, u.full_name, u.balance, u.is_active
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
  `),

  // 세션 삭제
  delete: db.prepare(`
    DELETE FROM sessions WHERE id = ?
  `),

  // 만료된 세션 정리
  cleanExpired: db.prepare(`
    DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP
  `)
};

// 게임 기록 관련 쿼리들
export const gameQueries = {
  // 게임 기록 생성
  create: db.prepare(`
    INSERT INTO game_history (user_id, game_type, bet_amount, win_amount, result)
    VALUES (?, ?, ?, ?, ?)
  `),

  // 사용자의 게임 기록 조회
  findByUserId: db.prepare(`
    SELECT * FROM game_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `),

  // 게임별 통계
  getStats: db.prepare(`
    SELECT
      game_type,
      COUNT(*) as total_games,
      SUM(bet_amount) as total_bet,
      SUM(win_amount) as total_win
    FROM game_history
    WHERE user_id = ?
    GROUP BY game_type
  `)
};

// 랭킹 관련 쿼리들
export const rankingQueries = {
  // 랭킹 생성/업데이트
  upsert: db.prepare(`
    INSERT INTO rankings (user_id, ranking_type, game_type, vip_tier, period_start, period_end, total_winnings, total_bet_amount, net_profit, games_played, win_rate, rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, ranking_type, game_type, period_start, period_end) DO UPDATE SET
      total_winnings = excluded.total_winnings,
      total_bet_amount = excluded.total_bet_amount,
      net_profit = excluded.net_profit,
      games_played = excluded.games_played,
      win_rate = excluded.win_rate,
      rank = excluded.rank
  `),

  // 랭킹 조회 (기간별, 타입별, 게임별)
  findByPeriod: db.prepare(`
    SELECT r.*, u.username, u.full_name
    FROM rankings r
    JOIN users u ON r.user_id = u.id
    WHERE r.period_start = ? AND r.period_end = ? AND r.ranking_type = ? AND r.game_type = ?
    ORDER BY r.rank ASC
    LIMIT 100
  `),

  // VIP 등급별 랭킹 조회
  findByVipTier: db.prepare(`
    SELECT r.*, u.username, u.full_name
    FROM rankings r
    JOIN users u ON r.user_id = u.id
    WHERE r.period_start = ? AND r.period_end = ? AND r.ranking_type = ? AND r.game_type = ? AND r.vip_tier = ?
    ORDER BY r.rank ASC
    LIMIT 100
  `),

  // 사용자의 랭킹 조회
  findUserRank: db.prepare(`
    SELECT r.*, u.username, u.full_name
    FROM rankings r
    JOIN users u ON r.user_id = u.id
    WHERE r.user_id = ? AND r.period_start = ? AND r.period_end = ? AND r.ranking_type = ? AND r.game_type = ?
  `),

  // 기간 내 모든 랭킹 삭제
  deleteByPeriod: db.prepare(`
    DELETE FROM rankings WHERE period_start = ? AND period_end = ?
  `),

  // 요약 통계 조회
  getSummary: db.prepare(`
    SELECT
      COUNT(*) as total_players,
      COUNT(CASE WHEN rank <= 10 THEN 1 END) as top_10_players,
      AVG(net_profit) as avg_profit,
      AVG(win_rate) as avg_win_rate
    FROM rankings
    WHERE period_start = ? AND period_end = ? AND ranking_type = ? AND game_type = ?
  `)
};

// 랭킹 보상 설정 쿼리들
export const rewardConfigQueries = {
  // 보상 설정 생성
  create: db.prepare(`
    INSERT INTO ranking_rewards (ranking_type, game_type, vip_tier, rank_from, rank_to, reward_type, reward_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),

  // 보상 설정 조회
  findByRankingAndGame: db.prepare(`
    SELECT * FROM ranking_rewards
    WHERE ranking_type = ? AND game_type = ?
    ORDER BY rank_from ASC
  `),

  // 특정 순위의 보상 조회
  findForRank: db.prepare(`
    SELECT * FROM ranking_rewards
    WHERE ranking_type = ? AND game_type = ? AND vip_tier = ? AND ? >= rank_from AND ? <= rank_to
  `),

  // 모든 보상 설정 조회
  findAll: db.prepare(`
    SELECT * FROM ranking_rewards ORDER BY ranking_type, game_type, rank_from
  `)
};

// 보상 지급 내역 쿼리들
export const rewardDistributionQueries = {
  // 지급 내역 생성
  create: db.prepare(`
    INSERT INTO reward_distributions (user_id, ranking_id, reward_id, reward_type, reward_amount, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  // 사용자의 미수령 보상 조회
  findUnclaimed: db.prepare(`
    SELECT rd.*, rr.rank_from, rr.rank_to, r.game_type, r.ranking_type
    FROM reward_distributions rd
    JOIN ranking_rewards rr ON rd.reward_id = rr.id
    JOIN rankings r ON rd.ranking_id = r.id
    WHERE rd.user_id = ? AND rd.is_claimed = FALSE AND (rd.expires_at IS NULL OR rd.expires_at > CURRENT_TIMESTAMP)
    ORDER BY rd.distributed_at DESC
  `),

  // 사용자의 보상 내역 조회
  findByUser: db.prepare(`
    SELECT rd.*, rr.rank_from, rr.rank_to, r.game_type, r.ranking_type
    FROM reward_distributions rd
    JOIN ranking_rewards rr ON rd.reward_id = rr.id
    JOIN rankings r ON rd.ranking_id = r.id
    WHERE rd.user_id = ?
    ORDER BY rd.distributed_at DESC
    LIMIT 50
  `),

  // 보상 수령 처리
  claim: db.prepare(`
    UPDATE reward_distributions
    SET is_claimed = TRUE, claimed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND is_claimed = FALSE
  `),

  // ID로 조회
  findById: db.prepare(`
    SELECT * FROM reward_distributions WHERE id = ?
  `)
};

// 사용자 VIP 정보 업데이트 쿼리
export const vipQueries = {
  // VIP 포인트 업데이트
  updatePoints: db.prepare(`
    UPDATE users
    SET vip_points = vip_points + ?, total_wagered = total_wagered + ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // VIP 등급 업데이트
  updateTier: db.prepare(`
    UPDATE users
    SET vip_tier = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 사용자 VIP 정보 조회
  getUserInfo: db.prepare(`
    SELECT id, username, vip_tier, vip_points, total_wagered FROM users WHERE id = ?
  `)
};

// 데이터베이스 정리 함수 (만료된 세션 삭제)
export function cleanup() {
  sessionQueries.cleanExpired.run();
}

// 앱 시작 시 정리 실행
cleanup();

// 주기적으로 정리 (1시간마다)
setInterval(cleanup, 60 * 60 * 1000);

export default db;