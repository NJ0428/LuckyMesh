import { writable, derived } from 'svelte/store';

// 친구 상태 관리
function createFriendsStore() {
	const { subscribe, set, update } = writable({
		accepted: [],
		pending: [],
		sent: [],
		loading: false,
		error: null
	});

	return {
		subscribe,
		set,
		update,
		// 친구 목록 로드
		async load() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const response = await fetch('/api/friends/list');
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						accepted: data.accepted || [],
						pending: data.pending || [],
						sent: data.sent || [],
						loading: false
					}));
				} else {
					throw new Error(data.error || '친구 목록을 불러오는데 실패했습니다.');
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},
		// 친구 요청 보내기
		async sendRequest(friendId) {
			try {
				const response = await fetch('/api/friends/request', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ friendId })
				});
				const data = await response.json();

				if (data.success) {
					// 목록 새로고침
					this.load();
					return { success: true };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		// 친구 요청 수락
		async acceptRequest(requestId) {
			try {
				const response = await fetch('/api/friends/accept', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ requestId })
				});
				const data = await response.json();

				if (data.success) {
					this.load();
					return { success: true };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		// 친구 요청 거절
		async rejectRequest(requestId) {
			try {
				const response = await fetch('/api/friends/reject', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ requestId })
				});
				const data = await response.json();

				if (data.success) {
					this.load();
					return { success: true };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		// 친구 삭제
		async removeFriend(friendId) {
			try {
				const response = await fetch('/api/friends/remove', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ friendId })
				});
				const data = await response.json();

				if (data.success) {
					this.load();
					return { success: true };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		// 사용자 검색
		async searchUsers(query) {
			try {
				const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
				const data = await response.json();

				if (data.success) {
					return { success: true, users: data.users };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		}
	};
}

// 칩 선물 상태 관리
function createGiftsStore() {
	const { subscribe, set, update } = writable({
		pending: [],
		history: [],
		loading: false,
		error: null
	});

	return {
		subscribe,
		set,
		update,
		// 대기 중인 선물 로드
		async loadPending() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const response = await fetch('/api/gifts/pending');
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						pending: data.gifts || [],
						loading: false
					}));
				} else {
					throw new Error(data.error || '선물 목록을 불러오는데 실패했습니다.');
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},
		// 선물 내역 로드
		async loadHistory() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const response = await fetch('/api/gifts/history');
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						history: data.gifts || [],
						loading: false
					}));
				} else {
					throw new Error(data.error || '선물 내역을 불러오는데 실패했습니다.');
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},
		// 선물 보내기
		async sendGift(receiverId, amount, message) {
			try {
				const response = await fetch('/api/gifts/send', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ receiverId, amount, message })
				});
				const data = await response.json();

				if (data.success) {
					this.loadHistory();
					return { success: true, giftId: data.giftId };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		// 선물 수락
		async acceptGift(giftId) {
			try {
				const response = await fetch('/api/gifts/accept', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ giftId })
				});
				const data = await response.json();

				if (data.success) {
					this.loadPending();
					return { success: true, newBalance: data.newBalance };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		},
		// 선물 거절
		async rejectGift(giftId) {
			try {
				const response = await fetch('/api/gifts/reject', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ giftId })
				});
				const data = await response.json();

				if (data.success) {
					this.loadPending();
					return { success: true };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		}
	};
}

// 온라인 상태 관리 (폴링)
function createOnlineStatusStore() {
	const { subscribe, set, update } = writable({
		statuses: [],
		loading: false,
		error: null
	});

	let pollInterval = null;

	return {
		subscribe,
		set,
		update,
		// 폴링 시작
		startPolling(intervalMs = 30000) {
			if (pollInterval) clearInterval(pollInterval);

			// 즉시 한 번 실행
			this.load();

			// 주기적 실행
			pollInterval = setInterval(() => {
				this.load();
			}, intervalMs);
		},
		// 폴링 중지
		stopPolling() {
			if (pollInterval) {
				clearInterval(pollInterval);
				pollInterval = null;
			}
		},
		// 온라인 상태 로드
		async load() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const response = await fetch('/api/friends/online-status');
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						statuses: data.statuses || [],
						loading: false
					}));
				} else {
					throw new Error(data.error || '온라인 상태를 불러오는데 실패했습니다.');
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},
		// 사용자의 온라인 상태 확인
		isUserOnline(userId) {
			return derived(this, ($store) => {
				const status = $store.statuses.find((s) => s.userId === userId);
				return status ? status.isOnline : false;
			});
		}
	};
}

// 추천인 시스템 상태 관리
function createReferralsStore() {
	const { subscribe, set, update } = writable({
		code: null,
		stats: null,
		referrals: [],
		loading: false,
		error: null
	});

	return {
		subscribe,
		set,
		update,
		// 추천 코드 로드
		async loadCode() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const response = await fetch('/api/referrals/my-code');
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						code: data.code,
						usageCount: data.usageCount,
						isActive: data.isActive,
						loading: false
					}));
				} else {
					throw new Error(data.error || '추천 코드를 불러오는데 실패했습니다.');
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},
		// 추천 통계 로드
		async loadStats() {
			update((state) => ({ ...state, loading: true, error: null }));
			try {
				const response = await fetch('/api/referrals/stats');
				const data = await response.json();

				if (data.success) {
					update((state) => ({
						...state,
						stats: {
							totalReferrals: data.totalReferrals,
							paidReferrals: data.paidReferrals,
							totalRewards: data.totalRewards
						},
						referrals: data.referrals || [],
						loading: false
					}));
				} else {
					throw new Error(data.error || '추천 통계를 불러오는데 실패했습니다.');
				}
			} catch (error) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message
				}));
			}
		},
		// 추천 코드 적용
		async applyCode(code) {
			try {
				const response = await fetch('/api/referrals/apply', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ code })
				});
				const data = await response.json();

				if (data.success) {
					return { success: true, ...data };
				} else {
					return { success: false, error: data.error };
				}
			} catch (error) {
				return { success: false, error: error.message };
			}
		}
	};
}

export const friends = createFriendsStore();
export const gifts = createGiftsStore();
export const onlineStatus = createOnlineStatusStore();
export const referrals = createReferralsStore();
