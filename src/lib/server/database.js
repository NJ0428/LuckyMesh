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

// 테이블 생성 실행
createUserTable.run();
createSessionTable.run();
createGameHistoryTable.run();

// 기존 사용자들의 잔액이 0인 경우 10000으로 업데이트
const updateZeroBalances = db.prepare(`
  UPDATE users SET balance = 10000 WHERE balance = 0
`);
updateZeroBalances.run();

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

// 데이터베이스 정리 함수 (만료된 세션 삭제)
export function cleanup() {
  sessionQueries.cleanExpired.run();
}

// 앱 시작 시 정리 실행
cleanup();

// 주기적으로 정리 (1시간마다)
setInterval(cleanup, 60 * 60 * 1000);

export default db;