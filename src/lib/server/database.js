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
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, ranking_type, game_type, period_start, period_end)
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

// 친구 테이블 생성
const createFriendsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
  )
`);

// 차단된 사용자 테이블 생성
const createBlockedUsersTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS blocked_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
  )
`);

// 사용자 온라인 상태 테이블 생성
const createUserOnlineStatusTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS user_online_status (
    user_id INTEGER PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    current_game TEXT,
    current_table_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 칩 선물 테이블 생성
const createChipGiftsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS chip_gifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    responded_at DATETIME,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE,
    CHECK (sender_id != receiver_id),
    CHECK (amount > 0)
  )
`);

// 추천인 테이블 생성
const createReferralsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_id INTEGER NOT NULL,
    referred_id INTEGER NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    reward_amount INTEGER DEFAULT 0,
    reward_paid BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    rewarded_at DATETIME,
    FOREIGN KEY (referrer_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(referrer_id, referred_id),
    CHECK (referrer_id != referred_id)
  )
`);

// 추천 코드 테이블 생성
const createReferralCodesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS referral_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 업적 정의 테이블 생성
const createAchievementsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    achievement_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    tier TEXT NOT NULL,
    reward_amount INTEGER DEFAULT 0,
    requirements_type TEXT NOT NULL,
    requirements_value INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 사용자 업적 진행 테이블 생성
const createUserAchievementsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    completed_at DATETIME,
    reward_claimed BOOLEAN DEFAULT FALSE,
    claimed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)
  )
`);

// 업적 보상 지급 내역 테이블 생성
const createAchievementRewardsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS achievement_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_achievement_id INTEGER NOT NULL,
    reward_type TEXT NOT NULL,
    reward_amount INTEGER NOT NULL,
    is_distributed BOOLEAN DEFAULT FALSE,
    distributed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_achievement_id) REFERENCES user_achievements (id) ON DELETE CASCADE
  )
`);

// 일일 미션 정의 테이블 생성
const createDailyMissionsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS daily_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    reward_chips INTEGER NOT NULL,
    reward_exp INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 사용자 일일 미션 진행 테이블 생성
const createUserDailyMissionsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS user_daily_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mission_id INTEGER NOT NULL,
    mission_date DATE NOT NULL,
    progress INTEGER DEFAULT 0,
    completed_at DATETIME,
    reward_claimed BOOLEAN DEFAULT FALSE,
    claimed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES daily_missions (id) ON DELETE CASCADE,
    UNIQUE(user_id, mission_id, mission_date)
  )
`);

// 챌린지(주간/월간) 정의 테이블 생성
const createChallengesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challenge_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    challenge_type TEXT NOT NULL,
    category TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    reward_chips INTEGER NOT NULL,
    reward_exp INTEGER DEFAULT 0,
    bonus_rewards TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 사용자 챌린지 참여 테이블 생성
const createUserChallengesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS user_challenges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    challenge_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    milestone_reached INTEGER DEFAULT 0,
    completed_at DATETIME,
    reward_claimed BOOLEAN DEFAULT FALSE,
    claimed_at DATETIME,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES challenges (id) ON DELETE CASCADE,
    UNIQUE(user_id, challenge_id)
  )
`);

// 미션 스트릭 추적 테이블 생성
const createMissionStreaksTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS mission_streaks (
    user_id INTEGER PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completion_date DATE,
    total_completed_days INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 일일 보상 테이블 생성
const createDailyRewardsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS daily_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reward_date DATE NOT NULL,
    vip_tier_at_claim TEXT NOT NULL,
    reward_amount INTEGER NOT NULL,
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_at DATETIME,
    expires_at DATETIME DEFAULT (datetime('now', '+24 hours')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, reward_date)
  )
`);

// 룰렛 뽑기 테이블 생성
const createGachaSpinsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS gacha_spins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    spin_date DATE NOT NULL,
    vip_tier_at_spin TEXT NOT NULL,
    spin_count INTEGER DEFAULT 0,
    free_spins_used INTEGER DEFAULT 0,
    paid_spins_used INTEGER DEFAULT 0,
    total_spins INTEGER DEFAULT 0,
    last_spin_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, spin_date)
  )
`);

// 뽑기 결과 내역 테이블 생성
const createGachaResultsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS gacha_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    gacha_spin_id INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    reward_amount INTEGER NOT NULL,
    is_free_spin BOOLEAN DEFAULT TRUE,
    vip_bonus_applied BOOLEAN DEFAULT FALSE,
    vip_bonus_multiplier REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (gacha_spin_id) REFERENCES gacha_spins (id) ON DELETE CASCADE
  )
`);

// 룰렛 보상 설정 테이블 생성
const createGachaRewardConfigsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS gacha_reward_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rarity TEXT NOT NULL UNIQUE,
    base_reward_amount INTEGER NOT NULL,
    base_probability REAL NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// VIP 보너스 설정 테이블 생성
const createGachaVipBonusesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS gacha_vip_bonuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vip_tier TEXT NOT NULL UNIQUE,
    daily_reward_amount INTEGER NOT NULL,
    free_spins_per_day INTEGER NOT NULL,
    rarity_bonus_rare REAL DEFAULT 0.0,
    rarity_bonus_legendary REAL DEFAULT 0.0,
    probability_multiplier REAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
createFriendsTable.run();
createBlockedUsersTable.run();
createUserOnlineStatusTable.run();
createChipGiftsTable.run();
createReferralsTable.run();
createReferralCodesTable.run();
createAchievementsTable.run();
createUserAchievementsTable.run();
createAchievementRewardsTable.run();
createDailyMissionsTable.run();
createUserDailyMissionsTable.run();
createChallengesTable.run();
createUserChallengesTable.run();
createMissionStreaksTable.run();
createDailyRewardsTable.run();
createGachaSpinsTable.run();
createGachaResultsTable.run();
createGachaRewardConfigsTable.run();
createGachaVipBonusesTable.run();

// 초기 데이터 삽입: 룰렛 보상 설정
const insertGachaRewardConfigs = db.prepare(`
  INSERT OR IGNORE INTO gacha_reward_configs (rarity, base_reward_amount, base_probability, icon, color)
  VALUES
    ('common', 10000, 60.0, '⚪', 'from-gray-400 to-gray-600'),
    ('rare', 50000, 30.0, '🔵', 'from-blue-400 to-blue-600'),
    ('legendary', 200000, 10.0, '🟡', 'from-yellow-400 to-yellow-600')
