import { json } from '@sveltejs/kit';
import { createDepositAccount, getDepositAccount } from '$lib/server/deposits.js';

export async function GET({ locals }) {
  try {
    const user = locals.user;
    if (!user) {
      return json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const result = getDepositAccount(user.id);
    return json(result);
  } catch (error) {
    console.error('예치금 계좌 조회 오류:', error);
    return json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST({ locals, request }) {
  try {
    const user = locals.user;
    if (!user) {
      return json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { initialAmount = 0, interestType = 'daily' } = body;

    if (initialAmount < 0) {
      return json({ success: false, error: '잘못된 입금액입니다.' }, { status: 400 });
    }

    if (!['daily', 'weekly'].includes(interestType)) {
      return json({ success: false, error: '잘못된 이자 지급 주기입니다.' }, { status: 400 });
    }

    const result = createDepositAccount(user.id, initialAmount, interestType);
    return json(result);
  } catch (error) {
    console.error('예치금 계좌 생성 오류:', error);
    return json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
