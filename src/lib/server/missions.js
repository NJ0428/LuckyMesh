import db, { missionQueries, userQueries, gameQueries } from './database.js';

// 일일 미션 템플릿 정의
const DAILY_MISSION_TEMPLATES = [
	// 쉬움 (Easy)
	{
		mission_id: 'play_5_games',
		title: '게임 초보',
		description: '5게임 플레이',
		difficulty: 'easy',
		requirement_type: 'games_played',
		requirement_value: 5,
		game_type: 'all',
		reward_chips: 1000,
		category: 'games',
		icon: '🎮'
	},
	{
		mission_id: 'bet_50k',
		title: '작은 베팅',
		description: '총 50,000칩 베팅',
		difficulty: 'easy',
		requirement_type: 'total_bet',
		requirement_value: 50000,
		game_type: 'all',
		reward_chips: 1000,
		category: 'betting',
		icon: '💰'
	},
	{
		mission_id: 'win_3_games',
		title: '첫 승리',
		description: '3게임 승리',
		difficulty: 'easy',
		requirement_type: 'wins',
		requirement_value: 3,
		game_type: 'all',
		reward_chips: 1500,
		category: 'winning',
		icon: '🏆'
	},
	{
		mission_id: 'play_5_blackjack',
		title: '블랙잭 입문',
		description: '블랙잭 5게임 플레이',
		difficulty: 'easy',
		requirement_type: 'games_played',
		requirement_value: 5,
		game_type: 'blackjack',
		reward_chips: 1200,
		category: 'games',
		icon: '♠️'
	},
	{
		mission_id: 'play_5_slots',
		title: '슬롯 입문',
		description: '슬롯 5번 스핀',
		difficulty: 'easy',
		requirement_type: 'games_played',
		requirement_value: 5,
		game_type: 'slots',
		reward_chips: 1200,
		category: 'games',
		icon: '🎰'
	},
	{
		mission_id: 'play_5_roulette',
		title: '룰렛 입문',
		description: '룰렛 5게임 플레이',
		difficulty: 'easy',
		requirement_type: 'games_played',
		requirement_value: 5,
		game_type: 'roulette',
		reward_chips: 1200,
		category: 'games',
		icon: '🎡'
	},
	// 보통 (Medium)
	{
		mission_id: 'play_10_blackjack',
		title: '블랙잭 마스터',
		description: '블랙잭 10게임 플레이',
		difficulty: 'medium',
		requirement_type: 'games_played',
		requirement_value: 10,
		game_type: 'blackjack',
		reward_chips: 3000,
		category: 'games',
		icon: '♠️'
	},
	{
		mission_id: 'bet_100k',
		title: '중간 베팅',
		description: '총 100,000칩 베팅',
		difficulty: 'medium',
		requirement_type: 'total_bet',
		requirement_value: 100000,
		game_type: 'all',
		reward_chips: 2500,
		category: 'betting',
		icon: '💵'
	},
	{
		mission_id: 'profit_50k',
		title: '수익 달성',
		description: '50,000칩 이익',
		difficulty: 'medium',
		requirement_type: 'profit',
		requirement_value: 50000,
		game_type: 'all',
		reward_chips: 4000,
		category: 'winning',
		icon: '📈'
	},
	{
		mission_id: 'win_5_in_row',
		title: '연승',
		description: '5연승 달성',
		difficulty: 'medium',
		requirement_type: 'win_streak',
		requirement_value: 5,
		game_type: 'all',
		reward_chips: 5000,
		category: 'special',
		icon: '🔥'
	},
	{
		mission_id: 'play_10_roulette',
		title: '룰렛 중급',
		description: '룰렛 10게임 플레이',
		difficulty: 'medium',
		requirement_type: 'games_played',
		requirement_value: 10,
		game_type: 'roulette',
		reward_chips: 3000,
		category: 'games',
		icon: '🎡'
	},
	{
		mission_id: 'play_10_baccarat',
		title: '바카라 중급',
		description: '바카라 10게임 플레이',
		difficulty: 'medium',
		requirement_type: 'games_played',
		requirement_value: 10,
		game_type: 'baccarat',
		reward_chips: 3000,
		category: 'games',
		icon: '🃏'
	},
	// 어려움 (Hard)
	{
		mission_id: 'play_20_games',
		title: '게임 광',
		description: '20게임 플레이',
		difficulty: 'hard',
		requirement_type: 'games_played',
		requirement_value: 20,
		game_type: 'all',
		reward_chips: 5000,
		category: 'games',
		icon: '🎰'
	},
	{
		mission_id: 'bet_500k',
		title: '하이 롤러',
		description: '총 500,000칩 베팅',
		difficulty: 'hard',
		requirement_type: 'total_bet',
		requirement_value: 500000,
		game_type: 'all',
		reward_chips: 7000,
		category: 'betting',
		icon: '💎'
	},
	{
		mission_id: 'profit_200k',
		title: '대박',
		description: '200,000칩 이익',
		difficulty: 'hard',
		requirement_type: 'profit',
		requirement_value: 200000,
		game_type: 'all',
		reward_chips: 10000,
		category: 'winning',
		icon: '🚀'
	},
	{
		mission_id: 'get_blackjack',
		title: '블랙잭!',
		description: '블랙잭 달성',
		difficulty: 'hard',
		requirement_type: 'blackjack',
		requirement_value: 1,
		game_type: 'blackjack',
		reward_chips: 8000,
		category: 'special',
		icon: '21'
	},
	{
		mission_id: 'win_10_in_row',
		title: '대연승',
		description: '10연승 달성',
		difficulty: 'hard',
		requirement_type: 'win_streak',
		requirement_value: 10,
		game_type: 'all',
		reward_chips: 10000,
		category: 'special',
		icon: '⚡'
	}
];

