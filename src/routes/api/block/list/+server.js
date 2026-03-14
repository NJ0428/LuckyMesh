import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getBlockedList } from '$lib/server/friends.js';

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

		const result = await getBlockedList(sessionResult.user.id);

		return json({ success: true, blocked: result });
	} catch (error) {
		console.error('Block list API error:', error);
		return json(
			{ success: false, error: '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
