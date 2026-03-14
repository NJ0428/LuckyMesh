import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { sendFriendRequest } from '$lib/server/friends.js';

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

		const { friendId } = await request.json();

		if (!friendId) {
			return json({ success: false, error: '친구 ID가 필요합니다.' }, { status: 400 });
		}

		const result = await sendFriendRequest(sessionResult.user.id, friendId);

		return json(result);
	} catch (error) {
		console.error('Friend request API error:', error);
		return json(
			{ success: false, error: error.message || '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
