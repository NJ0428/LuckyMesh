import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { supportQueries } from '$lib/server/database.js';

// GET - 티켓 상세 조회
export async function GET({ cookies, params }) {
  try {
    const sessionId = cookies.get('session');
    const authResult = validateSession(sessionId);

    if (!authResult.success) {
      return json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const ticketId = params.id;
    const userId = authResult.user.id;

    const ticket = supportQueries.getTicketById.get(ticketId);

    if (!ticket) {
      return json({
        success: false,
        error: '티켓을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 본인의 티켓인지 확인
    if (ticket.user_id !== userId) {
      return json({
        success: false,
        error: '접근 권한이 없습니다.'
      }, { status: 403 });
    }

    return json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Support ticket detail API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// PUT - 티켓 상태 업데이트
export async function PUT({ cookies, params, request }) {
  try {
    const sessionId = cookies.get('session');
    const authResult = validateSession(sessionId);

    if (!authResult.success) {
      return json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const ticketId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return json({
        success: false,
        error: '상태값은 필수 항목입니다.'
      }, { status: 400 });
    }

    const validStatuses = ['open', 'in_progress', 'answered', 'closed'];
    if (!validStatuses.includes(status)) {
      return json({
        success: false,
        error: '유효하지 않은 상태값입니다.'
      }, { status: 400 });
    }

    const ticket = supportQueries.getTicketById.get(ticketId);

    if (!ticket) {
      return json({
        success: false,
        error: '티켓을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    const userId = authResult.user.id;

    // 본인의 티켓인지 확인
    if (ticket.user_id !== userId) {
      return json({
        success: false,
        error: '접근 권한이 없습니다.'
      }, { status: 403 });
    }

    supportQueries.updateTicketStatus.run(status, ticketId);

    return json({
      success: true,
      message: '티켓 상태가 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('Support ticket PUT API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// POST - 티켓에 추가 메시지 (사용자)
export async function POST({ cookies, params, request }) {
  try {
    const sessionId = cookies.get('session');
    const authResult = validateSession(sessionId);

    if (!authResult.success) {
      return json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const ticketId = params.id;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return json({
        success: false,
        error: '메시지는 필수 항목입니다.'
      }, { status: 400 });
    }

    const ticket = supportQueries.getTicketById.get(ticketId);

    if (!ticket) {
      return json({
        success: false,
        error: '티켓을 찾을 수 없습니다.'
      }, { status: 404 });
    }

    const userId = authResult.user.id;

    // 본인의 티켓인지 확인
    if (ticket.user_id !== userId) {
      return json({
        success: false,
        error: '접근 권한이 없습니다.'
      }, { status: 403 });
    }

    // 티켓을 다시 open 상태로 변경 (답변이 왔을 경우)
    if (ticket.status === 'answered') {
      supportQueries.updateTicketStatus.run('in_progress', ticketId);
    }

    return json({
      success: true,
      message: '메시지가 추가되었습니다.'
    });
  } catch (error) {
    console.error('Support ticket POST API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
