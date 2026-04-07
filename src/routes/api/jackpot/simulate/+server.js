import { json } from '@sveltejs/kit';
import { jackpotStore } from '../../../../../lib/stores/jackpot.js';

// 잭팟 시뮬레이션 (다른 유저의 베팅으로 인한 증가 효과)
export async function POST({ request }) {
  try {
    const { count = 10 } = await request.json().catch(() => ({}));

    const results = [];

    for (let i = 0; i < count; i++) {
      // 잭팟 증가 시뮬레이션
      jackpotStore.simulateIncrease();

      // 현재 상태 조회
      const currentData = await new Promise(resolve => {
        const unsubscribe = jackpotStore.subscribe(state => {
          resolve({
            global: state.global.amount,
            games: Object.fromEntries(
              Object.entries(state.games).map(([id, game]) => [id, game.amount])
            )
          });
        });
        unsubscribe();
      });

      results.push({
        iteration: i + 1,
        ...currentData
      });

      // 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return json({
      success: true,
      data: {
        results,
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

// GET 요청으로도 시뮬레이션 가능
export async function GET({ url }) {
  try {
    const count = parseInt(url.searchParams.get('count') || '10');

    const results = [];

    for (let i = 0; i < count; i++) {
      jackpotStore.simulateIncrease();

      const currentData = await new Promise(resolve => {
        const unsubscribe = jackpotStore.subscribe(state => {
          resolve({
            global: state.global.amount,
            games: Object.fromEntries(
              Object.entries(state.games).map(([id, game]) => [id, game.amount])
            )
          });
        });
        unsubscribe();
      });

      results.push({
        iteration: i + 1,
        ...currentData
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return json({
      success: true,
      data: {
        results,
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
