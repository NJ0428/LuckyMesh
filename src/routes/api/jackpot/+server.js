import { json } from '@sveltejs/kit';
import { jackpotStore, checkJackpotWin } from '../../../../lib/stores/jackpot.js';

// 잭팟 조회
export async function GET({ url }) {
  const gameType = url.searchParams.get('game');
  const type = url.searchParams.get('type') || 'all'; // all, global, game

  try {
    let data = {};

    if (type === 'global') {
      // 전체 프로그레시브 잭팟만 조회
      const unsubscribe = jackpotStore.subscribe(state => {
        data = {
          global: state.global,
          total: state.global.amount + Object.values(state.games).reduce((sum, game) => sum + game.amount, 0)
        };
      });
      unsubscribe();
    } else if (type === 'game' && gameType) {
      // 특정 게임 잭팟만 조회
      const unsubscribe = jackpotStore.subscribe(state => {
        data = {
          game: state.games[gameType] || null,
          global: state.global
        };
      });
      unsubscribe();
    } else {
      // 모든 잭팟 조회
      const unsubscribe = jackpotStore.subscribe(state => {
        data = {
          global: state.global,
          games: state.games,
          winners: state.winners.slice(0, 10),
          total: state.global.amount + Object.values(state.games).reduce((sum, game) => sum + game.amount, 0)
        };
      });
      unsubscribe();
    }

    return json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// 잭팟 적록 (베팅 시 호출)
export async function POST({ request }) {
  try {
    const { gameType, betAmount, userId } = await request.json();

    if (!gameType || !betAmount) {
      return json({
        success: false,
        error: '필수 파라미터가 누락되었습니다.'
      }, { status: 400 });
    }

    // 잭팟 적립
    jackpotStore.contribute(gameType, betAmount);

    // 잭팟 당첨 확인
    const winResult = checkJackpotWin(gameType, betAmount);

    let wonJackpot = null;

    // 잭팟 당첨 시
    if (winResult.won) {
      const gameJackpotData = await new Promise(resolve => {
        const unsubscribe = jackpotStore.subscribe(state => {
          resolve(state.games[gameType]);
        });
        unsubscribe();
      });

      // 전체 잭팟도 함께 당첨 (10% 확률)
      const alsoWinsGlobal = Math.random() < 0.1;

      wonJackpot = {
        game: {
          id: gameType,
          name: gameJackpotData?.name || '게임 잭팟',
          amount: gameJackpotData?.amount || 0
        },
        global: alsoWinsGlobal
      };

      // 잭팟 당첨 처리
      jackpotStore.win(gameType, { username: userId || '익명' });

      if (alsoWinsGlobal) {
        jackpotStore.win('global', { username: userId || '익명' });
      }
    }

    // 현재 잭팟 상태 반환
    const currentJackpots = await new Promise(resolve => {
      const unsubscribe = jackpotStore.subscribe(state => {
        resolve({
          global: state.global.amount,
          game: state.games[gameType]?.amount || 0
        });
      });
      unsubscribe();
    });

    return json({
      success: true,
      data: {
        contribution: {
          global: Math.floor(betAmount * 0.01),
          game: Math.floor(betAmount * 0.02)
        },
        currentJackpots,
        winResult: {
          won: winResult.won,
          jackpot: wonJackpot,
          chance: winResult.chance,
          reason: winResult.reason
        }
      }
    });

  } catch (error) {
    return json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
