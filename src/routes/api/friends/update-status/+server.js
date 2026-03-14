import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { updateOnlineStatus, setOffline } from '$lib/server/onlineStatus.js';

export async function PUT({ cookies, request }) {
	try {
		const sessionId = cookies.get('session');
		const sessionResult = validateSession(sessionId);

		if (!sessionResult.success) {
			return json(
				{ success: false, error: '로그인이 필요합니다.' },
				{ status: 401 }
			);
		}

		const { currentGame, isOnline } = await request.json();

		let result;
		if (isOnline === false) {
			result = await setOffline(sessionResult.user.id);
		} else {
			result = await updateOnlineStatus(sessionResult.user.id, currentGame || null);
		}

		return json(result);
	} catch (error) {
		console.error('Update status API error:', error);
		return json(
			{ success: false, error: '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