`);
insertGachaRewardConfigs.run();

// 초기 데이터 삽입: VIP 보너스 설정
const insertGachaVipBonuses = db.prepare(`
  INSERT OR IGNORE INTO gacha_vip_bonuses (vip_tier, daily_reward_amount, free_spins_per_day, rarity_bonus_rare, rarity_bonus_legendary, probability_multiplier)
  VALUES
    ('bronze', 5000, 1, 0.0, 0.0, 1.0),
    ('silver', 10000, 2, 0.05, 0.02, 1.0),
    ('gold', 20000, 3, 0.10, 0.05, 1.0),
    ('platinum', 50000, 4, 0.15, 0.08, 1.0),
    ('diamond', 100000, 5, 0.20, 0.12, 1.0)
`);
insertGachaVipBonuses.run();

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

// 인덱스 생성 (친구 시스템)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_friends_user_status ON friends(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_friends_friend_status ON friends(friend_id, status);
    CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
    CREATE INDEX IF NOT EXISTS idx_chip_gifts_receiver_status ON chip_gifts(receiver_id, status);
    CREATE INDEX IF NOT EXISTS idx_chip_gifts_sender ON chip_gifts(sender_id);
    CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
    CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
    CREATE INDEX IF NOT EXISTS idx_user_online_status_online ON user_online_status(is_online, last_seen);
  `);
} catch (e) {
  console.error('Index creation error:', e);
}

// 인덱스 생성 (업적 시스템)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_achievements_game_type ON achievements(game_type, is_active);
    CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category, tier);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(completed_at, reward_claimed);
    CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(user_id, achievement_id);
    CREATE INDEX IF NOT EXISTS idx_achievement_rewards_user_achievement ON achievement_rewards(user_achievement_id, is_distributed);
  `);
} catch (e) {
  console.error('Index creation error:', e);
}

// 인덱스 생성 (미션 및 챌린지 시스템)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_daily_missions_difficulty ON daily_missions(difficulty, is_active);
    CREATE INDEX IF NOT EXISTS idx_daily_missions_category ON daily_missions(category, game_type);
    CREATE INDEX IF NOT EXISTS idx_user_daily_missions_user_date ON user_daily_missions(user_id, mission_date);
    CREATE INDEX IF NOT EXISTS idx_user_daily_missions_completed ON user_daily_missions(completed_at, reward_claimed);
    CREATE INDEX IF NOT EXISTS idx_challenges_type_active ON challenges(challenge_type, is_active, start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_challenges_completed ON user_challenges(completed_at, reward_claimed);
    CREATE INDEX IF NOT EXISTS idx_mission_streaks_streak ON mission_streaks(current_streak, last_completion_date);
  `);
} catch (e) {
  console.error('Index creation error:', e);
}

// 인덱스 생성 (예적금 시스템)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_chip_deposits_user ON chip_deposits(user_id);
    CREATE INDEX IF NOT EXISTS idx_chip_deposits_status ON chip_deposits(status);
    CREATE INDEX IF NOT EXISTS idx_chip_deposits_activity ON chip_deposits(last_activity);
    CREATE INDEX IF NOT EXISTS idx_deposit_interest_history_user ON deposit_interest_history(user_id, paid_at);
    CREATE INDEX IF NOT EXISTS idx_deposit_interest_history_deposit ON deposit_interest_history(deposit_id);
    CREATE INDEX IF NOT EXISTS idx_deposit_transactions_user ON deposit_transactions(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_deposit_transactions_deposit ON deposit_transactions(deposit_id);
  `);
} catch (e) {
  console.error('Index creation error:', e);
}

// 인덱스 생성 (일일 보상 및 룰렛 시스템)
try {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_date ON daily_rewards(user_id, reward_date);
    CREATE INDEX IF NOT EXISTS idx_daily_rewards_claimed ON daily_rewards(is_claimed, expires_at);
    CREATE INDEX IF NOT EXISTS idx_gacha_spins_user_date ON gacha_spins(user_id, spin_date);
    CREATE INDEX IF NOT EXISTS idx_gacha_results_user_created ON gacha_results(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_gacha_results_rarity ON gacha_results(rarity);
    CREATE INDEX IF NOT EXISTS idx_gacha_vip_bonuses_tier ON gacha_vip_bonuses(vip_tier);
    CREATE INDEX IF NOT EXISTS idx_gacha_reward_configs_rarity ON gacha_reward_configs(rarity);
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
    SELECT tp.*
    FROM tournament_prizes tp
    JOIN tournament_participants tp2 ON tp2.current_rank >= tp.rank_from AND tp2.current_rank <= tp.rank_to AND tp2.tournament_id = tp.tournament_id
    WHERE tp.tournament_id = ? AND tp.is_distributed = FALSE
  `)
};

