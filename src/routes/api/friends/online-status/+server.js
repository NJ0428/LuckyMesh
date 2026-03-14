import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getFriendList } from '$lib/server/friends.js';
import { getFriendsOnlineStatus } from '$lib/server/onlineStatus.js';

export async function GET({ cookies }) {
	try {
		const sessionId = cookies.get('session');
		const sessionResult = validateSession(sessionId);

		if (!sessionResult.success) {
			return json(
				{ success: false, error: '로그인이 필요합니다.' },
				{ status: 401 }
			);
		}

		// 친구 목록 조회
		const friendList = await getFriendList(sessionResult.user.id);
		const friendIds = friendList.accepted.map((f) => f.userId);

		if (friendIds.length === 0) {
			return json({ success: true, statuses: [] });
		}

		// 친구들의 온라인 상태 조회
		const statuses = await getFriendsOnlineStatus(friendIds);

		return json({ success: true, statuses });
	} catch (error) {
		console.error('Online status API error:', error);
		return json(
			{ success: false, error: '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
