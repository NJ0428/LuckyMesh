import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getUserDailyMissions, getStreakInfo } from '$lib/server/missions.js';

export async function GET({ request, url }) {
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

		// 날짜 쿼리 파라미터 (선택사항)
		const dateParam = url.searchParams.get('date');
		const date = dateParam ? new Date(dateParam) : new Date();

		// 일일 미션 가져오기
		const missions = getUserDailyMissions(userId, date);

		// 스트릭 정보 가져오기
		const streakInfo = getStreakInfo(userId);

		return json({
			success: true,
			data: {
				missions,
				streak: streakInfo,
				date: date.toISOString().split('T')[0]
			}
		});
	} catch (error) {
		console.error('Missions API GET error:', error);
		return json(
			{
				success: false,
				error: '서버 오류가 발생했습니다.'
			},
			{ status: 500 }
		);
	}
}
