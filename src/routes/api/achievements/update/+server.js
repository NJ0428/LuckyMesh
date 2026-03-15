import { json } from '@sveltejs/kit';
import { updateAchievementProgress } from '$lib/server/achievements.js';
import { getSessionUser } from '$lib/server/session.js';

export async function POST({ request, cookies }) {
	try {
		const user = await getSessionUser(cookies);
		if (!user) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { gameType, gameResult } = body;

		if (!gameType || !gameResult) {
			return json(
				{
					success: false,
					error: 'gameType and gameResult are required'
				},
				{ status: 400 }
			);
		}

		// 사용자 ID가 gameResult에 없으면 추가
		const enrichedGameResult = {
			...gameResult,
			user_id: gameResult.user_id || user.id
		};

		// 업적 진행률 업데이트 및 새로 완료된 업적 반환
		const newlyCompleted = updateAchievementProgress(user.id, gameType, enrichedGameResult);

		return json({
			success: true,
			newlyCompleted,
			message: newlyCompleted.length > 0
				? `${newlyCompleted.length} new achievement(s) completed!`
				: 'Achievement progress updated'
		});
	} catch (error) {
		console.error('Error updating achievement progress:', error);
		return json(
			{
				success: false,
				error: 'Failed to update achievement progress'
			},
			{ status: 500 }
		);
	}
}
