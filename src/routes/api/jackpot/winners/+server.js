import { json } from '@sveltejs/kit';
import { jackpotStore } from '../../../../../lib/stores/jackpot.js';

// 최근 잭팟 당첨자 목록 조회
export async function GET({ url }) {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const jackpotId = url.searchParams.get('jackpotId'); // 특정 잭팟 필터링

    let winners = await new Promise(resolve => {
      const unsubscribe = jackpotStore.subscribe(state => {
        let filtered = state.winners;

        if (jackpotId) {
          filtered = filtered.filter(w => w.jackpotId === jackpotId);
        }

        resolve(filtered.slice(0, limit));
      });
      unsubscribe();
    });

    return json({
      success: true,
      data: {
        winners,
        count: winners.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// 잭팟 당첨 처리 (관리자용 또는 테스트용)
export async function POST({ request }) {
  try {
    const { jackpotId, username, force = false } = await request.json();

    if (!jackpotId) {
      return json({
        success: false,
        error: '잭팟 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 실제 당첨이 아닌 경우 (테스트용)
    if (!force) {
      // 잭팟 당첨 확률 검증 로직이 여기에 들어갈 수 있습니다.
      // 현재는 바로 당첨 처리합니다.
    }

    jackpotStore.win(jackpotId, { username: username || '테스트 유저' });

    // 당첨 후 상태 조회
    const updatedState = await new Promise(resolve => {
      const unsubscribe = jackpotStore.subscribe(state => {
        resolve({
          global: state.global,
          games: state.games,
          lastWinner: state.winners[0]
        });
      });
      unsubscribe();
    });

    return json({
      success: true,
      data: {
        message: '잭팟 당첨이 처리되었습니다.',
        jackpotId,
        winner: updatedState.lastWinner,
        newAmount: jackpotId === 'global'
          ? updatedState.global.amount
          : updatedState.games[jackpotId]?.amount || 0
      }
    });

  } catch (error) {
    return json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
