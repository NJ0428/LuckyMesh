import { json } from '@sveltejs/kit';
import { claimAchievementReward } from '$lib/server/achievements.js';
import { getSessionUser } from '$lib/server/session.js';

export async function POST({ request, cookies }) {
	try {
		const user = await getSessionUser(cookies);
		if (!user) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { userAchievementId } = body;

		if (!userAchievementId) {
			return json({ success: false, error: 'userAchievementId is required' }, { status: 400 });
		}

		const result = claimAchievementReward(user.id, userAchievementId);

		return json({
			success: true,
			...result
		});
	} catch (error) {
		console.error('Error claiming achievement reward:', error);

		// 사용자 정의 에러 메시지
		let errorMessage = 'Failed to claim reward';
		if (error.message === 'Achievement not found') {
			errorMessage = 'Achievement not found';
		} else if (error.message === 'Achievement not completed') {
			errorMessage = 'Achievement not completed yet';
		} else if (error.message === 'Reward already claimed') {
			errorMessage = 'Reward already claimed';
		}

		return json(
			{
				success: false,
				error: errorMessage
			},
			{ status: 400 }
		);
	}
}
