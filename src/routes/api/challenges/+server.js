import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getActiveChallenges, getUserChallenges } from '$lib/server/missions.js';

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

		// 쿼리 파라미터
		const type = url.searchParams.get('type') || 'weekly';
		const includeUserProgress = url.searchParams.get('includeUserProgress') === 'true';

		// 유효성 검사
		const validTypes = ['weekly', 'monthly'];
		if (!validTypes.includes(type)) {
			return json(
				{
					success: false,
					error: '유효하지 않은 챌린지 타입입니다.'
				},
				{ status: 400 }
			);
		}

		// 활성 챌린지 가져오기
		const activeChallenges = getActiveChallenges(type);

		// 사용자 진행률 포함 여부
		let challenges = activeChallenges;
		if (includeUserProgress) {
			const userChallenges = getUserChallenges(userId);
			const userChallengeMap = new Map(
				userChallenges.map((uc) => [uc.challenge_id, uc])
			);

			challenges = activeChallenges.map((challenge) => ({
				...challenge,
				user_progress: userChallengeMap.get(challenge.id) || null
			}));
		}

		return json({
			success: true,
			data: {
				challenges,
				type
			}
		});
	} catch (error) {
		console.error('Challenges API GET error:', error);
		return json(
			{
				success: false,
				error: '서버 오류가 발생했습니다.'
			},
			{ status: 500 }
		);
	}
}
