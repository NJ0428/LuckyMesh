/**
 * 업적 시스템 통합 헬퍼
 *
 * 게임 스토어에서 업적 시스템을 쉽게 사용할 수 있는 유틸리티 함수들
 */

/**
 * 게임 결과로부터 업적 업데이트 객체 생성
 */
export function createAchievementGameResult(gameType, result, details = {}) {
	const baseResult = {
		game_type: gameType,
		result: result.result || 'pending', // 'win', 'lose', 'tie'
		bet_amount: result.bet_amount || 0,
		win_amount: result.win_amount || 0,
		profit: (result.win_amount || 0) - (result.bet_amount || 0)
	};

	// 게임별 세부 정보 추가
	switch (gameType) {
		case 'blackjack':
			return {
				...baseResult,
				details: {
					blackjack: details.blackjack || false,
					doubleDown: details.doubleDown || false,
					perfectPair: details.perfectPair || false,
					twentyOnePlusThree: details.twentyOnePlusThree || false,
					splits: details.splits || 0,
					handValue: details.handValue || 0,
					...details
				}
			};

		case 'roulette':
			return {
				...baseResult,
				details: {
					betType: details.betType || 'straight',
					number: details.number || null,
					color: details.color || null,
					zero: details.zero || false,
					multiplier: details.multiplier || 1,
					colorStreak: details.colorStreak || 0,
					allColors: details.allColors || false,
					...details
				}
			};

		case 'baccarat':
			return {
				...baseResult,
				details: {
					betOn: details.betOn || 'player', // 'player', 'banker', 'tie'
					natural: details.natural || false,
					playerScore: details.playerScore || 0,
					bankerScore: details.bankerScore || 0,
					streak: details.streak || 0,
					...details
				}
			};

		case 'poker':
			return {
				...baseResult,
				details: {
					hand: details.hand || 'high_card',
					rank: details.rank || 1,
					royalFlush: details.hand === 'royal_flush',
					fullHouse: details.hand === 'full_house',
					fourOfKind: details.hand === 'four_of_kind',
					straightFlush: details.hand === 'straight_flush',
					...details
				}
			};

		case 'slots':
			return {
				...baseResult,
				details: {
					symbols: details.symbols || [],
					bonus: details.bonus || false,
					jackpot: details.jackpot || false,
					tripleSeven: details.tripleSeven || false,
					freeSpins: details.freeSpins || 0,
					...details
				}
			};

		case 'sicbo':
			return {
				...baseResult,
				details: {
					dice: details.dice || [1, 1, 1],
					betOn: details.betOn || 'big',
					triple: details.triple || false,
					allTriples: details.allTriples || false,
					exact: details.exact || false,
					streak: details.streak || 0,
					...details
				}
			};

		default:
			return {
				...baseResult,
				details
			};
	}
}

/**
 * 게임 스토어용 업적 통합 훅/함수
 *
 * @param {string} gameType - 게임 타입
 * @param {Object} result - 게임 결과
 * @param {Object} details - 게임별 세부 정보
 */
export async function trackGameAchievement(gameType, result, details = {}) {
	try {
		const gameResult = createAchievementGameResult(gameType, result, details);

		const response = await fetch('/api/achievements/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				gameType,
				gameResult
			})
		});

		const data = await response.json();

		if (data.success && data.newlyCompleted && data.newlyCompleted.length > 0) {
			// 업적 달성 이벤트 디스패치
			data.newlyCompleted.forEach((achievement) => {
				if (typeof window !== 'undefined') {
					window.dispatchEvent(
						new CustomEvent('achievementUnlocked', {
							detail: achievement
						})
					);
				}
			});
		}

		return data;
	} catch (error) {
		console.error('Error tracking achievement:', error);
		return { success: false, error: error.message };
	}
}

/**
 * 블랙잭용 업적 트래킹
 */
export async function trackBlackjackAchievement(result) {
	return trackGameAchievement('blackjack', result, {
		blackjack: result.isBlackjack || false,
		doubleDown: result.doubleDown || false,
		perfectPair: result.perfectPair || false,
		twentyOnePlusThree: result.twentyOnePlusThree || false,
		splits: result.splits || 0,
		handValue: result.handValue || 0
	});
}

/**
 * 룰렛용 업적 트래킹
 */
export async function trackRouletteAchievement(result) {
	return trackGameAchievement('roulette', result, {
		betType: result.betType || 'straight',
		number: result.winningNumber || null,
		color: result.winningColor || null,
		zero: result.winningNumber === 0 || result.winningNumber === '00',
		multiplier: result.multiplier || 1,
		colorStreak: result.colorStreak || 0,
		allColors: result.allColors || false
	});
}

/**
 * 바카라용 업적 트래킹
 */
export async function trackBaccaratAchievement(result) {
	return trackGameAchievement('baccarat', result, {
		betOn: result.betOn || 'player',
		natural: result.natural || false,
		playerScore: result.playerScore || 0,
		bankerScore: result.bankerScore || 0,
		streak: result.streak || 0
	});
}

/**
 * 포커용 업적 트래킹
 */
export async function trackPokerAchievement(result) {
	return trackGameAchievement('poker', result, {
		hand: result.hand || 'high_card',
		rank: result.rank || 1
	});
}

/**
 * 슬롯용 업적 트래킹
 */
export async function trackSlotAchievement(result) {
	return trackGameAchievement('slots', result, {
		symbols: result.symbols || [],
		bonus: result.bonus || false,
		jackpot: result.jackpot || false,
		tripleSeven: result.tripleSeven || false,
		freeSpins: result.freeSpins || 0
	});
}

/**
 * 다이사이용 업적 트래킹
 */
export async function trackSicBoAchievement(result) {
	return trackGameAchievement('sicbo', result, {
		dice: result.dice || [1, 1, 1],
		betOn: result.betOn || 'big',
		triple: result.triple || false,
		allTriples: result.allTriples || false,
		exact: result.exact || false,
		streak: result.streak || 0
	});
}