// 친구 관련 쿼리들
export const friendQueries = {
  // 친구 요청 생성
  createRequest: db.prepare(`
    INSERT INTO friends (user_id, friend_id, status)
    VALUES (?, ?, 'pending')
  `),

  // 친구 요청 수락
  acceptRequest: db.prepare(`
    UPDATE friends
    SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND friend_id = ? AND status = 'pending'
  `),

  // 친구 요청 거절
  rejectRequest: db.prepare(`
    UPDATE friends
    SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND friend_id = ? AND status = 'pending'
  `),

  // 친구 삭제
  remove: db.prepare(`
    DELETE FROM friends
    WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
    AND status = 'accepted'
  `),

  // 사용자의 친구 목록 조회
  findByUserId: db.prepare(`
    SELECT
      f.id,
      f.user_id,
      f.friend_id,
      f.status,
      f.created_at,
      u_sender.username as sender_name,
      u_sender.full_name as sender_full_name,
      u_receiver.username as friend_name,
      u_receiver.full_name as friend_full_name,
      u_receiver.vip_tier as friend_vip_tier,
      uos.is_online as friend_is_online,
      uos.last_seen as friend_last_seen
    FROM friends f
    JOIN users u_sender ON f.user_id = u_sender.id
    JOIN users u_receiver ON f.friend_id = u_receiver.id
    LEFT JOIN user_online_status uos ON u_receiver.id = uos.user_id
    WHERE f.user_id = ? OR f.friend_id = ?
    ORDER BY f.created_at DESC
  `),

  // 대기 중인 친구 요청 조회
  findPending: db.prepare(`
    SELECT
      f.*,
      u.username as sender_name,
      u.full_name as sender_full_name,
      u.vip_tier as sender_vip_tier
    FROM friends f
    JOIN users u ON f.user_id = u.id
    WHERE f.friend_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `),

  // 사용자명으로 사용자 검색
  searchByUsername: db.prepare(`
    SELECT id, username, full_name, vip_tier
    FROM users
    WHERE username LIKE ? AND id != ?
    LIMIT 20
  `),

  // 이미 친구인지 확인
  checkExisting: db.prepare(`
    SELECT * FROM friends
    WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
    AND status IN ('pending', 'accepted')
  `),

  // 친구 수 카운트
  countFriends: db.prepare(`
    SELECT COUNT(*) as count
    FROM friends
    WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
  `)
};

// 차단 관련 쿼리들
export const blockQueries = {
  // 차단 추가
  block: db.prepare(`
    INSERT INTO blocked_users (blocker_id, blocked_id, reason)
    VALUES (?, ?, ?)
  `),

  // 차단 해제
  unblock: db.prepare(`
    DELETE FROM blocked_users
    WHERE blocker_id = ? AND blocked_id = ?
  `),

  // 차단 목록 조회
  findByBlockerId: db.prepare(`
    SELECT
      bu.*,
      u.username as blocked_name,
      u.full_name as blocked_full_name
    FROM blocked_users bu
    JOIN users u ON bu.blocked_id = u.id
    WHERE bu.blocker_id = ?
    ORDER BY bu.created_at DESC
  `),

  // 차단 여부 확인
  checkBlocked: db.prepare(`
    SELECT * FROM blocked_users
    WHERE blocker_id = ? AND blocked_id = ?
  `),

  // 서로 차단 여부 확인
  checkBidirectionalBlocked: db.prepare(`
    SELECT * FROM blocked_users
    WHERE (blocker_id = ? AND blocked_id = ?)
       OR (blocker_id = ? AND blocked_id = ?)
  `)
};

// 온라인 상태 관련 쿼리들
export const onlineStatusQueries = {
  // 온라인 상태 업데이트
  updateStatus: db.prepare(`
    INSERT INTO user_online_status (user_id, is_online, last_seen, current_game)
    VALUES (?, TRUE, CURRENT_TIMESTAMP, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      is_online = TRUE,
      last_seen = CURRENT_TIMESTAMP,
      current_game = excluded.current_game
  `),

  // 오프라인 상태로 변경
  setOffline: db.prepare(`
    UPDATE user_online_status
    SET is_online = FALSE, last_seen = CURRENT_TIMESTAMP, current_game = NULL
    WHERE user_id = ?
  `),

  // 친구들의 온라인 상태 조회
  findFriendsStatus: db.prepare(`
    SELECT
      uos.user_id,
      uos.is_online,
      uos.last_seen,
      uos.current_game,
      u.username,
      u.full_name
    FROM user_online_status uos
    JOIN users u ON uos.user_id = u.id
    WHERE uos.user_id IN (${Array(100).fill('?').join(',')})
  `),

  // 특정 사용자의 온라인 상태 조회
  findByUserId: db.prepare(`
    SELECT uos.*, u.username, u.full_name
    FROM user_online_status uos
    JOIN users u ON uos.user_id = u.id
    WHERE uos.user_id = ?
  `),

  // 오래된 온라인 상태 정리 (하루 이상 업데이트 없는 온라인 상태를 오프라인으로)
  cleanupOldStatus: db.prepare(`
    UPDATE user_online_status
    SET is_online = FALSE, current_game = NULL
    WHERE is_online = TRUE AND last_seen < datetime('now', '-5 minutes')
  `)
};

// 칩 선물 관련 쿼리들
export const chipGiftQueries = {
  // 선물 생성
  create: db.prepare(`
    INSERT INTO chip_gifts (sender_id, receiver_id, amount, message, expires_at)
    VALUES (?, ?, ?, ?, datetime('now', '+48 hours'))
  `),

  // 대기 중인 선물 조회 (수신자)
  findPendingByReceiver: db.prepare(`
    SELECT
      cg.*,
      u.username as sender_name,
      u.full_name as sender_full_name
    FROM chip_gifts cg
    JOIN users u ON cg.sender_id = u.id
    WHERE cg.receiver_id = ? AND cg.status = 'pending' AND cg.expires_at > CURRENT_TIMESTAMP
    ORDER BY cg.created_at DESC
  `),

  // 선물 내역 조회
  findByUser: db.prepare(`
    SELECT
      cg.*,
      u_sender.username as sender_name,
      u_sender.full_name as sender_full_name,
      u_receiver.username as receiver_name,
      u_receiver.full_name as receiver_full_name
    FROM chip_gifts cg
    JOIN users u_sender ON cg.sender_id = u_sender.id
    JOIN users u_receiver ON cg.receiver_id = u_receiver.id
    WHERE cg.sender_id = ? OR cg.receiver_id = ?
    ORDER BY cg.created_at DESC
    LIMIT 50
  `),

  // 선물 수락
  accept: db.prepare(`
    UPDATE chip_gifts
    SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
    WHERE id = ? AND receiver_id = ? AND status = 'pending'
  `),

  // 선물 거절
  reject: db.prepare(`
    UPDATE chip_gifts
    SET status = 'rejected', responded_at = CURRENT_TIMESTAMP
    WHERE id = ? AND receiver_id = ? AND status = 'pending'
  `),

  // ID로 선물 조회
  findById: db.prepare(`
    SELECT * FROM chip_gifts WHERE id = ?
  `),

  // 오늘 보낸 선물 수 카운트
  countTodayGifts: db.prepare(`
    SELECT COUNT(*) as count
    FROM chip_gifts
    WHERE sender_id = ? AND DATE(created_at) = DATE(CURRENT_TIMESTAMP)
  `),

  // 만료된 선물 찾기
  findExpired: db.prepare(`
    SELECT * FROM chip_gifts
    WHERE status = 'pending' AND expires_at <= CURRENT_TIMESTAMP
  `)
};

