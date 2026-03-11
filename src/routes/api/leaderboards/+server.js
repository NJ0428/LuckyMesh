import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getRankings, getPeriod } from '$lib/server/rankings.js';

export async function GET({ request, url }) {
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

    // 쿼리 파라미터 추출
    const rankingType = url.searchParams.get('type') || 'daily';
    const gameType = url.searchParams.get('game') || 'all';
    const vipTier = url.searchParams.get('vip') || 'all';

    // 유효성 검사
    const validRankingTypes = ['daily', 'weekly', 'monthly'];
    const validGameTypes = ['blackjack', 'baccarat', 'roulette', 'slots', 'poker', 'sicbo', 'all'];
    const validVipTiers = ['silver', 'gold', 'platinum', 'all'];

    if (!validRankingTypes.includes(rankingType)) {
      return json({
        success: false,
        error: '유효하지 않은 랭킹 타입입니다.'
      }, { status: 400 });
    }

    if (!validGameTypes.includes(gameType)) {
      return json({
        success: false,
        error: '유효하지 않은 게임 타입입니다.'
      }, { status: 400 });
    }

    if (!validVipTiers.includes(vipTier)) {
      return json({
        success: false,
        error: '유효하지 않은 VIP 등급입니다.'
      }, { status: 400 });
    }

    // 기간 계산
    const period = getPeriod(rankingType);

    // 랭킹 조회
    const result = getRankings(rankingType, gameType, vipTier, period.start, period.end);

    if (!result.success) {
      return json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return json({
      success: true,
      data: {
        rankings: result.data,
        period: {
          start: period.start,
          end: period.end
        }
      }
    });
  } catch (error) {
    console.error('Leaderboards API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
