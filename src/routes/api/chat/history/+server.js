import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';

export async function GET({ url, cookies }) {
	try {
		const sessionId = cookies.get('session');
		const authResult = validateSession(sessionId);

		if (!authResult.success) {
			return json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
		}

		const room = url.searchParams.get('room') || 'global';
		const limit = parseInt(url.searchParams.get('limit') || '50');

		// 실제 구현에서는 데이터베이스에서 채팅 기록 조회
		// 여기서는 샘플 데이터 반환
		const sampleMessages = [
			{
				id: 'msg_1',
				userId: 1,
				username: 'Admin',
				avatar: null,
				message: '채팅방에 오신 것을 환영합니다!',
				timestamp: new Date(Date.now() - 3600000).toISOString()
			},
			{
				id: 'msg_2',
				userId: 2,
				username: 'Player123',
				avatar: null,
				message: '안녕하세요! 오늘 운이 좋네요 🎰',
				timestamp: new Date(Date.now() - 1800000).toISOString()
			},
			{
				id: 'msg_3',
				userId: 3,
				username: 'LuckyWinner',
				avatar: null,
				message: '블랙잭에서 대승했어요! 💯',
				timestamp: new Date(Date.now() - 900000).toISOString()
			}
		];

		return json({
			success: true,
			messages: sampleMessages.slice(0, limit)
		});
	} catch (error) {
		console.error('Chat history error:', error);
		return json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
	}
}
