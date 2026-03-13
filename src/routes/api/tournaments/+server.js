import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { getTournaments, createTournament, initializeDefaultTournaments } from '$lib/server/tournaments.js';

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
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    // 유효성 검사
    const validStatuses = ['scheduled', 'registration', 'ongoing', 'completed', 'cancelled'];
    const validTypes = ['daily', 'weekly', 'special'];

    if (status && !validStatuses.includes(status)) {
      return json({
        success: false,
        error: '유효하지 않은 상태입니다.'
      }, { status: 400 });
    }

    if (type && !validTypes.includes(type)) {
      return json({
        success: false,
        error: '유효하지 않은 토너먼트 타입입니다.'
      }, { status: 400 });
    }

    // 토너먼트 목록 조회
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const result = getTournaments(filters);

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
    console.error('Tournaments API GET error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

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

    // 관리자 권한 확인 (실제로는 role 컬럼 등으로 확인 필요)
    const user = sessionResult.data;
    // 여기서는 admin 확인 없이 진행 (실제 구현시 꼭 필요)

    const body = await request.json();

    // 필수 필드 확인
    const requiredFields = ['name', 'tournamentType', 'gameType', 'registrationStart', 'registrationEnd', 'tournamentStart', 'tournamentEnd'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return json({
          success: false,
          error: `${field} 필드는 필수입니다.`
        }, { status: 400 });
      }
    }

    // 유효성 검사
    const validTypes = ['daily', 'weekly', 'special'];
    const validGameTypes = ['blackjack', 'baccarat', 'roulette', 'slots', 'poker', 'sicbo', 'all'];
    const validVipTiers = ['all', 'silver', 'gold', 'platinum'];

    if (!validTypes.includes(body.tournamentType)) {
      return json({
        success: false,
        error: '유효하지 않은 토너먼트 타입입니다.'
      }, { status: 400 });
    }

    if (!validGameTypes.includes(body.gameType)) {
      return json({
        success: false,
        error: '유효하지 않은 게임 타입입니다.'
      }, { status: 400 });
    }

    if (body.vipTierRequired && !validVipTiers.includes(body.vipTierRequired)) {
      return json({
        success: false,
        error: '유효하지 않은 VIP 등급입니다.'
      }, { status: 400 });
    }

    // 기간 유효성 검사
    const regStart = new Date(body.registrationStart);
    const regEnd = new Date(body.registrationEnd);
    const tourStart = new Date(body.tournamentStart);
    const tourEnd = new Date(body.tournamentEnd);

    if (regStart >= regEnd) {
      return json({
        success: false,
        error: '참가 신청 종료 시간은 시작 시간보다 늦어야 합니다.'
      }, { status: 400 });
    }

    if (tourStart >= tourEnd) {
      return json({
        success: false,
        error: '토너먼트 종료 시간은 시작 시간보다 늦어야 합니다.'
      }, { status: 400 });
    }

    if (regEnd > tourStart) {
      return json({
        success: false,
        error: '참가 신청 종료 시간은 토너먼트 시작 시간보다 빨라야 합니다.'
      }, { status: 400 });
    }

    // 토너먼트 생성
    const result = createTournament({
      name: body.name,
      description: body.description || null,
      tournamentType: body.tournamentType,
      gameType: body.gameType,
      entryFee: body.entryFee || 0,
      prizePool: body.prizePool || 0,
      minParticipants: body.minParticipants || 10,
      maxParticipants: body.maxParticipants || 1000,
      registrationStart: body.registrationStart,
      registrationEnd: body.registrationEnd,
      tournamentStart: body.tournamentStart,
      tournamentEnd: body.tournamentEnd,
      prizeDistributionType: body.prizeDistributionType || 'percentage',
      totalPrizes: body.totalPrizes || 10,
      vipTierRequired: body.vipTierRequired || 'all',
      minBalanceRequired: body.minBalanceRequired || 0,
      autoStart: body.autoStart !== undefined ? body.autoStart : true,
      createdBy: user.user_id,
      prizes: body.prizes || []
    });

    if (!result.success) {
      return json({
        success: false,
        error: result.error
      }, { status: 500 });
    }

    return json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Tournaments API POST error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