// 스트릭 보너스 등급표
const STREAK_BONUS_TIERS = [
	{ days: 1, bonusPercent: 0, bonusChips: 0, label: '첫 번째 날' },
	{ days: 2, bonusPercent: 10, bonusChips: 100, label: '2일 연속' },
	{ days: 3, bonusPercent: 20, bonusChips: 250, label: '3일 연속' },
	{ days: 7, bonusPercent: 50, bonusChips: 1000, label: '일주일 완주!' },
	{ days: 14, bonusPercent: 100, bonusChips: 2500, label: '2주 달성!' },
	{ days: 30, bonusPercent: 200, bonusChips: 10000, label: '한 달 완주!' },
	{ days: 100, bonusPercent: 500, bonusChips: 50000, label: '100일 달성!' }
];

// 챌린지 템플릿 (주간/월간)
const CHALLENGE_TEMPLATES = [
	// 주간 챌린지
	{
		challenge_id: 'weekly_50_wins',
		title: '주간 승리자',
		description: '이번 주에 50게임 승리',
		icon: '🏆',
		challenge_type: 'weekly',
		category: 'winning',
		requirement_type: 'wins',
		requirement_value: 50,
		game_type: 'all',
		reward_chips: 15000,
		reward_exp: 500,
		bonus_rewards: null
	},
	{
		challenge_id: 'weekly_blackjack_pro',
		title: '블랙잭 프로',
		description: '이번 주에 블랙잭 30게임 승리',
		icon: '♠️',
		challenge_type: 'weekly',
		category: 'winning',
		requirement_type: 'wins',
		requirement_value: 30,
		game_type: 'blackjack',
		reward_chips: 12000,
		reward_exp: 400,
		bonus_rewards: null
	},
	{
		challenge_id: 'weekly_high_roller',
		title: '하이 롤러',
		description: '이번 주에 총 1,000,000칩 베팅',
		icon: '💎',
		challenge_type: 'weekly',
		category: 'betting',
		requirement_type: 'total_bet',
		requirement_value: 1000000,
		game_type: 'all',
		reward_chips: 20000,
		reward_exp: 1000,
		bonus_rewards: null
	},
	{
		challenge_id: 'weekly_profit_100k',
		title: '주간 수익 왕',
		description: '이번 주에 100,000칩 순이익',
		icon: '📈',
		challenge_type: 'weekly',
		category: 'winning',
		requirement_type: 'profit',
		requirement_value: 100000,
		game_type: 'all',
		reward_chips: 25000,
		reward_exp: 800,
		bonus_rewards: null
	},
	// 월간 챌린지
	{
		challenge_id: 'monthly_200_wins',
		title: '월간 승리자',
		description: '이번 달에 200게임 승리',
		icon: '👑',
		challenge_type: 'monthly',
		category: 'winning',
		requirement_type: 'wins',
		requirement_value: 200,
		game_type: 'all',
		reward_chips: 50000,
		reward_exp: 2000,
		bonus_rewards: JSON.stringify({ vip_points: 100 })
	},
	{
		challenge_id: 'monthly_5_blackjacks',
		title: '블랙잭 마스터',
		description: '이번 달에 블랙잭 10번 달성',
		icon: '🃏',
		challenge_type: 'monthly',
		category: 'special',
		requirement_type: 'blackjack',
		requirement_value: 10,
		game_type: 'blackjack',
		reward_chips: 40000,
		reward_exp: 1500,
		bonus_rewards: JSON.stringify({ vip_points: 80 })
	},
	{
		challenge_id: 'monthly_5m_wagered',
		title: 'VIP 하이 롤러',
		description: '이번 달에 총 5,000,000칩 베팅',
		icon: '💰',
		challenge_type: 'monthly',
		category: 'betting',
		requirement_type: 'total_bet',
		requirement_value: 5000000,
		game_type: 'all',
		reward_chips: 75000,
		reward_exp: 3000,
		bonus_rewards: JSON.stringify({ vip_points: 200, vip_tier_upgrade: 1 })
	},
	{
		challenge_id: 'monthly_profit_500k',
		title: '월간 대박',
		description: '이번 달에 500,000칩 순이익',
		icon: '🚀',
		challenge_type: 'monthly',
		category: 'winning',
		requirement_type: 'profit',
		requirement_value: 500000,
		game_type: 'all',
		reward_chips: 100000,
		reward_exp: 4000,
		bonus_rewards: JSON.stringify({ vip_points: 150 })
	}
];

