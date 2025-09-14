import { json } from '@sveltejs/kit';
import { registerUser } from '$lib/server/auth.js';

export async function POST({ request, cookies }) {
  try {
    const { username, email, password, fullName, phone, dateOfBirth } = await request.json();

    const result = await registerUser({
      username,
      email,
      password,
      fullName,
      phone,
      dateOfBirth
    });

    if (result.success) {
      return json({
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: result.user
      });
    } else {
      return json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}