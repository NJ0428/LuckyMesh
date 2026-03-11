import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { claimReward } from '$lib/server/rankings.js';

export async function POST({ request }) {
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

    // 요청 바디 파싱
    const { rewardId } = await request.json();

    if (!rewardId) {
      return json({
        success: false,
        error: '보상 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 보상 수령
    const result = claimReward(rewardId, sessionResult.user.id);

    if (!result.success) {
      return json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

    return json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Claim reward API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
