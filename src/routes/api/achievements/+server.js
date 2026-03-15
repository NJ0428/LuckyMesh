import { json } from '@sveltejs/kit';
import { getAllAchievements } from '$lib/server/achievements.js';

export async function GET({ url }) {
	try {
		const gameType = url.searchParams.get('gameType');
		const category = url.searchParams.get('category');
		const tier = url.searchParams.get('tier');

		const filters = {};
		if (gameType) filters.gameType = gameType;
		if (category) filters.category = category;
		if (tier) filters.tier = tier;

		const achievements = getAllAchievements(filters);

		return json({
			success: true,
			achievements,
			filters
		});
	} catch (error) {
		console.error('Error fetching achievements:', error);
		return json(
			{
				success: false,
				error: 'Failed to fetch achievements'
			},
			{ status: 500 }
		);
	}
}
