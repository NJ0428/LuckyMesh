import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { supportQueries } from '$lib/server/database.js';

// GET - 티켓 목록 조회
export async function GET({ cookies, url }) {
  try {
    const sessionId = cookies.get('session');
    const authResult = validateSession(sessionId);

    if (!authResult.success) {
      return json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const userId = authResult.user.id;
    const status = url.searchParams.get('status');

    let tickets;
    if (status) {
      tickets = supportQueries.getTicketsByStatus.all(status);
    } else {
      tickets = supportQueries.getTicketsByUserId.all(userId);
    }

    return json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Support tickets API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// POST - 새 티켓 생성
export async function POST({ cookies, request }) {
  try {
    const sessionId = cookies.get('session');
    const authResult = validateSession(sessionId);

    if (!authResult.success) {
      return json({
        success: false,
        error: '인증이 필요합니다.'
      }, { status: 401 });
    }

    const body = await request.json();
    const { category, subject, message, priority = 'normal' } = body;

    // 필수 필드 검증
    if (!category || !subject || !message) {
      return json({
        success: false,
        error: '카테고리, 제목, 내용은 필수 항목입니다.'
      }, { status: 400 });
    }

    // 유효한 카테고리 확인
    const validCategories = ['account', 'payment', 'game', 'technical', 'bug', 'suggestion', 'other'];
    if (!validCategories.includes(category)) {
      return json({
        success: false,
        error: '유효하지 않은 카테고리입니다.'
      }, { status: 400 });
    }

    // 유효한 우선순위 확인
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return json({
        success: false,
        error: '유효하지 않은 우선순위입니다.'
      }, { status: 400 });
    }

    const userId = authResult.user.id;

    const result = supportQueries.createTicket.run(
      userId,
      category,
      subject,
      message,
      priority
    );

    return json({
      success: true,
      ticketId: result.lastInsertRowid,
      message: '티켓이 생성되었습니다.'
    });
  } catch (error) {
    console.error('Support tickets POST API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
