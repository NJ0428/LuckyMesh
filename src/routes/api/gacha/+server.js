import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { performGachaSpin, checkGachaAvailability, getGachaHistory } from '$lib/server/gachaSystem.js';

/**
 * GET /api/gacha
 * 뽑기 가능 여부 확인 또는 뽑기 내역 조회
 */
export async function GET({ request, url }) {
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

    const action = url.searchParams.get('action');

    if (action === 'history') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const result = getGachaHistory(sessionResult.user.id, limit);

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
    } else {
      // 기본 동작: 뽑기 가능 여부 확인
      const result = checkGachaAvailability(sessionResult.user.id);

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
    }
  } catch (error) {
    console.error('Gacha API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

/**
 * POST /api/gacha
 * 룰렛 뽑기 실행
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

    const { isFreeSpin = true } = await request.json();

    const result = performGachaSpin(sessionResult.user.id, isFreeSpin);

    if (!result.success) {
      return json({
        success: false,
        error: result.error,
        remaining_free_spins: result.remaining_free_spins
      }, { status: 400 });
    }

    return json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Gacha spin API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
