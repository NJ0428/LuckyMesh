import { json } from '@sveltejs/kit';
import { getDepositStats } from '$lib/server/deposits.js';

export async function GET({ locals }) {
  try {
    const user = locals.user;
    if (!user) {
      return json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const result = getDepositStats();
    return json(result);
  } catch (error) {
    console.error('예치금 통계 조회 오류:', error);
    return json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
