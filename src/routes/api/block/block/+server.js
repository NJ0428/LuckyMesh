import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { blockUser } from '$lib/server/friends.js';

export async function POST({ cookies, request }) {
	try {
		const sessionId = cookies.get('session');
		const sessionResult = validateSession(sessionId);

		if (!sessionResult.success) {
			return json(
				{ success: false, error: '로그인이 필요합니다.' },
				{ status: 401 }
			);
		}

		const { blockedId, reason } = await request.json();

		if (!blockedId) {
			return json({ success: false, error: '차단할 사용자 ID가 필요합니다.' }, { status: 400 });
		}

		const result = await blockUser(sessionResult.user.id, blockedId, reason || null);

		return json(result);
	} catch (error) {
		console.error('Block user API error:', error);
		return json(
			{ success: false, error: error.message || '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
