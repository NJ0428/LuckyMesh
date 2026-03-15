import { json } from '@sveltejs/kit';
import { getUserAchievementStats, getUserAchievements } from '$lib/server/achievements.js';
import { getSessionUser } from '$lib/server/session.js';

export async function GET({ cookies }) {
	try {
		const user = await getSessionUser(cookies);
		if (!user) {
			return json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const userId = user.id;

		// 기본 통계 조회
		const stats = getUserAchievementStats(userId);

		// 미청구 보상 목록
		const pendingClaims = getUserAchievements(userId, { completed: true }).filter(
			(a) => !a.reward_claimed
		);

		// 최근 달성 업적 (최대 5개)
		const recentAchievements = getUserAchievements(userId)
			.filter((a) => a.completed_at)
			.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
			.slice(0, 5);

		// 완료율 계산
		const completionRate =
			stats.general.total_achievements > 0
				? Math.round((stats.general.completed_achievements / stats.general.total_achievements) * 100)
				: 0;

		return json({
			success: true,
			stats: {
				...stats.general,
				completionRate
			},
			byGame: stats.byGame,
			byTier: stats.byTier,
			pendingClaims,
			recentAchievements
		});
	} catch (error) {
		console.error('Error fetching achievement stats:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch achievement stats'
			},
			{ status: 500 }
		);
	}
}
