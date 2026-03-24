import { json } from '@sveltejs/kit';
import { depositChips } from '$lib/server/deposits.js';

export async function POST({ locals, request }) {
  try {
    const user = locals.user;
    if (!user) {
      return json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return json({ success: false, error: '잘못된 입금액입니다.' }, { status: 400 });
    }

    const result = depositChips(user.id, amount);
    return json(result);
  } catch (error) {
    console.error('예치금 입금 오류:', error);
    return json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