// 추천인 관련 쿼리들
export const referralQueries = {
  // 추천 코드 생성
  createCode: db.prepare(`
    INSERT INTO referral_codes (user_id, code, is_active, usage_count, max_uses)
    VALUES (?, ?, TRUE, 0, NULL)
  `),

  // 추천 코드 조회
  findCodeByUserId: db.prepare(`
    SELECT * FROM referral_codes WHERE user_id = ?
  `),

  // 추천 코드로 조회
  findCodeByCode: db.prepare(`
    SELECT rc.*, u.username, u.full_name
    FROM referral_codes rc
    JOIN users u ON rc.user_id = u.id
    WHERE rc.code = ? AND rc.is_active = TRUE AND (rc.expires_at IS NULL OR rc.expires_at > CURRENT_TIMESTAMP)
  `),

  // 추천 코드 사용 횟수 증가
  incrementCodeUsage: db.prepare(`
    UPDATE referral_codes
    SET usage_count = usage_count + 1
    WHERE code = ?
  `),

  // 추천 생성
  createReferral: db.prepare(`
    INSERT INTO referrals (referrer_id, referred_id, referral_code, status, reward_amount)
    VALUES (?, ?, ?, 'completed', 50000)
  `),

  // 추천인의 추천 목록 조회
  findByReferrerId: db.prepare(`
    SELECT
      r.*,
      u_referrer.username as referrer_name,
      u_referred.username as referred_name,
      u_referred.full_name as referred_full_name
    FROM referrals r
    JOIN users u_referrer ON r.referrer_id = u_referrer.id
    JOIN users u_referred ON r.referred_id = u_referred.id
    WHERE r.referrer_id = ?
    ORDER BY r.created_at DESC
  `),

  // 추천 통계 조회
  getStats: db.prepare(`
    SELECT
      COUNT(*) as total_referrals,
      COUNT(CASE WHEN reward_paid = TRUE THEN 1 END) as paid_referrals,
      SUM(reward_amount) as total_rewards
    FROM referrals
    WHERE referrer_id = ?
  `),

  // 보상 지급 상태 업데이트
  markRewardPaid: db.prepare(`
    UPDATE referrals
    SET reward_paid = TRUE, rewarded_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 추천 코드로 추천 내역 조회
  findByCode: db.prepare(`
    SELECT * FROM referrals WHERE referral_code = ?
  `),

  // 사용자가 이미 추천되었는지 확인
  checkReferred: db.prepare(`
    SELECT * FROM referrals WHERE referred_id = ?
  `)
};

// 업적 관련 쿼리들
export const achievementQueries = {
  // 업적 정의 CRUD
  create: db.prepare(`
    INSERT INTO achievements (achievement_id, title, description, icon, category, tier, reward_amount, requirements_type, requirements_value, game_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  findById: db.prepare(`
    SELECT * FROM achievements WHERE id = ?
  `),

  findByAchievementId: db.prepare(`
    SELECT * FROM achievements WHERE achievement_id = ?
  `),

  findAll: db.prepare(`
    SELECT * FROM achievements WHERE is_active = TRUE ORDER BY game_type, tier, category
  `),

  findByGameType: db.prepare(`
    SELECT * FROM achievements WHERE game_type = ? AND is_active = TRUE ORDER BY tier, category
  `),

  findByCategory: db.prepare(`
    SELECT * FROM achievements WHERE category = ? AND is_active = TRUE ORDER BY tier
  `),

  findByTier: db.prepare(`
    SELECT * FROM achievements WHERE tier = ? AND is_active = TRUE ORDER BY game_type, category
  `),

  findByGameAndTier: db.prepare(`
    SELECT * FROM achievements WHERE game_type = ? AND tier = ? AND is_active = TRUE ORDER BY category
  `),

  update: db.prepare(`
    UPDATE achievements
    SET title = ?, description = ?, icon = ?, reward_amount = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  deactivate: db.prepare(`
    UPDATE achievements SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `),

  // 사용자 업적 진행 관리
  createUserAchievement: db.prepare(`
    INSERT INTO user_achievements (user_id, achievement_id, progress)
    VALUES (?, ?, 0)
  `),

  findUserAchievement: db.prepare(`
    SELECT ua.*, a.achievement_id, a.title, a.description, a.icon, a.category, a.tier, a.reward_amount, a.requirements_type, a.requirements_value, a.game_type
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ? AND ua.achievement_id = ?
  `),

  findUserAchievements: db.prepare(`
    SELECT ua.*, a.achievement_id, a.title, a.description, a.icon, a.category, a.tier, a.reward_amount, a.requirements_type, a.requirements_value, a.game_type
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
    ORDER BY ua.completed_at DESC, ua.updated_at DESC
  `),

  findUserAchievementsByGame: db.prepare(`
    SELECT ua.*, a.achievement_id, a.title, a.description, a.icon, a.category, a.tier, a.reward_amount, a.requirements_type, a.requirements_value, a.game_type
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ? AND a.game_type = ?
    ORDER BY ua.completed_at DESC, ua.updated_at DESC
  `),

  findCompletedAchievements: db.prepare(`
    SELECT ua.*, a.achievement_id, a.title, a.description, a.icon, a.category, a.tier, a.reward_amount, a.requirements_type, a.requirements_value, a.game_type
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ? AND ua.completed_at IS NOT NULL
    ORDER BY ua.completed_at DESC
  `),

  findPendingClaims: db.prepare(`
    SELECT ua.*, a.achievement_id, a.title, a.description, a.icon, a.category, a.tier, a.reward_amount, a.requirements_type, a.requirements_value, a.game_type
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ? AND ua.completed_at IS NOT NULL AND ua.reward_claimed = FALSE
    ORDER BY ua.completed_at DESC
  `),

  findInProgressAchievements: db.prepare(`
    SELECT ua.*, a.achievement_id, a.title, a.description, a.icon, a.category, a.tier, a.reward_amount, a.requirements_type, a.requirements_value, a.game_type
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ? AND ua.completed_at IS NULL
    ORDER BY ua.updated_at DESC
  `),

  updateProgress: db.prepare(`
    UPDATE user_achievements
    SET progress = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  markCompleted: db.prepare(`
    UPDATE user_achievements
    SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  markRewardClaimed: db.prepare(`
    UPDATE user_achievements
    SET reward_claimed = TRUE, claimed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  getOrInitializeUserAchievement: db.prepare(`
    INSERT INTO user_achievements (user_id, achievement_id, progress)
    VALUES (?, ?, 0)
    ON CONFLICT(user_id, achievement_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `),

  // 업적 보상 관리
  createReward: db.prepare(`
    INSERT INTO achievement_rewards (user_achievement_id, reward_type, reward_amount, is_distributed, distributed_at)
    VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)
  `),

  findRewardByUserAchievement: db.prepare(`
    SELECT * FROM achievement_rewards WHERE user_achievement_id = ?
  `),

  findUserRewards: db.prepare(`
    SELECT ar.*, ua.user_id, a.achievement_id, a.title
    FROM achievement_rewards ar
    JOIN user_achievements ua ON ar.user_achievement_id = ua.id
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
    ORDER BY ar.created_at DESC
  `),

  markDistributed: db.prepare(`
    UPDATE achievement_rewards
    SET is_distributed = TRUE, distributed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 업적 통계
  getUserAchievementStats: db.prepare(`
    SELECT
      COUNT(*) as total_achievements,
      COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_achievements,
      COUNT(CASE WHEN completed_at IS NOT NULL AND reward_claimed = FALSE THEN 1 END) as pending_claims,
      SUM(CASE WHEN reward_claimed = TRUE THEN a.reward_amount ELSE 0 END) as total_claimed_rewards,
      SUM(CASE WHEN completed_at IS NOT NULL AND reward_claimed = FALSE THEN a.reward_amount ELSE 0 END) as pending_rewards
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
  `),

  getAchievementStatsByGame: db.prepare(`
    SELECT
      a.game_type,
      COUNT(*) as total_achievements,
      COUNT(CASE WHEN ua.completed_at IS NOT NULL THEN 1 END) as completed_achievements,
      COUNT(CASE WHEN ua.completed_at IS NULL THEN 1 END) as in_progress,
      SUM(CASE WHEN ua.reward_claimed = TRUE THEN a.reward_amount ELSE 0 END) as total_claimed
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
    GROUP BY a.game_type
  `),

  getTierStats: db.prepare(`
    SELECT
      a.tier,
      COUNT(*) as total,
      COUNT(CASE WHEN ua.completed_at IS NOT NULL THEN 1 END) as completed
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
    GROUP BY a.tier
  `)
};

// 미션 관련 쿼리들
export const missionQueries = {
  // 일일 미션 정의 관리
  create: db.prepare(`
    INSERT INTO daily_missions (mission_id, title, description, icon, category, difficulty, requirement_type, requirement_value, game_type, reward_chips, reward_exp, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  findAll: db.prepare(`
    SELECT * FROM daily_missions WHERE is_active = TRUE ORDER BY display_order ASC, difficulty ASC
  `),

  findByDifficulty: db.prepare(`
    SELECT * FROM daily_missions WHERE is_active = TRUE AND difficulty = ? ORDER BY display_order ASC
  `),

  findById: db.prepare(`
    SELECT * FROM daily_missions WHERE id = ?
  `),

  findByMissionId: db.prepare(`
    SELECT * FROM daily_missions WHERE mission_id = ?
  `),

  // 사용자 일일 미션 관리
  getUserDailyMissions: db.prepare(`
    SELECT udm.*, dm.title, dm.description, dm.icon, dm.category, dm.difficulty,
           dm.requirement_type, dm.requirement_value, dm.game_type, dm.reward_chips, dm.reward_exp
    FROM user_daily_missions udm
    JOIN daily_missions dm ON udm.mission_id = dm.id
    WHERE udm.user_id = ? AND udm.mission_date = ?
    ORDER BY dm.difficulty ASC, dm.display_order ASC
  `),

  getOrCreateUserMission: db.prepare(`
    INSERT INTO user_daily_missions (user_id, mission_id, mission_date, progress)
    VALUES (?, ?, ?, 0)
    ON CONFLICT(user_id, mission_id, mission_date) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `),

  findUserMission: db.prepare(`
    SELECT * FROM user_daily_missions WHERE user_id = ? AND mission_id = ? AND mission_date = ?
  `),

  updateProgress: db.prepare(`
    UPDATE user_daily_missions
    SET progress = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  markCompleted: db.prepare(`
    UPDATE user_daily_missions
    SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  markRewardClaimed: db.prepare(`
    UPDATE user_daily_missions
    SET reward_claimed = TRUE, claimed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  getCompletedMissions: db.prepare(`
    SELECT udm.*, dm.title, dm.reward_chips
    FROM user_daily_missions udm
    JOIN daily_missions dm ON udm.mission_id = dm.id
    WHERE udm.user_id = ? AND udm.completed_at IS NOT NULL AND udm.reward_claimed = FALSE
  `),

  // 챌린지 관리
  createChallenge: db.prepare(`
    INSERT INTO challenges (challenge_id, title, description, icon, challenge_type, category, requirement_type, requirement_value, game_type, reward_chips, reward_exp, bonus_rewards, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  findAllChallenges: db.prepare(`
    SELECT * FROM challenges WHERE is_active = TRUE ORDER BY challenge_type, start_date DESC
  `),

  findActiveChallenges: db.prepare(`
    SELECT * FROM challenges
    WHERE is_active = TRUE AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE AND challenge_type = ?
    ORDER BY start_date DESC
  `),

  findChallengeById: db.prepare(`
    SELECT * FROM challenges WHERE id = ?
  `),

  // 사용자 챌린지 관리
  enrollUser: db.prepare(`
    INSERT INTO user_challenges (user_id, challenge_id, progress)
    VALUES (?, ?, 0)
  `),

  getUserChallenges: db.prepare(`
    SELECT uc.*, c.title, c.description, c.icon, c.challenge_type, c.category,
           c.requirement_type, c.requirement_value, c.game_type, c.reward_chips, c.reward_exp,
           c.start_date, c.end_date
    FROM user_challenges uc
    JOIN challenges c ON uc.challenge_id = c.id
    WHERE uc.user_id = ?
    ORDER BY c.challenge_type, c.end_date ASC
  `),

  findUserChallenge: db.prepare(`
    SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?
  `),

  updateChallengeProgress: db.prepare(`
    UPDATE user_challenges
    SET progress = ?, milestone_reached = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  markChallengeCompleted: db.prepare(`
    UPDATE user_challenges
    SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  markChallengeRewardClaimed: db.prepare(`
    UPDATE user_challenges
    SET reward_claimed = TRUE, claimed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  getCompletedChallenges: db.prepare(`
    SELECT uc.*, c.title, c.reward_chips
    FROM user_challenges uc
    JOIN challenges c ON uc.challenge_id = c.id
    WHERE uc.user_id = ? AND uc.completed_at IS NOT NULL AND uc.reward_claimed = FALSE
  `),

  // 스트릭 관리
  getStreak: db.prepare(`
    SELECT * FROM mission_streaks WHERE user_id = ?
  `),

  createStreak: db.prepare(`
    INSERT INTO mission_streaks (user_id, current_streak, longest_streak, total_completed_days)
    VALUES (?, 1, 1, 1)
  `),

  updateStreak: db.prepare(`
    UPDATE mission_streaks
    SET current_streak = ?,
        longest_streak = CASE WHEN longest_streak < ? THEN ? ELSE longest_streak END,
        last_completion_date = CURRENT_DATE,
        total_completed_days = total_completed_days + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `),

  resetStreak: db.prepare(`
    UPDATE mission_streaks
    SET current_streak = 1,
        last_completion_date = CURRENT_DATE,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `),

  getTopStreaks: db.prepare(`
    SELECT ms.*, u.username, u.full_name
    FROM mission_streaks ms
    JOIN users u ON ms.user_id = u.id
    ORDER BY ms.current_streak DESC, ms.total_completed_days DESC
    LIMIT 100
  `)
};

// 채팅 메시지 테이블 생성
const createChatMessagesTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    original_message TEXT,
    language TEXT DEFAULT 'ko',
    is_system_message BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 채팅 반응 테이블 생성
const createChatReactionsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS chat_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES chat_messages (id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id, emoji)
  )
`);

// 채팅 신고 테이블 생성
const createChatReportsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS chat_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,
    message_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
  )
`);

// 채팅 차단 테이블 생성
const createChatBlockedTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS chat_blocked_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blocker_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
  )
`);

// 예치금 계좌 테이블 생성
const createChipDepositsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS chip_deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    amount INTEGER DEFAULT 0,
    interest_rate REAL DEFAULT 0.01,
    interest_type TEXT DEFAULT 'daily',
    status TEXT DEFAULT 'active',
    last_interest_paid DATETIME,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CHECK (amount >= 0)
  )
`);

// 예치금 이자 지급 내역 테이블 생성
const createDepositInterestHistoryTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS deposit_interest_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deposit_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    interest_amount INTEGER NOT NULL,
    interest_rate REAL NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deposit_id) REFERENCES chip_deposits (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// 예치금 입출금 내역 테이블 생성
const createDepositTransactionsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS deposit_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deposit_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deposit_id) REFERENCES chip_deposits (id) ON DELETE CASCADE,
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
createFriendsTable.run();
createBlockedUsersTable.run();
createUserOnlineStatusTable.run();
createChipGiftsTable.run();
createReferralsTable.run();
createReferralCodesTable.run();
createAchievementsTable.run();
createUserAchievementsTable.run();
createAchievementRewardsTable.run();
createDailyMissionsTable.run();
createUserDailyMissionsTable.run();
createMissionStreaksTable.run();
createChallengesTable.run();
createUserChallengesTable.run();
createChatMessagesTable.run();
createChatReactionsTable.run();
createChatReportsTable.run();
createChatBlockedTable.run();
createChipDepositsTable.run();
createDepositInterestHistoryTable.run();
createDepositTransactionsTable.run();

// 채팅 관련 쿼리들
export const chatQueries = {
  // 메시지 생성
  createMessage: db.prepare(`
    INSERT INTO chat_messages (id, room, user_id, username, message, original_message, language, is_system_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  // 방별 메시지 조회
  findByRoom: db.prepare(`
    SELECT cm.*
    FROM chat_messages cm
    LEFT JOIN users u ON cm.user_id = u.id
    WHERE cm.room = ?
    ORDER BY cm.created_at DESC
    LIMIT ?
  `),

  // 최근 메시지 조회
  findRecent: db.prepare(`
    SELECT cm.*
    FROM chat_messages cm
    LEFT JOIN users u ON cm.user_id = u.id
    WHERE cm.room = ? AND cm.created_at > datetime('now', '-' || ? || ' seconds')
    ORDER BY cm.created_at DESC
  `),

  // 메시지 ID로 조회
  findById: db.prepare(`
    SELECT * FROM chat_messages WHERE id = ?
  `),

  // 사용자별 메시지 조회
  findByUserId: db.prepare(`
    SELECT * FROM chat_messages
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `),

  // 오래된 메시지 삭제 (7일 이상)
  deleteOldMessages: db.prepare(`
    DELETE FROM chat_messages WHERE created_at < datetime('now', '-7 days')
  `),

  // 반응 추가
  addReaction: db.prepare(`
    INSERT INTO chat_reactions (message_id, user_id, emoji)
    VALUES (?, ?, ?)
  `),

  // 반응 제거
  removeReaction: db.prepare(`
    DELETE FROM chat_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?
  `),

  // 메시지별 반응 조회
  findReactionsByMessage: db.prepare(`
    SELECT cr.*, u.username
    FROM chat_reactions cr
    JOIN users u ON cr.user_id = u.id
    WHERE cr.message_id = ?
  `),

  // 사용자의 반응 조회
  findUserReactions: db.prepare(`
    SELECT cr.*, cm.message
    FROM chat_reactions cr
    JOIN chat_messages cm ON cr.message_id = cm.id
    WHERE cr.user_id = ?
    ORDER BY cr.created_at DESC
  `),

  // 신고 생성
  createReport: db.prepare(`
    INSERT INTO chat_reports (reporter_id, reported_user_id, message_id, reason)
    VALUES (?, ?, ?, ?)
  `),

  // 신고 목록 조회
  findReports: db.prepare(`
    SELECT
      cr.*,
      reporter.username as reporter_name,
      reported.username as reported_name,
      cm.message as reported_message
    FROM chat_reports cr
    JOIN users reporter ON cr.reporter_id = reporter.id
    JOIN users reported ON cr.reported_user_id = reported.id
    JOIN chat_messages cm ON cr.message_id = cm.id
    WHERE cr.status = ?
    ORDER BY cr.created_at DESC
    LIMIT ?
  `),

  // 사용자별 신고 조회
  findReportsByUser: db.prepare(`
    SELECT * FROM chat_reports
    WHERE reporter_id = ? OR reported_user_id = ?
    ORDER BY created_at DESC
  `),

  // 신고 업데이트 (상태 변경)
  updateReportStatus: db.prepare(`
    UPDATE chat_reports
    SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 채팅 차단 추가
  blockUser: db.prepare(`
    INSERT INTO chat_blocked_users (blocker_id, blocked_id)
    VALUES (?, ?)
  `),

  // 채팅 차단 해제
  unblockUser: db.prepare(`
    DELETE FROM chat_blocked_users WHERE blocker_id = ? AND blocked_id = ?
  `),

  // 차단 목록 조회
  findBlocked: db.prepare(`
    SELECT
      cbu.*,
      u.username as blocked_name,
      u.full_name as blocked_full_name
    FROM chat_blocked_users cbu
    JOIN users u ON cbu.blocked_id = u.id
    WHERE cbu.blocker_id = ?
    ORDER BY cbu.created_at DESC
  `),

  // 차단 여부 확인
  checkBlocked: db.prepare(`
    SELECT * FROM chat_blocked_users
    WHERE blocker_id = ? AND blocked_id = ?
  `),

  // 방별 메시지 수 카운트
  countMessagesInRoom: db.prepare(`
    SELECT COUNT(*) as count FROM chat_messages WHERE room = ?
  `),

  // 사용자별 메시지 수 카운트
  countMessagesByUser: db.prepare(`
    SELECT COUNT(*) as count FROM chat_messages WHERE user_id = ?
  `)
};

// 예적금 관련 쿼리들
export const depositQueries = {
  // 예치금 계좌 생성
  create: db.prepare(`
    INSERT INTO chip_deposits (user_id, amount, interest_rate, interest_type)
    VALUES (?, ?, ?, ?)
  `),

  // 사용자 예치금 계좌 조회
  findByUserId: db.prepare(`
    SELECT cd.*, u.vip_tier
    FROM chip_deposits cd
    JOIN users u ON cd.user_id = u.id
    WHERE cd.user_id = ?
  `),

  // ID로 예치금 계좌 조회
  findById: db.prepare(`
    SELECT * FROM chip_deposits WHERE id = ?
  `),

  // 활성 예치금 계좌 모두 조회
  findActive: db.prepare(`
    SELECT cd.*, u.vip_tier
    FROM chip_deposits cd
    JOIN users u ON cd.user_id = u.id
    WHERE cd.status = 'active'
  `),

  // 오래된 활동 계좌 조회 (마지막 활동으로부터 N일 이상)
  findInactive: db.prepare(`
    SELECT cd.*, u.vip_tier
    FROM chip_deposits cd
    JOIN users u ON cd.user_id = u.id
    WHERE cd.status = 'active' AND cd.last_activity < datetime('now', '-' || ? || ' days')
  `),

  // 예치금 입금
  deposit: db.prepare(`
    UPDATE chip_deposits
    SET amount = amount + ?,
        last_activity = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  // 예치금 출금
  withdraw: db.prepare(`
    UPDATE chip_deposits
    SET amount = amount - ?,
        last_activity = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND amount >= ?
  `),

  // 이자율 업데이트
  updateInterestRate: db.prepare(`
    UPDATE chip_deposits
    SET interest_rate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 이자 지금 시간 업데이트
  updateInterestPaid: db.prepare(`
    UPDATE chip_deposits
    SET last_interest_paid = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 계좌 상태 변경
  updateStatus: db.prepare(`
    UPDATE chip_deposits
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  // 활동 시간 업데이트
  updateActivity: db.prepare(`
    UPDATE chip_deposits
    SET last_activity = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `),

  // 이자 지급 내역 생성
  createInterestHistory: db.prepare(`
    INSERT INTO deposit_interest_history (deposit_id, user_id, interest_amount, interest_rate, balance_before, balance_after)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  // 이자 지급 내역 조회
  findInterestHistory: db.prepare(`
    SELECT dih.* FROM deposit_interest_history dih
    WHERE dih.user_id = ?
    ORDER BY dih.paid_at DESC
    LIMIT ?
  `),

  // 입출금 내역 생성
  createTransaction: db.prepare(`
    INSERT INTO deposit_transactions (deposit_id, user_id, transaction_type, amount, balance_before, balance_after, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),

  // 입출금 내역 조회
  findTransactions: db.prepare(`
    SELECT dt.* FROM deposit_transactions dt
    WHERE dt.user_id = ?
    ORDER BY dt.created_at DESC
    LIMIT ?
  `),

  // 총 예치금 통계
  getTotalStats: db.prepare(`
    SELECT
      COUNT(*) as total_accounts,
      SUM(amount) as total_deposited,
      AVG(amount) as avg_deposit,
      AVG(interest_rate) as avg_interest_rate
    FROM chip_deposits
    WHERE status = 'active'
  `),

  // VIP 등급별 이자율 설정 조회
  getVipInterestRates: db.prepare(`
    SELECT
      vip_tier,
      AVG(interest_rate) as avg_rate
    FROM chip_deposits cd
    JOIN users u ON cd.user_id = u.id
    WHERE cd.status = 'active'
    GROUP BY vip_tier
  `)
};

// 일일 보상 관련 쿼리들
export const dailyRewardQueries = {
  // 오늘의 보상 생성/조회
  getOrCreateDaily: db.prepare(`
    INSERT INTO daily_rewards (user_id, reward_date, vip_tier_at_claim, reward_amount, expires_at)
    VALUES (?, DATE(CURRENT_TIMESTAMP), ?, ?, datetime('now', '+24 hours'))
    ON CONFLICT(user_id, reward_date) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `),

  // 사용자의 오늘 보상 조회
  getTodayReward: db.prepare(`
    SELECT * FROM daily_rewards
    WHERE user_id = ? AND reward_date = DATE(CURRENT_TIMESTAMP)
  `),

  // 보상 수령 처리
  claimReward: db.prepare(`
    UPDATE daily_rewards
    SET is_claimed = TRUE, claimed_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ? AND is_claimed = FALSE
  `),

  // 미수령 보상 조회
  getUnclaimed: db.prepare(`
    SELECT * FROM daily_rewards
    WHERE user_id = ? AND is_claimed = FALSE AND expires_at > CURRENT_TIMESTAMP
  `),

  // 보상 내역 조회
  getHistory: db.prepare(`
    SELECT * FROM daily_rewards
    WHERE user_id = ?
    ORDER BY reward_date DESC
    LIMIT ?
  `)
};

// 룰렛 뽑기 관련 쿼리들
export const gachaQueries = {
  // 오늘의 뽑기 정보 생성/조회
  getOrCreateTodaySpins: db.prepare(`
    INSERT INTO gacha_spins (user_id, spin_date, vip_tier_at_spin, free_spins_used, paid_spins_used, total_spins)
    VALUES (?, DATE(CURRENT_TIMESTAMP), ?, 0, 0, 0)
    ON CONFLICT(user_id, spin_date) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `),

  // 뽑기 횟수 업데이트
  updateSpinCount: db.prepare(`
    UPDATE gacha_spins
    SET spin_count = spin_count + 1,
        free_spins_used = free_spins_used + ?,
        paid_spins_used = paid_spins_used + ?,
        total_spins = total_spins + 1,
        last_spin_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `),

  // 뽑기 결과 저장
  createResult: db.prepare(`
    INSERT INTO gacha_results (user_id, gacha_spin_id, rarity, reward_amount, is_free_spin, vip_bonus_applied, vip_bonus_multiplier)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),

  // 뽑기 내역 조회
  getUserResults: db.prepare(`
    SELECT gr.*, gs.vip_tier_at_spin
    FROM gacha_results gr
    JOIN gacha_spins gs ON gr.gacha_spin_id = gs.id
    WHERE gr.user_id = ?
    ORDER BY gr.created_at DESC
    LIMIT ?
  `),

  // 오늘의 뽑기 통계
  getTodayStats: db.prepare(`
    SELECT
      free_spins_used,
      paid_spins_used,
      total_spins,
      (SELECT COUNT(*) FROM gacha_results WHERE gacha_spin_id = gs.id) as result_count
    FROM gacha_spins gs
    WHERE gs.user_id = ? AND gs.spin_date = DATE(CURRENT_TIMESTAMP)
  `),

  // 레어도별 통계
  getRarityStats: db.prepare(`
    SELECT
      rarity,
      COUNT(*) as count,
      SUM(reward_amount) as total_rewards
    FROM gacha_results
    WHERE user_id = ?
    GROUP BY rarity
  `)
};

// 룰렛 보상 설정 관련 쿼리들
export const gachaConfigQueries = {
  // 모든 활성화된 보상 설정 조회
  getAllConfigs: db.prepare(`
    SELECT * FROM gacha_reward_configs
    WHERE is_active = TRUE
    ORDER BY base_reward_amount ASC
  `),

  // 특정 레어도 설정 조회
  getConfigByRarity: db.prepare(`
    SELECT * FROM gacha_reward_configs
    WHERE rarity = ? AND is_active = TRUE
  `)
};

// VIP 보너스 설정 관련 쿼리들
export const gachaVipBonusQueries = {
  // 모든 VIP 보너스 설정 조회
  getAllBonuses: db.prepare(`
    SELECT * FROM gacha_vip_bonuses
    WHERE is_active = TRUE
    ORDER BY
      CASE vip_tier
        WHEN 'bronze' THEN 1
        WHEN 'silver' THEN 2
        WHEN 'gold' THEN 3
        WHEN 'platinum' THEN 4
        WHEN 'diamond' THEN 5
      END
  `),

  // 특정 VIP 등급 보너스 조회
  getBonusByTier: db.prepare(`
    SELECT * FROM gacha_vip_bonuses
    WHERE vip_tier = ? AND is_active = TRUE
  `)
};

// 데이터베이스 정리 함수 (만료된 세션 삭제)
export function cleanup() {
  sessionQueries.cleanExpired.run();
  chatQueries.deleteOldMessages.run();
}

// 앱 시작 시 정리 실행
cleanup();

// 주기적으로 정리 (1시간마다)
setInterval(cleanup, 60 * 60 * 1000);

// 예적금 이자 지급 스케줄러 시작 (서버 시작 시)
import { startAllSchedulers } from './depositScheduler.js';
startAllSchedulers();

export default db;