/**
 * 통계 계산 유틸리티 함수들
 * 게임 기록 데이터를 분석하고 다양한 통계를 계산합니다
 */

/**
 * 전체 또는 필터링된 게임 목록에 대한 승률 계산
 * @param {Array} games - 게임 기록 배열
 * @returns {Object} 승률 관련 통계
 */
export function calculateWinRate(games) {
	if (!games || games.length === 0) {
		return {
			totalGames: 0,
			wins: 0,
			losses: 0,
			pushes: 0,
			winRate: 0,
			lossRate: 0,
			pushRate: 0
		};
	}

	const wins = games.filter((game) => game.result === 'win').length;
	const losses = games.filter((game) => game.result === 'lose').length;
	const pushes = games.filter((game) => game.result === 'push').length;
	const total = games.length;

	return {
		totalGames: total,
		wins,
		losses,
		pushes,
		winRate: total > 0 ? (wins / total) * 100 : 0,
		lossRate: total > 0 ? (losses / total) * 100 : 0,
		pushRate: total > 0 ? (pushes / total) * 100 : 0
	};
}

/**
 * 게임 타입별 승률 통계
 * @param {Array} games - 게임 기록 배열
 * @returns {Object} 게임 타입별 통계
 */
export function calculateGameTypeStats(games) {
	const gameTypes = ['blackjack', 'baccarat', 'roulette', 'poker', 'slots', 'sicbo'];
	const stats = {};

	gameTypes.forEach((type) => {
		const typeGames = games.filter((g) => g.game_type === type);
		if (typeGames.length > 0) {
			const winRate = calculateWinRate(typeGames);
			const totalBet = typeGames.reduce((sum, g) => sum + (g.bet_amount || 0), 0);
			const totalWin = typeGames.reduce((sum, g) => sum + (g.win_amount || 0), 0);
			const netProfit = totalWin - totalBet;
			const avgBet = totalBet / typeGames.length;

			stats[type] = {
				...winRate,
				totalBet,
				totalWin,
				netProfit,
				avgBet,
				bestStreak: calculateStreaks(typeGames).bestWinStreak,
				worstStreak: calculateStreaks(typeGames).worstLossStreak
			};
		}
	});

	return stats;
}

/**
 * 베팅 패턴 분석
 * @param {Array} games - 게임 기록 배열
 * @returns {Object} 베팅 패턴 통계
 */
export function calculateBettingPatterns(games) {
	if (!games || games.length === 0) {
		return {
			smallBets: { count: 0, percentage: 0, winRate: 0 },
			mediumBets: { count: 0, percentage: 0, winRate: 0 },
			largeBets: { count: 0, percentage: 0, winRate: 0 },
			avgBet: 0,
			minBet: 0,
			maxBet: 0,
			riskLevel: 'low'
		};
	}

	// 베팅 금액 기준 계산 (사분위수)
	const betAmounts = games.map((g) => g.bet_amount || 0).sort((a, b) => a - b);
	const q1 = betAmounts[Math.floor(betAmounts.length * 0.25)];
	const median = betAmounts[Math.floor(betAmounts.length * 0.5)];
	const q3 = betAmounts[Math.floor(betAmounts.length * 0.75)];

	// 베팅 규모 분류
	const smallBets = games.filter((g) => g.bet_amount <= q1);
	const mediumBets = games.filter((g) => g.bet_amount > q1 && g.bet_amount <= q3);
	const largeBets = games.filter((g) => g.bet_amount > q3);

	const smallWinRate = calculateWinRate(smallBets);
	const mediumWinRate = calculateWinRate(mediumBets);
	const largeWinRate = calculateWinRate(largeBets);

	// 리스크 레벨 계산 (평균 베팅 / 잔고 비율 등)
	const avgBet = betAmounts.reduce((a, b) => a + b, 0) / betAmounts.length;
	const total = games.length;

	// 리스크 레벨 결정 (베팅 규모 분포 기반)
	let riskLevel = 'low';
	if (largeBets.length / total > 0.3) {
		riskLevel = 'high';
	} else if (largeBets.length / total > 0.15 || mediumBets.length / total > 0.5) {
		riskLevel = 'medium';
	}

	return {
		smallBets: {
			count: smallBets.length,
			percentage: (smallBets.length / total) * 100,
			winRate: smallWinRate.winRate,
			threshold: q1
		},
		mediumBets: {
			count: mediumBets.length,
			percentage: (mediumBets.length / total) * 100,
			winRate: mediumWinRate.winRate,
			threshold: q3
		},
		largeBets: {
			count: largeBets.length,
			percentage: (largeBets.length / total) * 100,
			winRate: largeWinRate.winRate
		},
		avgBet,
		minBet: Math.min(...betAmounts),
		maxBet: Math.max(...betAmounts),
		median,
		riskLevel
	};
}

