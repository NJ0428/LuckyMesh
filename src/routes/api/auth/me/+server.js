import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';

export async function GET({ cookies }) {
  try {
    const sessionId = cookies.get('session');

    const result = validateSession(sessionId);

    if (result.success) {
      return json({
        success: true,
        user: result.user
      });
    } else {
      return json({
        success: false,
        error: result.error
      }, { status: 401 });
    }
  } catch (error) {
    console.error('User info API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}