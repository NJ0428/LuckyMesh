import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { claimChallengeReward } from '$lib/server/missions.js';

export async function POST({ request }) {
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
		const body = await request.json();

		// 필수 필드 확인
		if (!body.challengeId) {
			return json(
				{
					success: false,
					error: '챌린지 ID가 필요합니다.'
				},
				{ status: 400 }
			);
		}

		// 챌린지 보상 청구
		const result = claimChallengeReward(userId, body.challengeId);

		if (!result.success) {
			return json(
				{
					success: false,
					error: result.error
				},
				{ status: 400 }
			);
		}

		return json({
			success: true,
			message: `${result.rewardAmount.toLocaleString()}칩을 받았습니다!`,
			data: result
		});
	} catch (error) {
		console.error('Challenge claim API POST error:', error);
		return json(
			{
				success: false,
				error: '서버 오류가 발생했습니다.'
			},
			{ status: 500 }
		);
	}
}