/**
 * 미션 초기화 함수 - 데이터베이스에 미션 정의 삽입
 */
export function initializeMissions() {
	const insertMany = db.transaction((missions) => {
		for (const mission of missions) {
			try {
				missionQueries.create.run(
					mission.mission_id,
					mission.title,
					mission.description,
					mission.icon,
					mission.category,
					mission.difficulty,
					mission.requirement_type,
					mission.requirement_value,
					mission.game_type,
					mission.reward_chips,
					mission.reward_exp || 0,
					mission.display_order || 0
				);
			} catch (error) {
				if (!error.message.includes('UNIQUE')) {
					console.error('Error inserting mission:', error);
				}
			}
		}
	});

	insertMany(DAILY_MISSION_TEMPLATES);
	console.log(`Daily missions initialized: ${DAILY_MISSION_TEMPLATES.length} missions`);
}

/**
 * 챌린지 초기화 함수
 */
export function initializeChallenges() {
	const insertMany = db.transaction((challenges) => {
		for (const challenge of challenges) {
			try {
				missionQueries.createChallenge.run(
					challenge.challenge_id,
					challenge.title,
					challenge.description,
					challenge.icon,
					challenge.challenge_type,
					challenge.category,
					challenge.requirement_type,
					challenge.requirement_value,
					challenge.game_type,
					challenge.reward_chips,
					challenge.reward_exp || 0,
					challenge.bonus_rewards || null,
					getChallengeStartDate(challenge.challenge_type),
					getChallengeEndDate(challenge.challenge_type)
				);
			} catch (error) {
				if (!error.message.includes('UNIQUE')) {
					console.error('Error inserting challenge:', error);
				}
			}
		}
	});

	insertMany(CHALLENGE_TEMPLATES);
	console.log(`Challenges initialized: ${CHALLENGE_TEMPLATES.length} challenges`);
}

