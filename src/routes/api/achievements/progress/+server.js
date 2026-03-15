import { json } from '@sveltejs/kit';
import { getUserAchievements } from '$lib/server/achievements.js';
import { getSessionUser } from '$lib/server/session.js';

export async function GET({ url, cookies }) {
	try {
		const user = await getSessionUser(cookies);
		if (!user) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const gameType = url.searchParams.get('gameType');
		const completed = url.searchParams.get('completed');
		const userId = user.id;

		const filters = { userId };
		if (gameType) filters.gameType = gameType;
		if (completed === 'true') filters.completed = true;
		if (completed === 'false') filters.completed = false;

		const achievements = getUserAchievements(userId, filters);

		return json({
			success: true,
			achievements,
			filters: { gameType, completed }
		});
	} catch (error) {
		console.error('Error fetching achievement progress:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch achievement progress'
			},
			{ status: 500 }
		);
	}
}
