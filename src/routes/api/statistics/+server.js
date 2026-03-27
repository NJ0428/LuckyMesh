import { json } from '@sveltejs/kit';
import { gameQueries } from '$lib/server/database.js';
import { verifySession } from '$lib/server/auth.js';
import {
	calculateWinRate,
	calculateGameTypeStats,
	calculateBettingPatterns,
	calculateHourlyWinRates,
	calculateCumulativeProfit,
	calculatePeriodProfit,
	findBestWorstRecords,
	calculateStreaks,
	calculateMovingAverage,
	analyzeTrend
} from '$lib/utils/statistics.js';

/**
 * GET /api/statistics
 * 사용자의 포괄적인 게임 통계를 반환합니다
 *
 * Query Parameters:
 * - timeRange: '24hours', '7days', '30days', 'all' (기본값: 'all')
 * - gameType: 'all', 'blackjack', 'baccarat', 'roulette', 'poker', 'slots', 'sicbo' (기본값: 'all')
 */
export async function GET({ cookies, url }) {
	try {
		// 세션 검증
		const sessionId = cookies.get('session');
		if (!sessionId) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const session = await verifySession(sessionId);
		if (!session) {
			return json({ error: 'Invalid session' }, { status: 401 });
		}

		// 쿼리 파라미터 추출
		const timeRange = url.searchParams.get('timeRange') || 'all';
		const gameType = url.searchParams.get('gameType') || 'all';

		// 사용자의 게임 기록 조회
		let gameHistory = gameQueries.findByUserId.all(session.user_id);

		// 시간 범위 필터링
		if (timeRange !== 'all') {
			const now = new Date();
			const cutoff = new Date();

			switch (timeRange) {
				case '24hours':
					cutoff.setHours(now.getHours() - 24);
					break;
				case '7days':
					cutoff.setDate(now.getDate() - 7);
					break;
				case '30days':
					cutoff.setDate(now.getDate() - 30);
					break;
			}

			gameHistory = gameHistory.filter((game) => new Date(game.created_at) >= cutoff);
		}

		// 게임 타입 필터링
		if (gameType !== 'all') {
			gameHistory = gameHistory.filter((game) => game.game_type === gameType);
		}

		// 빈 데이터 처리
		if (gameHistory.length === 0) {
			return json({
				summary: {
					totalGames: 0,
					winRate: 0,
					netProfit: 0,
					avgBet: 0,
					totalBet: 0,
					totalWin: 0
				},
				gameTypeStats: {},
				bettingPatterns: null,
				hourlyWinRates: [],
				cumulativeProfit: [],
				dailyProfit: [],
				weeklyProfit: [],
				bestRecords: null,
				worstRecords: null,
				streaks: {
					bestWinStreak: 0,
					worstLossStreak: 0,
					currentStreak: 0,
					currentStreakType: null
				},
				trend: 'neutral',
				timeRange,
				gameType
			});
		}

		// 1. 기본 요약 통계
		const winRateData = calculateWinRate(gameHistory);
		const totalBet = gameHistory.reduce((sum, g) => sum + (g.bet_amount || 0), 0);
		const totalWin = gameHistory.reduce((sum, g) => sum + (g.win_amount || 0), 0);
		const netProfit = totalWin - totalBet;
		const avgBet = totalBet / gameHistory.length;

		const summary = {
			totalGames: gameHistory.length,
			...winRateData,
			netProfit,
			avgBet,
			totalBet,
			totalWin
		};

		// 2. 게임 타입별 통계
		const gameTypeStats = calculateGameTypeStats(gameHistory);

		// 3. 베팅 패턴 분석
		const bettingPatterns = calculateBettingPatterns(gameHistory);

		// 4. 시간대별 승률 (24시간)
		const hourlyWinRates = calculateHourlyWinRates(gameHistory);

		// 5. 누적 수익/손실
		const cumulativeProfit = calculateCumulativeProfit(gameHistory);

		// 6. 기간별 수익/손실
		const dailyProfit = calculatePeriodProfit(gameHistory, 'daily');
		const weeklyProfit = calculatePeriodProfit(gameHistory, 'weekly');

		// 7. 최고/최악 기록
		const records = findBestWorstRecords(gameHistory);

		// 8. 연속 승/패
		const streaks = calculateStreaks(gameHistory);

		// 9. 추세 분석
		const trend = analyzeTrend(cumulativeProfit);

		// 10. 이동 평균 (7일, 30일)
		const movingAverage7d = calculateMovingAverage(cumulativeProfit, 7);
		const movingAverage30d = calculateMovingAverage(cumulativeProfit, 30);

		return json({
			summary,
			gameTypeStats,
			bettingPatterns,
			hourlyWinRates,
			cumulativeProfit,
			dailyProfit,
			weeklyProfit,
			bestRecords: records.best,
			worstRecords: records.worst,
			streaks,
			trend,
			movingAverage: {
				'7day': movingAverage7d,
				'30day': movingAverage30d
			},
			timeRange,
			gameType
		});
	} catch (error) {
		console.error('Error fetching statistics:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
