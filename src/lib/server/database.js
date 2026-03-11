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

// 토너먼트 테이블 생성
const createTournamentsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS tournaments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    tournament_type TEXT NOT NULL,
    game_type TEXT NOT NULL,
    entry_fee INTEGER NOT NULL DEFAULT 0,
    prize_pool INTEGER NOT NULL DEFAULT 0,
    min_participants INTEGER DEFAULT 10,
    max_participants INTEGER DEFAULT 1000,
    status TEXT NOT NULL DEFAULT 'scheduled',
    registration_start DATETIME NOT NULL,
    registration_end DATETIME NOT NULL,
    tournament_start DATETIME NOT NULL,
    tournament_end DATETIME NOT NULL,
    prize_distribution_type TEXT NOT NULL DEFAULT 'percentage',
    total_prizes INTEGER DEFAULT 10,
    vip_tier_required TEXT DEFAULT 'all',
    min_balance_required INTEGER DEFAULT 0,
    auto_start BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
  )
`);

// 토너먼트 참가자 테이블 생성
const createTournamentParticipantsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS tournament_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    entry_fee_paid INTEGER DEFAULT 0,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_bet_amount INTEGER DEFAULT 0,
    total_win_amount INTEGER DEFAULT 0,
    net_profit INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    current_rank INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'registered',
    disqualified_at DATETIME,
    disqualification_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(tournament_id, user_id)
  )
`);

// 토너먼트 보상 테이블 생성
const createTournamentPrizesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS tournament_prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    rank_from INTEGER NOT NULL,
    rank_to INTEGER NOT NULL,
    prize_type TEXT NOT NULL,
    prize_amount INTEGER NOT NULL,
    prize_percentage INTEGER DEFAULT NULL,
    winner_id INTEGER,
    is_distributed BOOLEAN DEFAULT FALSE,
    distributed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users (id) ON DELETE SET NULL
  )