/**
 * 시간대별 베팅 승률 분석
 * @param {Array} games - 게임 기록 배열
 * @returns {Array} 24시간별 승률 데이터
 */
export function calculateHourlyWinRates(games) {
	const hourlyData = Array(24)
		.fill(0)
		.map(() => ({ hour: 0, games: 0, wins: 0, winRate: 0 }));

	games.forEach((game) => {
		const hour = new Date(game.created_at).getHours();
		hourlyData[hour].hour = hour;
		hourlyData[hour].games++;
		if (game.result === 'win') {
			hourlyData[hour].wins++;
		}
	});

	// 승률 계산
	hourlyData.forEach((data) => {
		if (data.games > 0) {
			data.winRate = (data.wins / data.games) * 100;
		}
	});

	return hourlyData;
}

/**
 * 누적 수익/손실 계산
 * @param {Array} games - 게임 기록 배열 (시간순 정렬 필요)
 * @returns {Array} 누적 수익/손실 데이터 포인트
 */
export function calculateCumulativeProfit(games) {
	if (!games || games.length === 0) return [];

	// 시간순 정렬
	const sortedGames = [...games].sort(
		(a, b) => new Date(a.created_at) - new Date(b.created_at)
	);

	let cumulative = 0;
	const dataPoints = sortedGames.map((game, index) => {
		const netResult = (game.win_amount || 0) - (game.bet_amount || 0);
		cumulative += netResult;
		return {
			index,
			date: new Date(game.created_at),
			profit: cumulative,
			netResult,
			gameType: game.game_type,
			betAmount: game.bet_amount
		};
	});

	return dataPoints;
}

/**
 * 일별/주별 수익/손실 계산
 * @param {Array} games - 게임 기록 배열
 * @param {string} period - 'daily' 또는 'weekly'
 * @returns {Array} 기간별 수익/손실 데이터
 */
