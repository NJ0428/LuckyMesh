import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getOrCreateReferralCode } from '$lib/server/referrals.js';

export async function GET({ cookies }) {
	try {
		const sessionId = cookies.get('session');
		const sessionResult = validateSession(sessionId);

		if (!sessionResult.success) {
			return json(
				{ success: false, error: '로그인이 필요합니다.' },
				{ status: 401 }
			);
		}

		const result = await getOrCreateReferralCode(sessionResult.user.id);

		return json({ success: true, ...result });
	} catch (error) {
		console.error('Get referral code API error:', error);
		return json(
			{ success: false, error: '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