`);

// 토너먼트 게임 기록 테이블 생성
const createTournamentGameHistoryTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS tournament_game_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    bet_amount INTEGER NOT NULL,
    win_amount INTEGER DEFAULT 0,
    result TEXT NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 테이블 생성 실행
createUserTable.run();
createSessionTable.run();
createGameHistoryTable.run();
createRankingsTable.run();
createRankingRewardsTable.run();
createRewardDistributionsTable.run();
createTournamentsTable.run();
createTournamentParticipantsTable.run();
createTournamentPrizesTable.run();
createTournamentGameHistoryTable.run();

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

// 인덱스 생성 (토너먼트)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tournaments_status_type ON tournaments(status, tournament_type);
    CREATE INDEX IF NOT EXISTS idx_tournaments_timing ON tournaments(tournament_start, tournament_end);
    CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON tournament_participants(tournament_id, status);
    CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON tournament_participants(user_id);
    CREATE INDEX IF NOT EXISTS idx_tournament_participants_ranking ON tournament_participants(tournament_id, current_rank);
    CREATE INDEX IF NOT EXISTS idx_tournament_prizes_tournament ON tournament_prizes(tournament_id, is_distributed);
    CREATE INDEX IF NOT EXISTS idx_tournament_game_history_tournament ON tournament_game_history(tournament_id, user_id);
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

// 토너먼트 관련 쿼리들
export const tournamentQueries = {
  // 토너먼트 CRUD
  create: db.prepare(`
    INSERT INTO tournaments (name, description, tournament_type, game_type, entry_fee, prize_pool, min_participants, max_participants, registration_start, registration_end, tournament_start, tournament_end, prize_distribution_type, total_prizes, vip_tier_required, min_balance_required, auto_start, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  findById: db.prepare(`
    SELECT * FROM tournaments WHERE id = ?
  `),

  findAll: db.prepare(`
    SELECT * FROM tournaments ORDER BY tournament_start DESC
  `),

  findByStatus: db.prepare(`
    SELECT * FROM tournaments WHERE status = ? ORDER BY tournament_start ASC
  `),

  findByTypeAndStatus: db.prepare(`
    SELECT * FROM tournaments WHERE tournament_type = ? AND status = ? ORDER BY tournament_start ASC
  `),

  findActive: db.prepare(`
    SELECT * FROM tournaments WHERE status IN ('registration', 'ongoing') AND tournament_start > CURRENT_TIMESTAMP ORDER BY tournament_start ASC
  `),

  update: db.prepare(`
    UPDATE tournaments
    SET name = ?, description = ?, prize_pool = ?, min_participants = ?, max_participants = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  updateStatus: db.prepare(`
    UPDATE tournaments
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  delete: db.prepare(`
    DELETE FROM tournaments WHERE id = ?
  `),

  // 참가자 관리
  addParticipant: db.prepare(`
    INSERT INTO tournament_participants (tournament_id, user_id, entry_fee_paid, entry_fee_paid)
    VALUES (?, ?, ?, ?)
  `),

  removeParticipant: db.prepare(`
    DELETE FROM tournament_participants WHERE tournament_id = ? AND user_id = ?
  `),

  findParticipant: db.prepare(`
    SELECT tp.*, u.username, u.vip_tier
    FROM tournament_participants tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.tournament_id = ? AND tp.user_id = ?
  `),

  findParticipantsByTournament: db.prepare(`
    SELECT tp.*, u.username, u.vip_tier
    FROM tournament_participants tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.tournament_id = ?
    ORDER BY tp.current_rank ASC, tp.net_profit DESC
  `),

  countParticipants: db.prepare(`
    SELECT COUNT(*) as count FROM tournament_participants WHERE tournament_id = ? AND status = 'registered'
  `),

  updateParticipantStats: db.prepare(`
    UPDATE tournament_participants
    SET total_bet_amount = total_bet_amount + ?,
        total_win_amount = total_win_amount + ?,
        net_profit = net_profit + ? - ?,
        games_played = games_played + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE tournament_id = ? AND user_id = ?
  `),

  updateParticipantRank: db.prepare(`
    UPDATE tournament_participants
    SET current_rank = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  recalculateRankings: db.prepare(`
    UPDATE tournament_participants
    SET current_rank = (
      SELECT COUNT(*) + 1
      FROM tournament_participants tp2
      WHERE tp2.tournament_id = tournament_participants.tournament_id
        AND tp2.net_profit > tournament_participants.net_profit
        AND tp2.status = 'registered'
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE tournament_id = ? AND status = 'registered'
  `),

  findActiveTournamentsForUser: db.prepare(`
    SELECT DISTINCT t.*
    FROM tournaments t
    JOIN tournament_participants tp ON t.id = tp.tournament_id
    WHERE tp.user_id = ? AND t.status = 'ongoing'
  `),

  // 게임 기록
  recordGame: db.prepare(`
    INSERT INTO tournament_game_history (tournament_id, user_id, game_type, bet_amount, win_amount, result)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  findGamesByTournament: db.prepare(`
    SELECT tgh.*, u.username
    FROM tournament_game_history tgh
    JOIN users u ON tgh.user_id = u.id
    WHERE tgh.tournament_id = ?
    ORDER BY tgh.played_at DESC
    LIMIT 100
  `),

  findGamesByUserAndTournament: db.prepare(`
    SELECT * FROM tournament_game_history
    WHERE tournament_id = ? AND user_id = ?
    ORDER BY played_at DESC
  `),

  // 보상 관리
  createPrize: db.prepare(`
    INSERT INTO tournament_prizes (tournament_id, rank_from, rank_to, prize_type, prize_amount, prize_percentage)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  createPrizes: db.prepare(`
    INSERT INTO tournament_prizes (tournament_id, rank_from, rank_to, prize_type, prize_amount)
    VALUES (?, ?, ?, ?, ?)
  `),

  findPrizesByTournament: db.prepare(`
    SELECT tp.*, u.username
    FROM tournament_prizes tp
    LEFT JOIN users u ON tp.winner_id = u.id
    WHERE tp.tournament_id = ?
    ORDER BY tp.rank_from ASC
  `),

  findPrizesForRank: db.prepare(`
    SELECT * FROM tournament_prizes
    WHERE tournament_id = ? AND ? >= rank_from AND ? <= rank_to
  `),

  distributePrize: db.prepare(`
    UPDATE tournament_prizes
    SET winner_id = ?, is_distributed = TRUE, distributed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  findUndistributedPrizes: db.prepare(`
    SELECT tp.*, tp.current_rank
    FROM tournament_prizes tp
    JOIN tournament_participants tp2 ON tp2.current_rank >= tp.rank_from AND tp2.current_rank <= tp.rank_to AND tp2.tournament_id = tp.tournament_id
    WHERE tp.tournament_id = ? AND tp.is_distributed = FALSE
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