export function calculatePeriodProfit(games, period = 'daily') {
	if (!games || games.length === 0) return [];

	const periodMap = {};

	games.forEach((game) => {
		const date = new Date(game.created_at);
		let key;

		if (period === 'daily') {
			key = date.toISOString().split('T')[0]; // YYYY-MM-DD
		} else {
			// 주별 (월요일 기준)
			const monday = new Date(date);
			const day = monday.getDay() || 7; // 일요일을 7로 처리
			monday.setDate(monday.getDate() - day + 1);
			monday.setHours(0, 0, 0, 0);
			key = monday.toISOString().split('T')[0];
		}

		if (!periodMap[key]) {
			periodMap[key] = { date: key, profit: 0, games: 0 };
		}

		const netResult = (game.win_amount || 0) - (game.bet_amount || 0);
		periodMap[key].profit += netResult;
		periodMap[key].games++;
	});

	return Object.values(periodMap).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 최고 기록 & 최악 기록 찾기
 * @param {Array} games - 게임 기록 배열
 * @returns {Object} 최고/최악 기록
 */
export function findBestWorstRecords(games) {
	if (!games || games.length === 0) {
		return {
			best: {
				singleWin: 0,
				longestWinStreak: 0,
				bestDay: null,
				bestDayProfit: 0,
				highestWinRate: 0
			},
			worst: {
				singleLoss: 0,
				longestLossStreak: 0,
				worstDay: null,
				worstDayProfit: 0,
				lowestWinRate: 0
			}
		};
	}

	// 단일 게임 최대 승리/손실
	const results = games.map((g) => (g.win_amount || 0) - (g.bet_amount || 0));
	const bestSingleWin = Math.max(...results, 0);
	const worstSingleLoss = Math.min(...results, 0);

	// 연속 승/패
	const streaks = calculateStreaks(games);

	// 일별 최고/최악
	const dailyProfits = calculatePeriodProfit(games, 'daily');
	const bestDay = dailyProfits.reduce(
		(best, day) => (day.profit > best.profit ? day : best),
		{ profit: -Infinity }
	);
	const worstDay = dailyProfits.reduce(
		(worst, day) => (day.profit < worst.profit ? day : worst),
		{ profit: Infinity }
	);

	// 게임 타입별 최고/최저 승률
	const gameTypeStats = calculateGameTypeStats(games);
	const winRates = Object.entries(gameTypeStats).map(([type, stats]) => ({
		type,
		winRate: stats.winRate
	}));
	const highestWinRate = winRates.length > 0 ? Math.max(...winRates.map((r) => r.winRate)) : 0;
	const lowestWinRate = winRates.length > 0 ? Math.min(...winRates.map((r) => r.winRate)) : 0;

	return {
		best: {
			singleWin: bestSingleWin,
			longestWinStreak: streaks.bestWinStreak,
			bestDay: bestDay.date || null,
			bestDayProfit: bestDay.profit || 0,
			highestWinRate
		},
		worst: {
			singleLoss: worstSingleLoss,
			longestLossStreak: streaks.worstLossStreak,
			worstDay: worstDay.date || null,
			worstDayProfit: worstDay.profit || 0,
			lowestWinRate
		}
	};
}

/**
 * 연속 승/패 계산
 * @param {Array} games - 게임 기록 배열
 * @returns {Object} 연속 기록 통계
 */
export function calculateStreaks(games) {
	if (!games || games.length === 0) {
		return { bestWinStreak: 0, worstLossStreak: 0, currentStreak: 0, currentStreakType: null };
	}

	let bestWinStreak = 0;
	let worstLossStreak = 0;
	let currentWinStreak = 0;
	let currentLossStreak = 0;

	// 시간순 정렬
	const sortedGames = [...games].sort(
		(a, b) => new Date(a.created_at) - new Date(b.created_at)
	);

	sortedGames.forEach((game) => {
		if (game.result === 'win') {
			currentWinStreak++;
			currentLossStreak = 0;
			bestWinStreak = Math.max(bestWinStreak, currentWinStreak);
		} else if (game.result === 'lose') {
			currentLossStreak++;
			currentWinStreak = 0;
			worstLossStreak = Math.max(worstLossStreak, currentLossStreak);
		}
	});

	// 현재 연속 기록
	const lastGame = sortedGames[sortedGames.length - 1];
	let currentStreak = 0;
	let currentStreakType = null;

	if (lastGame) {
		for (let i = sortedGames.length - 1; i >= 0; i--) {
			const game = sortedGames[i];
			if (game.result === lastGame.result && game.result !== 'push') {
				currentStreak++;
			} else {
				break;
			}
		}
		currentStreakType = lastGame.result;
	}

	return {
		bestWinStreak,
		worstLossStreak,
		currentStreak,
		currentStreakType
	};
}

/**
 * 이동 평균 계산
 * @param {Array} data - 데이터 배열
 * @param {number} window - 윈도우 크기
 * @returns {Array} 이동 평균 데이터
 */
export function calculateMovingAverage(data, window = 7) {
	if (!data || data.length < window) return [];

	const result = [];
	for (let i = window - 1; i < data.length; i++) {
		let sum = 0;
		for (let j = 0; j < window; j++) {
			sum += data[i - j].profit || 0;
		}
		result.push({
			index: i,
			average: sum / window,
			date: data[i].date
		});
	}

	return result;
}

/**
 * 추세 분석
 * @param {Array} data - 누적 수익 데이터
 * @returns {string} 'up', 'down', 'neutral'
 */
export function analyzeTrend(data) {
	if (!data || data.length < 3) return 'neutral';

	// 최근 10개 데이터 포인트 또는 전체 (둘 중 작은 것)
	const recentData = data.slice(-10);
	const firstProfit = recentData[0].profit;
	const lastProfit = recentData[recentData.length - 1].profit;
	const change = lastProfit - firstProfit;
	const percentChange = firstProfit !== 0 ? (change / Math.abs(firstProfit)) * 100 : 0;

	if (percentChange > 5) return 'up';
	if (percentChange < -5) return 'down';
	return 'neutral';
}

/**
 * 게임 타입 이름 변환
 * @param {string} gameType - 게임 타입 ID
 * @returns {string} 한국어 게임 이름
 */
export function getGameTypeName(gameType) {
	const names = {
		blackjack: '블랙잭',
		baccarat: '바카라',
		roulette: '룰렛',
		poker: '포커',
		slots: '슬롯머신',
		sicbo: '다이사이'
	};
	return names[gameType] || gameType;
}

/**
 * 게임 타입 아이콘
 * @param {string} gameType - 게임 타입 ID
 * @returns {string} 이모지 아이콘
 */
export function getGameTypeIcon(gameType) {
	const icons = {
		blackjack: '🃏',
		baccarat: '🎴',
		roulette: '🎡',
		poker: '♠️',
		slots: '🍒',
		sicbo: '🎲'
	};
	return icons[gameType] || '🎮';
}

/**
 * 통화 포맷팅
 * @param {number} amount - 금액
 * @returns {string} 포맷된 통화 문자열
 */
export function formatCurrency(amount) {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW'
	}).format(amount);
}

/**
 * 날짜 포맷팅
 * @param {string|Date} date - 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
export function formatDate(date) {
	return new Date(date).toLocaleDateString('ko-KR', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
}
