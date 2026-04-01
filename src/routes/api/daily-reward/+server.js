import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { createDailyReward, claimDailyReward, checkDailyRewardAvailability } from '$lib/server/gachaSystem.js';

/**
 * GET /api/daily-reward
 * 오늘의 일일 보상 조회
 */
export async function GET({ request }) {
  try {
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

    const result = checkDailyRewardAvailability(sessionResult.user.id);

    if (!result.success) {
      return json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Daily reward API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * POST /api/daily-reward
 * 일일 보상 수령
 */
export async function POST({ request }) {
  try {
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

    const result = claimDailyReward(sessionResult.user.id);

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
    console.error('Claim daily reward API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
