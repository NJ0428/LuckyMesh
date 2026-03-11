import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getTournamentDetails } from '$lib/server/tournaments.js';

export async function GET({ request, params }) {
  try {
    // 세션 검증
    const sessionCookie = request.headers.get('cookie')?.match(/session=([^;]+)/);
    if (!sessionCookie) {
      return json({
        success: false,
        error: '로그인이 필요합니다.'
      }, { status: 401 });
    }

    const sessionResult = validateSession(sessionCookie[1]);
    if (!sessionResult.success) {
      return json({
        success: false,
        error: '유효하지 않은 세션입니다.'
      }, { status: 401 });
    }

    const tournamentId = parseInt(params.id);

    if (isNaN(tournamentId)) {
      return json({
        success: false,
        error: '유효하지 않은 토너먼트 ID입니다.'
      }, { status: 400 });
    }

    // 토너먼트 상세 조회
    const result = getTournamentDetails(tournamentId);

    if (!result.success) {
      return json({
        success: false,
        error: result.error
      }, { status: 404 });
    }

    return json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Tournament detail API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
