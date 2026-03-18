import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getStreakInfo } from '$lib/server/missions.js';

export async function GET({ request }) {
	try {
		// 세션 검증
		const sessionCookie = request.headers.get('cookie')?.match(/session=([^;]+)/);
		if (!sessionCookie) {
			return json(
				{
					success: false,
					error: '로그인이 필요합니다.'
				},
				{ status: 401 }
			);
		}

		const sessionResult = validateSession(sessionCookie[1]);
		if (!sessionResult.success) {
			return json(
				{
					success: false,
					error: '유효하지 않은 세션입니다.'
				},
				{ status: 401 }
			);
		}

		const userId = sessionResult.user.id;

		// 스트릭 정보 가져오기
		const streakInfo = getStreakInfo(userId);

		return json({
			success: true,
			data: streakInfo
		});
	} catch (error) {
		console.error('Mission streak API GET error:', error);
		return json(
			{
				success: false,
				error: '서버 오류가 발생했습니다.'
			},
			{ status: 500 }
		);
	}
}
