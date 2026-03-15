import { writable, derived } from 'svelte/store';

// 초기 상태
const initialState = {
	achievements: [],
	userAchievements: [],
	stats: null,
	loading: false,
	error: null
};

// 스토어 생성
function createAchievementStatsStore() {
	const { subscribe, set, update } = writable(initialState);

	return {
		subscribe,

		// 업적 목록 로드
		async loadAchievements(filters = {}) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const queryParams = new URLSearchParams();
				if (filters.gameType) queryParams.append('gameType', filters.gameType);
				if (filters.category) queryParams.append('category', filters.category);
				if (filters.tier) queryParams.append('tier', filters.tier);

				const response = await fetch(`/api/achievements?${queryParams.toString()}`);
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						achievements: data.achievements,
						loading: false
					}));
				} else {
					throw new Error(data.error);
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},

		// 사용자 업적 진행률 로드
		async loadUserProgress(filters = {}) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const queryParams = new URLSearchParams();
				if (filters.gameType) queryParams.append('gameType', filters.gameType);
				if (filters.completed !== undefined)
					queryParams.append('completed', filters.completed.toString());

				const response = await fetch(`/api/achievements/progress?${queryParams.toString()}`);
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						userAchievements: data.achievements,
						loading: false
					}));
				} else {
					throw new Error(data.error);
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},

		// 통계 로드
		async loadStats() {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const response = await fetch('/api/achievements/stats');
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						stats: data,
						loading: false
					}));
				} else {
					throw new Error(data.error);
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},

		// 모든 데이터 로드
		async loadAll() {
			await this.loadAchievements();
			await this.loadUserProgress();
			await this.loadStats();
		},

		// 보상 청구
		async claimReward(userAchievementId) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const response = await fetch('/api/achievements/claim', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ userAchievementId })
				});

				const data = await response.json();

				if (data.success) {
					// 데이터 재로드
					await this.loadUserProgress();
					await this.loadStats();

					update((state) => ({ ...state, loading: false }));
					return data;
				} else {
					throw new Error(data.error);
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
				throw error;
			}
		},

		// 리셋
		reset() {
			set(initialState);
		}
	};
}

export const achievementStatsStore = createAchievementStatsStore();

// 파생 스토어
export const completedAchievements = derived(
	achievementStatsStore,
	($store) => {
		return $store.userAchievements
			.filter((ua) => ua.completed_at && !ua.reward_claimed)
			.map((ua) => {
				const achievement = $store.achievements.find((a) => a.id === ua.achievement_id);
				return {
					...ua,
					achievement
				};
			})
			.filter((ua) => ua.achievement);
	}
);

export const inProgressAchievements = derived(
	achievementStatsStore,
	($store) => {
		return $store.userAchievements
			.filter((ua) => !ua.completed_at)
			.map((ua) => {
				const achievement = $store.achievements.find((a) => a.id === ua.achievement_id);
				const progress = achievement
					? Math.min((ua.progress / achievement.requirements_value) * 100, 100)
					: 0;
				return {
					...ua,
					achievement,
					progress
				};
			})
			.filter((ua) => ua.achievement);
	}
);

export const recentAchievements = derived(
	achievementStatsStore,
	($store) => {
		return $store.userAchievements
			.filter((ua) => ua.completed_at)
			.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
			.slice(0, 5)
			.map((ua) => {
				const achievement = $store.achievements.find((a) => a.id === ua.achievement_id);
				return {
					...ua,
					achievement
				};
			})
			.filter((ua) => ua.achievement);
	}
);

export const completionRate = derived(achievementStatsStore, ($store) => {
	if (!$store.stats || !$store.stats.stats) return 0;
	return $store.stats.stats.completionRate || 0;
});

export const pendingClaimsCount = derived(achievementStatsStore, ($store) => {
	if (!$store.stats || !$store.stats.pendingClaims) return 0;
	return $store.stats.pendingClaims.length;
});

// 게임 결과 업적 업데이트 (게임 스토어에서 호출)
export async function updateAchievementFromGame(gameType, gameResult) {
	try {
		// 현재 세션의 사용자 ID 필요
		const response = await fetch('/api/session');
		const sessionData = await response.json();

		if (!sessionData.user) {
			console.warn('No user session for achievement update');
			return [];
		}

		// 업적 업데이트 API 호출 (별도 엔드포인트 필요)
		const updateResponse = await fetch('/api/achievements/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				gameType,
				gameResult: {
					user_id: sessionData.user.id,
					...gameResult
				}
			})
		});

		const updateData = await updateResponse.json();

		if (updateData.success && updateData.newlyCompleted) {
			// 업적 달성 알림 표시
			updateData.newlyCompleted.forEach((achievement) => {
				if (typeof window !== 'undefined') {
					window.dispatchEvent(
						new CustomEvent('achievementUnlocked', {
							detail: achievement
						})
					);
				}
			});

			// 스토어 리로드
			await achievementStatsStore.loadAll();

			return updateData.newlyCompleted;
		}

		return [];
	} catch (error) {
		console.error('Error updating achievements:', error);
		return [];
	}
}
