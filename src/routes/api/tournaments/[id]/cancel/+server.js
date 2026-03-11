import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { tournamentQueries, userQueries } from '$lib/server/database.js';

export async function POST({ request, params }) {
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
    // const user = sessionResult.data;
    // if (user.role !== 'admin') {
    //   return json({
    //     success: false,
    //     error: '관리자 권한이 필요합니다.'
    //   }, { status: 403 });
    // }

    const tournamentId = parseInt(params.id);

    if (isNaN(tournamentId)) {
      return json({
        success: false,
        error: '유효하지 않은 토너먼트 ID입니다.'
      }, { status: 400 });
    }

    // 토너먼트 조회
    const tournament = tournamentQueries.findById.get(tournamentId);
    if (!tournament) {
      return json({
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 이미 취소되었거나 종료된 토너먼트 확인
    if (tournament.status === 'cancelled' || tournament.status === 'completed') {
      return json({
        success: false,
        error: '이미 종료된 토너먼트입니다.'
      }, { status: 400 });
    }

    // 참가자들에게 참가비 환불
    const participants = tournamentQueries.findParticipantsByTournament.all(tournamentId);
    let refundCount = 0;

    participants.forEach(participant => {
      if (participant.entry_fee_paid > 0) {
        const user = userQueries.findById.get(participant.user_id);
        if (user) {
          userQueries.updateBalance.run(
            user.balance + participant.entry_fee_paid,
            participant.user_id
          );
          refundCount++;
        }
      }
    });

    // 토너먼트 상태 변경
    tournamentQueries.updateStatus.run('cancelled', tournamentId);

    return json({
      success: true,
      message: `토너먼트가 취소되었습니다. ${refundCount}명에게 참가비가 환불되었습니다.`,
      data: {
        refundCount
      }
    });
  } catch (error) {
    console.error('Cancel tournament API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
