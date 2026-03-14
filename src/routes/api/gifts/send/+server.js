import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { sendChipGift } from '$lib/server/friends.js';

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

		const { receiverId, amount, message } = await request.json();

		if (!receiverId || !amount) {
			return json(
				{ success: false, error: '수신자 ID와 금액이 필요합니다.' },
				{ status: 400 }
			);
		}

		const result = await sendChipGift(sessionResult.user.id, receiverId, amount, message || null);

		return json(result);
	} catch (error) {
		console.error('Send gift API error:', error);
		return json(
			{ success: false, error: error.message || '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
