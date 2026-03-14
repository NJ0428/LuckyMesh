import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { searchUsers } from '$lib/server/friends.js';

export async function GET({ cookies, url }) {
	try {
		const sessionId = cookies.get('session');
		const sessionResult = validateSession(sessionId);

		if (!sessionResult.success) {
			return json(
				{ success: false, error: '로그인이 필요합니다.' },
				{ status: 401 }
			);
		}

		const query = url.searchParams.get('q');

		if (!query) {
			return json({ success: false, error: '검색어가 필요합니다.' }, { status: 400 });
		}

		const result = await searchUsers(query, sessionResult.user.id);

		return json({ success: true, users: result });
	} catch (error) {
		console.error('User search API error:', error);
		return json(
			{ success: false, error: '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