/**
 * 챌린지 시작일 계산
 */
function getChallengeStartDate(challengeType) {
	const now = new Date();
	if (challengeType === 'weekly') {
		// 이번 주 월요일
		const day = now.getDay();
		const diff = now.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(now.setDate(diff)).toISOString().split('T')[0];
	} else {
		// 이번 달 1일
		return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
	}
}

/**
 * 챌린지 종료일 계산
 */
function getChallengeEndDate(challengeType) {
	const now = new Date();
	if (challengeType === 'weekly') {
		// 이번 주 일요일
		const day = now.getDay();
		const diff = now.getDate() - day + (day === 0 ? 0 : 7);
		return new Date(now.setDate(diff)).toISOString().split('T')[0];
	} else {
		// 이번 달 말일
		return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
	}
}

/**
 * 오늘의 일일 미션 생성 (매일 6개: 쉬움 3, 보통 2, 어려움 1)
 */
export function generateDailyMissions(date = new Date()) {
	// 날짜 포맷팅
	const dateStr = date.toISOString().split('T')[0];

	// 이미 생성된 미션이 있는지 확인 (선택사항)
	// 여기서는 매번 같은 미션을 반환하도록 구현

	// 난수 생성기 (시드 기반)
	const seed = parseInt(dateStr.replace(/-/g, ''));
	const random = seededRandom(seed);

	// 쉬움 3개, 보통 2개, 어려움 1개 선택
	const easyMissions = shuffleArray(
		DAILY_MISSION_TEMPLATES.filter((m) => m.difficulty === 'easy'),
		random
	).slice(0, 3);
	const mediumMissions = shuffleArray(
		DAILY_MISSION_TEMPLATES.filter((m) => m.difficulty === 'medium'),
		random
	).slice(0, 2);
	const hardMissions = shuffleArray(
		DAILY_MISSION_TEMPLATES.filter((m) => m.difficulty === 'hard'),
		random
	).slice(0, 1);

	return [...easyMissions, ...mediumMissions, ...hardMissions];
}

/**
 * 시드 기반 난수 생성기
 */
function seededRandom(seed) {
	return function () {
		seed = (seed * 9301 + 49297) % 233280;
		return seed / 233280;
	};
}

/**
 * 배열 셔플 (시드 기반)
 */
