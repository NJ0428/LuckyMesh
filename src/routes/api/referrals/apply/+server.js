import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { applyReferralCode } from '$lib/server/referrals.js';

export async function POST({ cookies, request }) {
	try {
		const sessionId = cookies.get('session');
		const sessionResult = validateSession(sessionId);

		if (!sessionResult.success) {
			return json(
				{ success: false, error: '로그인이 필요합니다.' },
				{ status: 401 }
			);
		}

		const { code } = await request.json();

		if (!code) {
			return json({ success: false, error: '추천 코드가 필요합니다.' }, { status: 400 });
		}

		const result = await applyReferralCode(sessionResult.user.id, code);

		return json(result);
	} catch (error) {
		console.error('Apply referral code API error:', error);
		return json(
			{ success: false, error: error.message || '서버 오류가 발생했습니다.' },
			{ status: 500 }
		);
	}
}
