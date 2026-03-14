import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { acceptFriendRequest } from '$lib/server/friends.js';

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

		const { requestId } = await request.json();

		if (!requestId) {
			return json({ success: false, error: '요청 ID가 필요합니다.' }, { status: 400 });
		}

		const result = await acceptFriendRequest(requestId, sessionResult.user.id);

		return json(result);
	} catch (error) {
		console.error('Friend accept API error:', error);
		return json(
			{ success: false, error: error.message || '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