function shuffleArray(array, randomFunc) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(randomFunc() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

/**
 * 사용자의 오늘 미션 가져오기
 */
export function getUserDailyMissions(userId, date = new Date()) {
	const dateStr = date.toISOString().split('T')[0];
	const dailyMissions = generateDailyMissions(date);
	const result = [];

	for (const mission of dailyMissions) {
		const missionDef = missionQueries.findByMissionId.get(mission.mission_id);
		if (missionDef) {
			let userMission = missionQueries.findUserMission.get(userId, missionDef.id, dateStr);

			// 없으면 생성
			if (!userMission) {
				missionQueries.getOrCreateUserMission.run(userId, missionDef.id, dateStr);
				userMission = missionQueries.findUserMission.get(userId, missionDef.id, dateStr);
			}

			result.push({
				...mission,
				id: userMission.id,
				progress: userMission.progress,
				requirement_value: mission.requirement_value,
				completed_at: userMission.completed_at,
				reward_claimed: userMission.reward_claimed
			});
		}
	}

	return result;
}

/**
 * 게임 결과로 미션 진행 업데이트
 */
export function updateMissionProgress(userId, gameType, gameResult) {
	const date = new Date();
	const dateStr = date.toISOString().split('T')[0];
	const userMissions = getUserDailyMissions(userId, date);
	const updatedMissions = [];
	const newlyCompleted = [];

	for (const mission of userMissions) {
		// 게임 타입 필터링
		if (mission.game_type !== 'all' && mission.game_type !== gameType) {
			continue;
		}

		// 이미 완료된 미션은 건너뜀
		if (mission.completed_at) {
			continue;
		}

		const currentProgress = calculateMissionProgress(mission, gameType, gameResult, userId);

		// 진행률 업데이트
		if (currentProgress > mission.progress) {
			missionQueries.updateProgress.run(currentProgress, mission.id);

			// 완료 체크
			if (currentProgress >= mission.requirement_value && !mission.completed_at) {
				missionQueries.markCompleted.run(mission.id);
				newlyCompleted.push(mission);
			}

			updatedMissions.push({
				...mission,
				progress: currentProgress
			});
		}
	}

	// 모든 미션 완료 시 스트릭 업데이트 체크
	const allMissions = getUserDailyMissions(userId, date);
	const allCompleted = allMissions.every((m) => m.completed_at);

	if (allCompleted && newlyCompleted.length > 0) {
		updateStreak(userId);
	}

	return { updatedMissions, newlyCompleted };
}

/**
 * 미션 진행률 계산
 */
function calculateMissionProgress(mission, gameType, gameResult, userId) {
	const requirementType = mission.requirement_type;

	// 오늘의 게임 기록 가져오기
	const today = new Date().toISOString().split('T')[0];
	const todayStart = `${today}T00:00:00`;
	const todayEnd = `${today}T23:59:59`;

	const todayGames = gameQueries.findByUserId.all(userId).filter((g) => {
		const gameDate = new Date(g.created_at).toISOString();
		return gameDate >= todayStart && gameDate <= todayEnd;
	});

	switch (requirementType) {
		case 'games_played':
			return todayGames.filter((g) => mission.game_type === 'all' || g.game_type === gameType)
				.length;

		case 'total_bet':
			return todayGames
				.filter((g) => mission.game_type === 'all' || g.game_type === gameType)
				.reduce((sum, g) => sum + g.bet_amount, 0);

		case 'wins':
			return todayGames.filter(
				(g) =>
					(mission.game_type === 'all' || g.game_type === gameType) && g.result === 'win'
			).length;

		case 'profit':
			return todayGames
				.filter((g) => mission.game_type === 'all' || g.game_type === gameType)
				.reduce((sum, g) => sum + (g.win_amount - g.bet_amount), 0);

		case 'win_streak':
			return calculateCurrentWinStreak(userId, gameType);

		case 'blackjack':
			return todayGames.filter(
				(g) => g.game_type === 'blackjack' && g.result === 'win' && gameResult?.blackjack
			).length;

		default:
			return 0;
	}
}

/**
 * 현재 연승 계산
 */
function calculateCurrentWinStreak(userId, gameType) {
	const games = gameQueries.findByUserId.all(userId).filter(
		(g) => gameType === 'all' || g.game_type === gameType
	);

	let streak = 0;
	for (let i = games.length - 1; i >= 0; i--) {
		if (games[i].result === 'win') {
			streak++;
		} else {
			break;
		}
	}
	return streak;
}

/**
 * 스트릭 업데이트
 */
function updateStreak(userId) {
	const streak = missionQueries.getStreak.get(userId);
	const today = new Date().toISOString().split('T')[0];

	if (!streak) {
		missionQueries.createStreak.run(userId);
		return;
	}

	// 마지막 완료일 확인
	const lastDate = streak.last_completion_date;
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayStr = yesterday.toISOString().split('T')[0];

	if (lastDate === yesterdayStr || lastDate === today) {
		// 연속으로 완료 - 스트릭 증가
		const newStreak = streak.current_streak + 1;
		missionQueries.updateStreak.run(newStreak, Math.max(newStreak, streak.longest_streak), Math.max(newStreak, streak.longest_streak), userId);
	} else {
		// 스트릭 리셋
		missionQueries.resetStreak.run(userId);
	}
}

/**
 * 스트릭 정보 가져오기
 */
export function getStreakInfo(userId) {
	let streak = missionQueries.getStreak.get(userId);

	if (!streak) {
		// 스트릭 레코드 생성
		missionQueries.createStreak.run(userId);
		streak = missionQueries.getStreak.get(userId);
	}

	const bonusTier = calculateStreakBonus(streak.current_streak);

	return {
		current_streak: streak.current_streak,
		longest_streak: streak.longest_streak,
		total_completed_days: streak.total_completed_days,
		last_completion_date: streak.last_completion_date,
		bonus_tier: bonusTier
	};
}

/**
 * 스트릭 보너스 계산
 */
function calculateStreakBonus(streak) {
	// 가장 높은 등급 찾기
	let tier = STREAK_BONUS_TIERS[0];
	for (const t of STREAK_BONUS_TIERS) {
		if (streak >= t.days) {
			tier = t;
		}
	}
	return tier;
}

/**
 * 미션 보상 청구 (스트릭 보너스 포함)
 */
export function claimMissionReward(userId, userMissionId) {
	const userMission = missionQueries.findUserMission.get(
		userId,
		userMissionId,
		new Date().toISOString().split('T')[0]
	);

	if (!userMission) {
		return { success: false, error: 'Mission not found' };
	}

	if (!userMission.completed_at) {
		return { success: false, error: 'Mission not completed' };
	}

	if (userMission.reward_claimed) {
		return { success: false, error: 'Reward already claimed' };
	}

	// 미션 정의 가져오기
	const missionDef = missionQueries.findById.get(userMission.mission_id);
	const streakInfo = getStreakInfo(userId);
	const bonusTier = streakInfo.bonus_tier;

	// 보상 계산 (스트릭 보너스 포함)
	const baseReward = missionDef.reward_chips;
	const bonusPercent = bonusTier.bonusPercent;
	const bonusChips = bonusTier.bonusChips;
	const totalReward = baseReward + Math.floor(baseReward * (bonusPercent / 100)) + bonusChips;

	// 트랜잭션으로 보상 지급
	const transaction = db.transaction(() => {
		const user = userQueries.findById.get(userId);
		const newBalance = user.balance + totalReward;
		userQueries.updateBalance.run(newBalance, userId);

		missionQueries.markRewardClaimed.run(userMissionId, userId);

		return {
			success: true,
			baseReward,
			bonusPercent,
			bonusChips,
			totalReward,
			newBalance,
			streak: streakInfo.current_streak
		};
	});

	return transaction();
}

/**
 * 활성 챌린지 가져오기
 */
export function getActiveChallenges(type = 'weekly') {
	return missionQueries.findActiveChallenges.all(type);
}

/**
 * 사용자의 챌린지 목록 가져오기
 */
export function getUserChallenges(userId) {
	return missionQueries.getUserChallenges.all(userId);
}

/**
 * 챌린지 참여
 */
export function enrollInChallenge(userId, challengeId) {
	// 이미 참여했는지 확인
	const existing = missionQueries.findUserChallenge.get(userId, challengeId);
	if (existing) {
		return { success: false, error: 'Already enrolled' };
	}

	// 챌린지 유효성 확인
	const challenge = missionQueries.findChallengeById.get(challengeId);
	if (!challenge) {
		return { success: false, error: 'Challenge not found' };
	}

	// 기간 확인
	const today = new Date().toISOString().split('T')[0];
	if (today < challenge.start_date || today > challenge.end_date) {
		return { success: false, error: 'Challenge not active' };
	}

	missionQueries.enrollUser.run(userId, challengeId);

	return { success: true, challenge };
}

/**
 * 챌린지 진행 업데이트
 */
export function updateChallengeProgress(userId, gameType, gameResult) {
	const userChallenges = missionQueries.getUserChallenges.all(userId);
	const updatedChallenges = [];
	const newlyCompleted = [];

	for (const userChallenge of userChallenges) {
		const challenge = missionQueries.findChallengeById.get(userChallenge.challenge_id);

		// 기간 확인
		const today = new Date().toISOString().split('T')[0];
		if (today < challenge.start_date || today > challenge.end_date) {
			continue;
		}

		// 이미 완료된 챌린지는 건너뜀
		if (userChallenge.completed_at) {
			continue;
		}

		// 게임 타입 필터링
		if (challenge.game_type !== 'all' && challenge.game_type !== gameType) {
			continue;
		}

		// 진행률 계산
		const progress = calculateChallengeProgress(challenge, userId, gameType, gameResult);

		if (progress > userChallenge.progress) {
			// 마일스톤 계산 (25%, 50%, 75%, 100%)
			const requirementValue = challenge.requirement_value;
			const milestoneReached = Math.floor((progress / requirementValue) * 4);

			missionQueries.updateChallengeProgress.run(progress, milestoneReached, userChallenge.id);

			// 완료 체크
			if (progress >= requirementValue && !userChallenge.completed_at) {
				missionQueries.markChallengeCompleted.run(userChallenge.id);
				newlyCompleted.push({ ...challenge, progress });
			}

			updatedChallenges.push({
				...challenge,
				progress,
				milestoneReached
			});
		}
	}

	return { updatedChallenges, newlyCompleted };
}

/**
 * 챌린지 진행률 계산
 */
function calculateChallengeProgress(challenge, userId, gameType, gameResult) {
	const requirementType = challenge.requirement_type;

	// 챌린지 기간 내 게임 기록 가져오기
	const periodGames = gameQueries.findByUserId.all(userId).filter((g) => {
		const gameDate = new Date(g.created_at).toISOString().split('T')[0];
		return gameDate >= challenge.start_date && gameDate <= challenge.end_date;
	});

	switch (requirementType) {
		case 'games_played':
			return periodGames.filter((g) => challenge.game_type === 'all' || g.game_type === gameType)
				.length;

		case 'total_bet':
			return periodGames
				.filter((g) => challenge.game_type === 'all' || g.game_type === gameType)
				.reduce((sum, g) => sum + g.bet_amount, 0);

		case 'wins':
			return periodGames.filter(
				(g) =>
					(challenge.game_type === 'all' || g.game_type === gameType) && g.result === 'win'
			).length;

		case 'profit':
			return periodGames
				.filter((g) => challenge.game_type === 'all' || g.game_type === gameType)
				.reduce((sum, g) => sum + (g.win_amount - g.bet_amount), 0);

		case 'blackjack':
			return periodGames.filter(
				(g) => g.game_type === 'blackjack' && g.result === 'win' && gameResult?.blackjack
			).length;

		default:
			return 0;
	}
}

/**
 * 챌린지 보상 청구
 */
export function claimChallengeReward(userId, userChallengeId) {
	const userChallenge = missionQueries.findUserChallenge.get(userId, userChallengeId);

	if (!userChallenge) {
		return { success: false, error: 'Challenge not found' };
	}

	if (!userChallenge.completed_at) {
		return { success: false, error: 'Challenge not completed' };
	}

	if (userChallenge.reward_claimed) {
		return { success: false, error: 'Reward already claimed' };
	}

	const challenge = missionQueries.findChallengeById.get(userChallenge.challenge_id);
	const totalReward = challenge.reward_chips;

	// 트랜잭션으로 보상 지급
	const transaction = db.transaction(() => {
		const user = userQueries.findById.get(userId);
		const newBalance = user.balance + totalReward;
		userQueries.updateBalance.run(newBalance, userId);

		missionQueries.markChallengeRewardClaimed.run(userChallengeId, userId);

		return {
			success: true,
			rewardAmount: totalReward,
			newBalance,
			rewardExp: challenge.reward_exp
		};
	});

	return transaction();
}

// 초기화 실행
if (!db.prepare('SELECT COUNT(*) as count FROM daily_missions').get().count) {
	initializeMissions();
}

if (!db.prepare('SELECT COUNT(*) as count FROM challenges').get().count) {
	initializeChallenges();
}
