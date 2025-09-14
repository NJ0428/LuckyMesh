import { json } from '@sveltejs/kit';
import { loginUser } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();

    const result = await loginUser(email, password);

    if (result.success) {
      // 세션 쿠키 설정
      cookies.set('session', result.sessionId, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 // 7일
      });

      return json({
        success: true,
        message: '로그인되었습니다.',
        user: result.user
      });
    } else {
      return json({
        success: false,
        error: result.error
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}