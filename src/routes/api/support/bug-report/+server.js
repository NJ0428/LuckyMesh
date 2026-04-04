import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { supportQueries } from '$lib/server/database.js';

// GET - 버그 리포트 목록 조회
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
    const reports = supportQueries.getBugReportsByUserId.all(userId);

    return json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Bug reports GET API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// POST - 새 버그 리포트 생성
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
    const {
      title,
      description,
      reproduction_steps,
      severity = 'medium',
      device_info,
      browser_info,
      screenshots
    } = body;

    // 필수 필드 검증
    if (!title || !description) {
      return json({
        success: false,
        error: '제목과 설명은 필수 항목입니다.'
      }, { status: 400 });
    }

    // 유효한 심각도 확인
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return json({
        success: false,
        error: '유효하지 않은 심각도입니다.'
      }, { status: 400 });
    }

    const userId = authResult.user.id;

    // 브라우저 정보 자동 수집 (제공되지 않은 경우)
    let deviceInfo = device_info;
    let browserInfo = browser_info;

    if (!browserInfo) {
      // 기본 브라우저 정보 수집
      const userAgent = request.headers.get('user-agent') || '';
      browserInfo = JSON.stringify({
        userAgent,
        language: request.headers.get('accept-language') || '',
        timestamp: new Date().toISOString()
      });
    }

    const result = supportQueries.createBugReport.run(
      userId,
      title,
      description,
      reproduction_steps || null,
      severity,
      deviceInfo || null,
      browserInfo || null,
      screenshots || null
    );

    return json({
      success: true,
      reportId: result.lastInsertRowid,
      message: '버그 리포트가 제출되었습니다. 빠른 시일 내에 검토하겠습니다.'
    });
  } catch (error) {
    console.error('Bug report POST API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
