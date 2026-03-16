import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { updateChallengeProgress } from '$lib/server/missions.js';

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
		if (!body.gameType || !body.gameResult) {
			return json(
				{
					success: false,
					error: '게임 타입과 결과가 필요합니다.'
				},
				{ status: 400 }
			);
		}

		// 유효한 게임 타입 확인
		const validGameTypes = ['blackjack', 'roulette', 'baccarat', 'poker', 'slots', 'sicbo'];
		if (!validGameTypes.includes(body.gameType)) {
			return json(
				{
					success: false,
					error: '유효하지 않은 게임 타입입니다.'
				},
				{ status: 400 }
			);
		}

		// 챌린지 진행 업데이트
		const result = updateChallengeProgress(userId, body.gameType, body.gameResult);

		return json({
			success: true,
			data: result
		});
	} catch (error) {
		console.error('Challenge update API POST error:', error);
		return json(
			{
				success: false,
				error: '서버 오류가 발생했습니다.'
			},
			{ status: 500 }
		);
	}
}
