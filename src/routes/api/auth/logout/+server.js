import { json } from '@sveltejs/kit';
import { logoutUser } from '$lib/server/auth.js';

export async function POST({ cookies }) {
  try {
    const sessionId = cookies.get('session');

    if (sessionId) {
      const result = logoutUser(sessionId);

      if (result.success) {
        // 세션 쿠키 삭제
        cookies.delete('session', { path: '/' });

        return json({
          success: true,
          message: '로그아웃되었습니다.'
        });
      } else {
        return json({
          success: false,
          error: result.error
        }, { status: 400 });
      }
    } else {
      return json({
        success: false,
        error: '로그인 상태가 아닙니다.'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Logout API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}