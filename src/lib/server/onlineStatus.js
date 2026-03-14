import { onlineStatusQueries } from './database.js';

/**
 * 사용자 온라인 상태 업데이트
 */
export async function updateOnlineStatus(userId, currentGame = null) {
	onlineStatusQueries.updateStatus.run(userId, currentGame);

	return {
		success: true,
		message: '온라인 상태가 업데이트되었습니다.'
	};
}

/**
 * 사용자 오프라인 상태로 변경
 */
export async function setOffline(userId) {
	onlineStatusQueries.setOffline.run(userId);

	return {
		success: true,
		message: '오프라인 상태로 변경되었습니다.'
	};
}

/**
 * 친구들의 온라인 상태 조회
 */
export async function getFriendsOnlineStatus(friendIds) {
	if (!friendIds || friendIds.length === 0) {
		return [];
	}

	// 배열을 플레이스홀더로 변환
	const placeholders = friendIds.map(() => '?').join(',');
	const query = `
		SELECT
			uos.user_id,
			uos.is_online,
			uos.last_seen,
			uos.current_game,
			u.username,
			u.full_name
		FROM user_online_status uos
		JOIN users u ON uos.user_id = u.id
		WHERE uos.user_id IN (${placeholders})
	`;

	// 직접 쿼리 실행
	const db = onlineStatusQueries.updateStatus.constructor.name.includes('prepared')
		? onlineStatusQueries.updateStatus.constructor.db
		: null;

	if (!db) {
		// 개별 조회로 fallback
		const statuses = friendIds.map((id) => {
			try {
				return onlineStatusQueries.findByUserId.get(id);
			} catch (e) {
				return null;
			}
		});
		return statuses.filter((s) => s !== null);
	}

	const stmt = db.prepare(query);
	const results = stmt.all(...friendIds);

	return results.map((r) => ({
		userId: r.user_id,
		isOnline: r.is_online,
		lastSeen: r.last_seen,
		currentGame: r.current_game,
		username: r.username,
		fullName: r.full_name
	}));
}

/**
 * 특정 사용자의 온라인 상태 조회
 */
export async function getUserOnlineStatus(userId) {
	const status = onlineStatusQueries.findByUserId.get(userId);

	if (!status) {
		return {
			userId,
			isOnline: false,
			lastSeen: null,
			currentGame: null
		};
	}

	return {
		userId: status.user_id,
		isOnline: status.is_online,
		lastSeen: status.last_seen,
		currentGame: status.current_game,
		username: status.username,
		fullName: status.full_name
	};
}

/**
 * 오래된 온라인 상태 정리
 */
export async function cleanupOldOnlineStatus() {
	const result = onlineStatusQueries.cleanupOldStatus.run();

	return {
		success: true,
		updatedCount: result.changes,
		message: `${result.changes}개의 오래된 온라인 상태를 정리했습니다.`
	};
}

/**
 * 온라인 상태 계산 (last_seen 기반)
 */
export function isUserOnline(lastSeen) {
	if (!lastSeen) return false;

	const now = new Date();
	const lastSeenDate = new Date(lastSeen);
	const diffMinutes = (now - lastSeenDate) / 1000 / 60;

	// 5분 이내 업데이트가 있으면 온라인으로 간주
	return diffMinutes <= 5;
}

/**
 * 온라인 상태 텍스트 반환
 */
export function getOnlineStatusText(lastSeen, isOnline) {
	if (isOnline) return '온라인';

	if (!lastSeen) return '알 수 없음';

	const now = new Date();
	const lastSeenDate = new Date(lastSeen);
	const diffMinutes = (now - lastSeenDate) / 1000 / 60;

	if (diffMinutes < 60) {
		return `${Math.floor(diffMinutes)}분 전`;
	} else if (diffMinutes < 1440) {
		// 24시간
		return `${Math.floor(diffMinutes / 60)}시간 전`;
	} else if (diffMinutes < 43200) {
		// 30일
		return `${Math.floor(diffMinutes / 1440)}일 전`;
	} else {
		return '오래전';
	}
}
