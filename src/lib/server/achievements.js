import db, { achievementQueries, userQueries, gameQueries } from './database.js';

// 업적 정의 (67개 - 전체 게임)
const ACHIEVEMENT_DEFINITIONS = [
	// ===== 블랙잭 (15개) =====
	// 브론즈 (4개)
	{ achievement_id: 'bj_first_win', title: '첫 승리', description: '블랙잭에서 첫 승리를 거두세요', icon: '🎉', category: 'wins', tier: 'bronze', reward_amount: 1000, requirements_type: 'wins', requirements_value: 1, game_type: 'blackjack' },
	{ achievement_id: 'bj_10_games', title: '게임 초보', description: '블랙잭 10게임을 플레이하세요', icon: '🎮', category: 'games', tier: 'bronze', reward_amount: 1000, requirements_type: 'total_games', requirements_value: 10, game_type: 'blackjack' },
	{ achievement_id: 'bj_first_blackjack', title: '블랙잭!', description: '첫 블랙잭을 달성하세요', icon: '🃏', category: 'blackjack', tier: 'bronze', reward_amount: 1000, requirements_type: 'blackjacks', requirements_value: 1, game_type: 'blackjack' },
	{ achievement_id: 'bj_5_win_streak', title: '5연승', description: '블랙잭 5연승을 달성하세요', icon: '🔥', category: 'streak', tier: 'bronze', reward_amount: 1000, requirements_type: 'win_streak', requirements_value: 5, game_type: 'blackjack' },
	// 실버 (4개)
	{ achievement_id: 'bj_50_games', title: '중급 플레이어', description: '블랙잭 50게임을 플레이하세요', icon: '📈', category: 'games', tier: 'silver', reward_amount: 5000, requirements_type: 'total_games', requirements_value: 50, game_type: 'blackjack' },
	{ achievement_id: 'bj_500_chip_win', title: '대승', description: '블랙잭 단일 게임에서 500칩 이상 획득하세요', icon: '💰', category: 'money', tier: 'silver', reward_amount: 5000, requirements_type: 'biggest_win', requirements_value: 500, game_type: 'blackjack' },
	{ achievement_id: 'bj_perfect_pair', title: '퍼펙트 페어', description: '퍼펙트 페어 사이드벳에 승리하세요', icon: '👫', category: 'sidebet', tier: 'silver', reward_amount: 5000, requirements_type: 'perfect_pair_wins', requirements_value: 1, game_type: 'blackjack' },
	{ achievement_id: 'bj_double_down_win', title: '더블다운 승리', description: '더블다운으로 승리하세요', icon: '⏫', category: 'special', tier: 'silver', reward_amount: 5000, requirements_type: 'double_down_wins', requirements_value: 1, game_type: 'blackjack' },
	// 골드 (4개)
	{ achievement_id: 'bj_100_games', title: '베테랑', description: '블랙잭 100게임을 플레이하세요', icon: '🏆', category: 'games', tier: 'gold', reward_amount: 10000, requirements_type: 'total_games', requirements_value: 100, game_type: 'blackjack' },
	{ achievement_id: 'bj_10_win_streak', title: '10연승 마스터', description: '블랙잭 10연승을 달성하세요', icon: '⚡', category: 'streak', tier: 'gold', reward_amount: 10000, requirements_type: 'win_streak', requirements_value: 10, game_type: 'blackjack' },
	{ achievement_id: 'bj_10_blackjacks', title: '블랙잭 마스터', description: '블랙잭 10번 달성하세요', icon: '🎰', category: 'blackjack', tier: 'gold', reward_amount: 10000, requirements_type: 'blackjacks', requirements_value: 10, game_type: 'blackjack' },
	{ achievement_id: 'bj_21_plus_3', title: '21+3 승리', description: '21+3 사이드벳에 승리하세요', icon: '🃏', category: 'sidebet', tier: 'gold', reward_amount: 10000, requirements_type: '21_plus_3_wins', requirements_value: 1, game_type: 'blackjack' },
	// 다이아 (3개)
	{ achievement_id: 'bj_500_games', title: '전설의 플레이어', description: '블랙잭 500게임을 플레이하세요', icon: '👑', category: 'games', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_games', requirements_value: 500, game_type: 'blackjack' },
	{ achievement_id: 'bj_20_win_streak', title: '불가사의한 20연승', description: '블랙잭 20연승을 달성하세요', icon: '🌟', category: 'streak', tier: 'diamond', reward_amount: 50000, requirements_type: 'win_streak', requirements_value: 20, game_type: 'blackjack' },
	{ achievement_id: 'bj_10k_profit', title: '고수익자', description: '블랙잭 총 수익 10,000칩 달성', icon: '💎', category: 'money', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_profit', requirements_value: 10000, game_type: 'blackjack' },

	// ===== 룰렛 (12개) =====
	// 브론즈 (3개)
	{ achievement_id: 'rl_first_win', title: '첫 승리', description: '룰렛에서 첫 승리를 거두세요', icon: '🎰', category: 'wins', tier: 'bronze', reward_amount: 1000, requirements_type: 'wins', requirements_value: 1, game_type: 'roulette' },
	{ achievement_id: 'rl_10_games', title: '룰렛 초보', description: '룰렛 10게임을 플레이하세요', icon: '🎡', category: 'games', tier: 'bronze', reward_amount: 1000, requirements_type: 'total_games', requirements_value: 10, game_type: 'roulette' },
	{ achievement_id: 'rl_straight_up', title: '스트레이트업!', description: '스트레이트업 베팅에 성공하세요', icon: '🎯', category: 'special', tier: 'bronze', reward_amount: 1000, requirements_type: 'straight_up_wins', requirements_value: 1, game_type: 'roulette' },
	// 실버 (3개)
	{ achievement_id: 'rl_50_games', title: '룰렛 중급', description: '룰렛 50게임을 플레이하세요', icon: '📊', category: 'games', tier: 'silver', reward_amount: 5000, requirements_type: 'total_games', requirements_value: 50, game_type: 'roulette' },
	{ achievement_id: 'rl_1000_chip_win', title: '대박 승리', description: '룰렛 단일 게임에서 1000칩 이상 획득하세요', icon: '💰', category: 'money', tier: 'silver', reward_amount: 5000, requirements_type: 'biggest_win', requirements_value: 1000, game_type: 'roulette' },
	{ achievement_id: 'rl_5_color_streak', title: '색상 5연승', description: '같은 색상에 5연속 베팅하여 승리하세요', icon: '🔴', category: 'streak', tier: 'silver', reward_amount: 5000, requirements_type: 'color_streak', requirements_value: 5, game_type: 'roulette' },
	// 골드 (3개)
	{ achievement_id: 'rl_100_games', title: '룰렛 베테랑', description: '룰렛 100게임을 플레이하세요', icon: '🏆', category: 'games', tier: 'gold', reward_amount: 10000, requirements_type: 'total_games', requirements_value: 100, game_type: 'roulette' },
	{ achievement_id: 'rl_5_zeros', title: '제로 헌터', description: '0 또는 00에 5회 맞추세요', icon: '0️⃣', category: 'special', tier: 'gold', reward_amount: 10000, requirements_type: 'zero_wins', requirements_value: 5, game_type: 'roulette' },
	{ achievement_id: 'rl_all_colors', title: '컬러 마스터', description: '모든 색상(빨강, 검정, 초록)에 베팅하여 승리하세요', icon: '🌈', category: 'special', tier: 'gold', reward_amount: 10000, requirements_type: 'all_colors_bet', requirements_value: 1, game_type: 'roulette' },
	// 다이아 (3개)
	{ achievement_id: 'rl_500_games', title: '룰렛 전설', description: '룰렛 500게임을 플레이하세요', icon: '👑', category: 'games', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_games', requirements_value: 500, game_type: 'roulette' },
	{ achievement_id: 'rl_15k_profit', title: '룰렛 고수익자', description: '룰렛 총 수익 15,000칩 달성', icon: '💎', category: 'money', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_profit', requirements_value: 15000, game_type: 'roulette' },
	{ achievement_id: 'rl_jackpot_35x', title: '35x 잭팟', description: '스트레이트업 베팅으로 35배 배당을 받으세요', icon: '🌟', category: 'money', tier: 'diamond', reward_amount: 50000, requirements_type: 'jackpot_wins', requirements_value: 1, game_type: 'roulette' },

	// ===== 바카라 (10개) =====
	// 브론즈 (2개)
	{ achievement_id: 'bc_first_win', title: '첫 승리', description: '바카라에서 첫 승리를 거두세요', icon: '🃏', category: 'wins', tier: 'bronze', reward_amount: 1000, requirements_type: 'wins', requirements_value: 1, game_type: 'baccarat' },
	{ achievement_id: 'bc_10_games', title: '바카라 초보', description: '바카라 10게임을 플레이하세요', icon: '🎴', category: 'games', tier: 'bronze', reward_amount: 1000, requirements_type: 'total_games', requirements_value: 10, game_type: 'baccarat' },
	// 실버 (3개)
	{ achievement_id: 'bc_50_games', title: '바카라 중급', description: '바카라 50게임을 플레이하세요', icon: '📊', category: 'games', tier: 'silver', reward_amount: 5000, requirements_type: 'total_games', requirements_value: 50, game_type: 'baccarat' },
	{ achievement_id: 'bc_banker_5_streak', title: '뱅커 5연승', description: '뱅커에 5연속 베팅하여 승리하세요', icon: '🏦', category: 'streak', tier: 'silver', reward_amount: 5000, requirements_type: 'banker_streak', requirements_value: 5, game_type: 'baccarat' },
	{ achievement_id: 'bc_tie_win', title: '타이 승리', description: '타이 베팅에 승리하세요', icon: '🤝', category: 'special', tier: 'silver', reward_amount: 5000, requirements_type: 'tie_wins', requirements_value: 1, game_type: 'baccarat' },
	// 골드 (3개)
	{ achievement_id: 'bc_100_games', title: '바카라 베테랑', description: '바카라 100게임을 플레이하세요', icon: '🏆', category: 'games', tier: 'gold', reward_amount: 10000, requirements_type: 'total_games', requirements_value: 100, game_type: 'baccarat' },
	{ achievement_id: 'bc_natural_win', title: '내추럴 승리', description: '내추럴 8 또는 9로 승리하세요', icon: '✨', category: 'special', tier: 'gold', reward_amount: 10000, requirements_type: 'natural_wins', requirements_value: 1, game_type: 'baccarat' },
	{ achievement_id: 'bc_10_loss_free', title: '무패 10연승', description: '10게임 연속 무패 기록을 세우세요', icon: '🛡️', category: 'streak', tier: 'gold', reward_amount: 10000, requirements_type: 'loss_free_streak', requirements_value: 10, game_type: 'baccarat' },
	// 다이아 (2개)
	{ achievement_id: 'bc_500_games', title: '바카라 전설', description: '바카라 500게임을 플레이하세요', icon: '👑', category: 'games', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_games', requirements_value: 500, game_type: 'baccarat' },
	{ achievement_id: 'bc_20k_profit', title: '바카라 고수익자', description: '바카라 총 수익 20,000칩 달성', icon: '💎', category: 'money', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_profit', requirements_value: 20000, game_type: 'baccarat' },

	// ===== 포커 (10개) =====
	// 브론즈 (2개)
	{ achievement_id: 'pk_first_win', title: '첫 승리', description: '포커에서 첫 승리를 거두세요', icon: '🃏', category: 'wins', tier: 'bronze', reward_amount: 1000, requirements_type: 'wins', requirements_value: 1, game_type: 'poker' },
	{ achievement_id: 'pk_10_games', title: '포커 초보', description: '포커 10게임을 플레이하세요', icon: '🎴', category: 'games', tier: 'bronze', reward_amount: 1000, requirements_type: 'total_games', requirements_value: 10, game_type: 'poker' },
	// 실버 (3개)
	{ achievement_id: 'pk_50_games', title: '포커 중급', description: '포커 50게임을 플레이하세요', icon: '📊', category: 'games', tier: 'silver', reward_amount: 5000, requirements_type: 'total_games', requirements_value: 50, game_type: 'poker' },
	{ achievement_id: 'pk_royal_flush', title: '로얄 플러시', description: '로얄 플러시를 달성하세요', icon: '👑', category: 'hand', tier: 'silver', reward_amount: 5000, requirements_type: 'royal_flush', requirements_value: 1, game_type: 'poker' },
	{ achievement_id: 'pk_full_house', title: '풀 하우스', description: '풀 하우스를 달성하세요', icon: '🏠', category: 'hand', tier: 'silver', reward_amount: 5000, requirements_type: 'full_house', requirements_value: 1, game_type: 'poker' },
	// 골드 (3개)
	{ achievement_id: 'pk_100_games', title: '포커 베테랑', description: '포커 100게임을 플레이하세요', icon: '🏆', category: 'games', tier: 'gold', reward_amount: 10000, requirements_type: 'total_games', requirements_value: 100, game_type: 'poker' },
	{ achievement_id: 'pk_four_of_kind', title: '포 카드', description: '포 카드(Four of a Kind)를 달성하세요', icon: '4️⃣', category: 'hand', tier: 'gold', reward_amount: 10000, requirements_type: 'four_of_kind', requirements_value: 1, game_type: 'poker' },
	{ achievement_id: 'pk_straight_flush', title: '스트레이트 플러시', description: '스트레이트 플러시를 달성하세요', icon: '🌟', category: 'hand', tier: 'gold', reward_amount: 10000, requirements_type: 'straight_flush', requirements_value: 1, game_type: 'poker' },
	// 다이아 (2개)
	{ achievement_id: 'pk_500_games', title: '포커 전설', description: '포커 500게임을 플레이하세요', icon: '👑', category: 'games', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_games', requirements_value: 500, game_type: 'poker' },
	{ achievement_id: 'pk_25k_profit', title: '포커 고수익자', description: '포커 총 수익 25,000칩 달성', icon: '💎', category: 'money', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_profit', requirements_value: 25000, game_type: 'poker' },

	// ===== 슬롯 (10개) =====
	// 브론즈 (2개)
	{ achievement_id: 'sl_first_spin', title: '첫 스핀', description: '슬롯 머신에서 첫 스핀을 돌리세요', icon: '🎰', category: 'games', tier: 'bronze', reward_amount: 1000, requirements_type: 'total_spins', requirements_value: 1, game_type: 'slots' },
	{ achievement_id: 'sl_50_spins', title: '스핀 초보', description: '슬롯 50스핀을 돌리세요', icon: '🎡', category: 'games', tier: 'bronze', reward_amount: 1000, requirements_type: 'total_spins', requirements_value: 50, game_type: 'slots' },
	// 실버 (3개)
	{ achievement_id: 'sl_200_spins', title: '스핀 중급', description: '슬롯 200스핀을 돌리세요', icon: '📊', category: 'games', tier: 'silver', reward_amount: 5000, requirements_type: 'total_spins', requirements_value: 200, game_type: 'slots' },
	{ achievement_id: 'sl_500_chip_win', title: '슬롯 대승', description: '슬롯 단일 게임에서 500칩 이상 획득하세요', icon: '💰', category: 'money', tier: 'silver', reward_amount: 5000, requirements_type: 'biggest_win', requirements_value: 500, game_type: 'slots' },
	{ achievement_id: 'sl_bonus_round', title: '보너스 라운드', description: '보너스 라운드를 트리거하세요', icon: '🎁', category: 'special', tier: 'silver', reward_amount: 5000, requirements_type: 'bonus_rounds', requirements_value: 1, game_type: 'slots' },
	// 골드 (3개)
	{ achievement_id: 'sl_500_spins', title: '스핀 베테랑', description: '슬롯 500스핀을 돌리세요', icon: '🏆', category: 'games', tier: 'gold', reward_amount: 10000, requirements_type: 'total_spins', requirements_value: 500, game_type: 'slots' },
	{ achievement_id: 'sl_jackpot', title: '잭팟!', description: '잭팟을 히트하세요', icon: '🌟', category: 'special', tier: 'gold', reward_amount: 10000, requirements_type: 'jackpots', requirements_value: 1, game_type: 'slots' },
	{ achievement_id: 'sl_777_x5', title: '777 마스터', description: '777 심볼 5개를 맞추세요', icon: '7️⃣', category: 'special', tier: 'gold', reward_amount: 10000, requirements_type: 'triple_seven', requirements_value: 5, game_type: 'slots' },
	// 다이아 (2개)
	{ achievement_id: 'sl_1000_spins', title: '스핀 전설', description: '슬롯 1000스핀을 돌리세요', icon: '👑', category: 'games', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_spins', requirements_value: 1000, game_type: 'slots' },
	{ achievement_id: 'sl_5k_chip_win', title: '슬롯 잭팟', description: '슬롯 단일 게임에서 5000칩 이상 획득하세요', icon: '💎', category: 'money', tier: 'diamond', reward_amount: 50000, requirements_type: 'biggest_win', requirements_value: 5000, game_type: 'slots' },

	// ===== 다이사이 (10개) =====
	// 브론즈 (2개)
	{ achievement_id: 'sb_first_win', title: '첫 승리', description: '다이사이에서 첫 승리를 거두세요', icon: '🎲', category: 'wins', tier: 'bronze', reward_amount: 1000, requirements_type: 'wins', requirements_value: 1, game_type: 'sicbo' },
	{ achievement_id: 'sb_10_games', title: '다이사이 초보', description: '다이사이 10게임을 플레이하세요', icon: '🎯', category: 'games', tier: 'bronze', reward_amount: 1000, requirements_type: 'total_games', requirements_value: 10, game_type: 'sicbo' },
	// 실버 (3개)
	{ achievement_id: 'sb_50_games', title: '다이사이 중급', description: '다이사이 50게임을 플레이하세요', icon: '📊', category: 'games', tier: 'silver', reward_amount: 5000, requirements_type: 'total_games', requirements_value: 50, game_type: 'sicbo' },
	{ achievement_id: 'sb_triple_dice', title: '트리플 다이스', description: '트리플(세 주사위 같은 숫자)가 나오게 하세요', icon: '3️⃣', category: 'special', tier: 'silver', reward_amount: 5000, requirements_type: 'triple_hits', requirements_value: 1, game_type: 'sicbo' },
	{ achievement_id: 'sb_big_5_streak', title: '빅 5연승', description: '빅 베팅에 5연속 승리하세요', icon: '⬆️', category: 'streak', tier: 'silver', reward_amount: 5000, requirements_type: 'big_streak', requirements_value: 5, game_type: 'sicbo' },
	// 골드 (3개)
	{ achievement_id: 'sb_100_games', title: '다이사이 베테랑', description: '다이사이 100게임을 플레이하세요', icon: '🏆', category: 'games', tier: 'gold', reward_amount: 10000, requirements_type: 'total_games', requirements_value: 100, game_type: 'sicbo' },
	{ achievement_id: 'sb_all_triples', title: '트리플 마스터', description: '모든 종류의 트리플을 달성하세요', icon: '🎲', category: 'special', tier: 'gold', reward_amount: 10000, requirements_type: 'all_triples', requirements_value: 1, game_type: 'sicbo' },
	{ achievement_id: 'sb_10_perfect', title: '완벽 예측 10회', description: '정확히 10번 예측에 성공하세요', icon: '🎯', category: 'special', tier: 'gold', reward_amount: 10000, requirements_type: 'exact_predictions', requirements_value: 10, game_type: 'sicbo' },
	// 다이아 (2개)
	{ achievement_id: 'sb_500_games', title: '다이사이 전설', description: '다이사이 500게임을 플레이하세요', icon: '👑', category: 'games', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_games', requirements_value: 500, game_type: 'sicbo' },
	{ achievement_id: 'sb_20k_profit', title: '다이사이 고수익자', description: '다이사이 총 수익 20,000칩 달성', icon: '💎', category: 'money', tier: 'diamond', reward_amount: 50000, requirements_type: 'total_profit', requirements_value: 20000, game_type: 'sicbo' }
];

/**
 * 업적 초기화 함수 - 데이터베이스에 업적 정의 삽입
 */
export function initializeAchievements() {
	const insertMany = db.transaction((achievements) => {
		for (const achievement of achievements) {
			try {
				achievementQueries.create.run(
					achievement.achievement_id,
					achievement.title,
					achievement.description,
					achievement.icon,
					achievement.category,
					achievement.tier,
					achievement.reward_amount,
					achievement.requirements_type,
					achievement.requirements_value,
					achievement.game_type
				);
			} catch (error) {
				// 중복된 achievement_id는 무시
				if (!error.message.includes('UNIQUE')) {
					console.error('Error inserting achievement:', error);
				}
			}
		}
	});

	insertMany(ACHIEVEMENT_DEFINITIONS);
	console.log(`Achievements initialized: ${ACHIEVEMENT_DEFINITIONS.length} achievements`);
}

/**
 * 게임 결과에서 업적 통계 추출
 */
export function extractGameStats(gameType, gameResult) {
	const stats = {
		total_games: 0,
		wins: 0,
		total_spins: 0,
		biggest_win: 0,
		total_profit: 0,
		win_streak: 0,
		// 게임별 통계
		blackjacks: 0,
		double_down_wins: 0,
		perfect_pair_wins: 0,
		'21_plus_3_wins': 0,
		straight_up_wins: 0,
		color_streak: 0,
		all_colors_bet: 0,
		zero_wins: 0,
		jackpot_wins: 0,
		banker_streak: 0,
		tie_wins: 0,
		natural_wins: 0,
		loss_free_streak: 0,
		royal_flush: 0,
		full_house: 0,
		four_of_kind: 0,
		straight_flush: 0,
		triple_hits: 0,
		big_streak: 0,
		all_triples: 0,
		exact_predictions: 0,
		bonus_rounds: 0,
		jackpots: 0,
		triple_seven: 0
	};

	// game_history 기반 기본 통계
	const gameHistory = gameQueries.findByUserId.all(gameResult.user_id);
	const gameTypeHistory = gameHistory.filter((g) => g.game_type === gameType);

	stats.total_games = gameTypeHistory.length;
	stats.wins = gameTypeHistory.filter((g) => g.result === 'win').length;
	stats.total_profit = gameTypeHistory.reduce((sum, g) => sum + (g.win_amount - g.bet_amount), 0);
	stats.biggest_win = Math.max(...gameTypeHistory.map((g) => g.win_amount), 0);

	// 슬롯의 경우
	if (gameType === 'slots') {
		stats.total_spins = stats.total_games;
	}

	// 게임별 세부 통계 (gameResult에서 전달된 추가 데이터)
	if (gameResult.details) {
		const details = gameResult.details;

		// 블랙잭
		if (gameType === 'blackjack') {
			if (details.blackjack) stats.blackjacks++;
			if (details.doubleDown && details.result === 'win') stats.double_down_wins++;
			if (details.perfectPair) stats.perfect_pair_wins++;
			if (details.twentyOnePlusThree) stats['21_plus_3_wins']++;
		}

		// 룰렛
		if (gameType === 'roulette') {
			if (details.betType === 'straight' && details.result === 'win') stats.straight_up_wins++;
			if (details.zero) stats.zero_wins++;
			if (details.colorStreak) stats.color_streak = Math.max(stats.color_streak, details.colorStreak);
			if (details.allColors) stats.all_colors_bet = 1;
			if (details.multiplier >= 35) stats.jackpot_wins++;
		}

		// 바카라
		if (gameType === 'baccarat') {
			if (details.betOn === 'banker' && details.result === 'win') stats.banker_streak++;
			if (details.betOn === 'tie' && details.result === 'win') stats.tie_wins++;
			if (details.natural) stats.natural_wins++;
		}

		// 포커
		if (gameType === 'poker') {
			if (details.hand === 'royal_flush') stats.royal_flush = 1;
			if (details.hand === 'full_house') stats.full_house = 1;
			if (details.hand === 'four_of_kind') stats.four_of_kind = 1;
			if (details.hand === 'straight_flush') stats.straight_flush = 1;
		}

		// 슬롯
		if (gameType === 'slots') {
			if (details.bonus) stats.bonus_rounds++;
			if (details.jackpot) stats.jackpots++;
			if (details.tripleSeven) stats.triple_seven++;
		}

		// 다이사이
		if (gameType === 'sicbo') {
			if (details.triple) stats.triple_hits++;
			if (details.betOn === 'big' && details.result === 'win') stats.big_streak++;
			if (details.allTriples) stats.all_triples = 1;
			if (details.exact) stats.exact_predictions++;
		}
	}

	return stats;
}

/**
 * 업적 진행률 계산 및 업데이트
 */
export function updateAchievementProgress(userId, gameType, gameResult) {
	// 사용자의 게임 통계 추출
	const stats = extractGameStats(gameType, gameResult);

	// 해당 게임 타입의 모든 업적 조회
	const achievements = achievementQueries.findByGameType.all(gameType);
	const newlyCompleted = [];

	for (const achievement of achievements) {
		// 사용자 업적 레코드 가져오기 또는 생성
		let userAchievement = achievementQueries.findUserAchievement.get(userId, achievement.id);

		if (!userAchievement) {
			achievementQueries.createUserAchievement.run(userId, achievement.id);
			userAchievement = achievementQueries.findUserAchievement.get(userId, achievement.id);
		}

		// 이미 완료된 업적은 건너뜀
		if (userAchievement.completed_at) continue;

		// 현재 진행률 계산
		const requirementType = achievement.requirements_type;
		const requirementValue = achievement.requirements_value;
		const currentProgress = stats[requirementType] || 0;

		// 진행률 업데이트
		const newProgress = Math.min(currentProgress, requirementValue);
		achievementQueries.updateProgress.run(userAchievement.id, newProgress);

		// 완료 체크
		if (currentProgress >= requirementValue) {
			achievementQueries.markCompleted.run(userAchievement.id);
			newlyCompleted.push({
				...achievement,
				userAchievementId: userAchievement.id,
				completedAt: new Date().toISOString()
			});
		}
	}

	return newlyCompleted;
}

/**
 * 업적 보상 청구
 */
export function claimAchievementReward(userId, userAchievementId) {
	// 사용자 업적 조회
	const userAchievement = achievementQueries.findUserAchievement.get(userId, userAchievementId);

	if (!userAchievement) {
		throw new Error('Achievement not found');
	}

	if (!userAchievement.completed_at) {
		throw new Error('Achievement not completed');
	}

	if (userAchievement.reward_claimed) {
		throw new Error('Reward already claimed');
	}

	// 트랜잭션으로 보상 지급 처리
	const transaction = db.transaction(() => {
		// 사용자 잔액 업데이트
		const user = userQueries.findById.get(userId);
		const newBalance = user.balance + userAchievement.reward_amount;
		userQueries.updateBalance.run(newBalance, userId);

		// 업적 보상 청구 마크
		achievementQueries.markRewardClaimed.run(userAchievementId, userId);

		// 보상 지급 기록
		achievementQueries.createReward.run(userAchievementId, 'chips', userAchievement.reward_amount);

		return {
			success: true,
			rewardAmount: userAchievement.reward_amount,
			newBalance
		};
	});

	return transaction();
}

/**
 * 사용자 업적 통계 조회
 */
export function getUserAchievementStats(userId) {
	const generalStats = achievementQueries.getUserAchievementStats.get(userId);
	const gameStats = achievementQueries.getAchievementStatsByGame.all(userId);
	const tierStats = achievementQueries.getTierStats.all(userId);

	return {
		general: generalStats,
		byGame: gameStats,
		byTier: tierStats
	};
}

/**
 * 모든 업적 목록 조회
 */
export function getAllAchievements(filters = {}) {
	let achievements = achievementQueries.findAll.all();

	if (filters.gameType) {
		achievements = achievements.filter((a) => a.game_type === filters.gameType);
	}

	if (filters.category) {
		achievements = achievements.filter((a) => a.category === filters.category);
	}

	if (filters.tier) {
		achievements = achievements.filter((a) => a.tier === filters.tier);
	}

	return achievements;
}

/**
 * 사용자 업적 진행률 조회
 */
export function getUserAchievements(userId, filters = {}) {
	let achievements;

	if (filters.gameType) {
		achievements = achievementQueries.findUserAchievementsByGame.all(userId, filters.gameType);
	} else if (filters.completed === true) {
		achievements = achievementQueries.findCompletedAchievements.all(userId);
	} else if (filters.completed === false) {
		achievements = achievementQueries.findInProgressAchievements.all(userId);
	} else {
		achievements = achievementQueries.findUserAchievements.all(userId);
	}

	return achievements;
}

// 업적 초기화 실행 (한 번만)
if (!db.prepare('SELECT COUNT(*) as count FROM achievements').get().count) {
	initializeAchievements();
}
