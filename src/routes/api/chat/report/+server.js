import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
	try {
		const sessionId = cookies.get('session');
		const authResult = validateSession(sessionId);

		if (!authResult.success) {
			return json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
		}

		const { messageId, reportedUserId, reason } = await request.json();

		// 입력 검증
		if (!messageId || !reportedUserId || !reason) {
			return json(
				{ success: false, error: '필수 정보를 모두 입력해주세요.' },
				{ status: 400 }
			);
		}

		// 신고 사유 검증
		const validReasons = ['profanity', 'spam', 'harassment', 'inappropriate', 'other'];
		if (!validReasons.includes(reason)) {
			return json({ success: false, error: '유효하지 않은 신고 사유입니다.' }, { status: 400 });
		}

		// 실제 구현에서는 데이터베이스에 신고 기록 저장
		// 여기서는 성공 응답만 반환
		console.log('Chat report:', {
			reporterId: authResult.user.id,
			messageId,
			reportedUserId,
			reason,
			timestamp: new Date().toISOString()
		});

		return json({
			success: true,
			message: '신고가 접수되었습니다. 검토 후 조치하겠습니다.'
		});
	} catch (error) {
		console.error('Chat report error:', error);
		return json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
	}
}
