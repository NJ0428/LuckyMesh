import { json } from '@sveltejs/kit';
import { gameQueries } from '$lib/server/database.js';
import { verifySession } from '$lib/server/auth.js';

export async function GET({ cookies }) {
  try {
    // 세션 검증
    const sessionId = cookies.get('session');
    if (!sessionId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySession(sessionId);
    if (!session) {
      return json({ error: 'Invalid session' }, { status: 401 });
    }

    // 사용자의 게임 기록 조회 (최대 100개)
    const gameHistory = gameQueries.findByUserId.all(session.user_id);

    // 데이터 형태 변환 (net_result 필드 추가)
    const formattedHistory = gameHistory.map(game => ({
      ...game,
      net_result: (game.win_amount || 0) - (game.bet_amount || 0)
    }));

    return json(formattedHistory);
  } catch (error) {
    console.error('Error fetching game history:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}