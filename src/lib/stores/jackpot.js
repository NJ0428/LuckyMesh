import { writable, derived } from 'svelte/store';

// 잭팟 초기 상태
const initialState = {
  // 전체 프로그레시브 잭팟 (모든 게임 베팅의 일부가 적립)
  global: {
    id: 'global',
    name: '메가 잭팟',
    amount: 50000000, // 초기 5천만원
    contributionRate: 0.01, // 1% 적립
    minBet: 100,
    lastWinner: null,
    lastWinTime: null,
    lastWinAmount: 0
  },

  // 게임별 독립 잭팟
  games: {
    slots: {
      id: 'slots',
      name: '슬롯 머신 잭팟',
      amount: 10000000, // 초기 1천만원
      contributionRate: 0.02, // 2% 적립
      minBet: 50,
      winChance: 0.0001, // 0.01% 당첨 확률
      lastWinner: null,
      lastWinTime: null,
      lastWinAmount: 0
    },
    blackjack: {
      id: 'blackjack',
      name: '블랙잭 잭팟',
      amount: 5000000,
      contributionRate: 0.015,
      minBet: 100,
      winChance: 0.00005,
      lastWinner: null,
      lastWinTime: null,
      lastWinAmount: 0
    },
    roulette: {
      id: 'roulette',
      name: '룰렛 잭팟',
      amount: 8000000,
      contributionRate: 0.015,
      minBet: 50,
      winChance: 0.00008,
      lastWinner: null,
      lastWinTime: null,
      lastWinAmount: 0
    },
    baccarat: {
      id: 'baccarat',
      name: '바카라 잭팟',
      amount: 15000000,
      contributionRate: 0.02,
      minBet: 100,
      winChance: 0.00006,
      lastWinner: null,
      lastWinTime: null,
      lastWinAmount: 0
    },
    poker: {
      id: 'poker',
      name: '포커 잭팟',
      amount: 20000000,
      contributionRate: 0.025,
      minBet: 200,
      winChance: 0.00004,
      lastWinner: null,
      lastWinTime: null,
      lastWinAmount: 0
    },
    sicbo: {
      id: 'sicbo',
      name: '식보 잭팟',
      amount: 7000000,
      contributionRate: 0.015,
      minBet: 50,
      winChance: 0.00007,
      lastWinner: null,
      lastWinTime: null,
      lastWinAmount: 0
    }
  },

  // 잭팟 당첨 내역
  winners: [],

  // 현재 표시 모드
  displayMode: 'carousel' // carousel, list, single
};

// 스토어 생성
function createJackpotStore() {
  const { subscribe, set, update } = writable(initialState);

  // 로컬 스토리지에서 불러오기
  function loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jackpotStore');
        if (saved) {
          const parsed = JSON.parse(saved);
          update(state => ({ ...state, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load jackpot store:', e);
      }
    }
  }

  // 로컬 스토리지에 저장
  function saveToStorage(state) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jackpotStore', JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save jackpot store:', e);
      }
    }
  }

  // 초기 로드
  loadFromStorage();

  return {
    subscribe,

    // 베팅 금액의 일부를 잭팟에 적립
    contribute: (gameType, betAmount) => {
      update(state => {
        const newState = { ...state };

        // 전체 잭팟 적립
        const globalContribution = Math.floor(betAmount * newState.global.contributionRate);
        newState.global.amount += globalContribution;

        // 게임별 잭팟 적립
        if (newState.games[gameType]) {
          const gameContribution = Math.floor(betAmount * newState.games[gameType].contributionRate);
          newState.games[gameType].amount += gameContribution;
        }

        saveToStorage(newState);
        return newState;
      });
    },

    // 잭팟 당첨 처리
    win: (jackpotId, winner) => {
      update(state => {
        const newState = { ...state };
        let winAmount = 0;

        if (jackpotId === 'global') {
          winAmount = newState.global.amount;
          newState.global = {
            ...newState.global,
            amount: 50000000, // 초기값으로 리셋
            lastWinner: winner.username || '익명',
            lastWinTime: new Date().toISOString(),
            lastWinAmount: winAmount
          };
        } else if (newState.games[jackpotId]) {
          winAmount = newState.games[jackpotId].amount;
          const initialAmounts = {
            slots: 10000000,
            blackjack: 5000000,
            roulette: 8000000,
            baccarat: 15000000,
            poker: 20000000,
            sicbo: 7000000
          };

          newState.games[jackpotId] = {
            ...newState.games[jackpotId],
            amount: initialAmounts[jackpotId],
            lastWinner: winner.username || '익명',
            lastWinTime: new Date().toISOString(),
            lastWinAmount: winAmount
          };
        }

        // 당첨자 기록 추가
        newState.winners.unshift({
          id: Date.now(),
          jackpotId,
          jackpotName: jackpotId === 'global' ? '메가 잭팟' : newState.games[jackpotId]?.name,
          username: winner.username || '익명',
          amount: winAmount,
          timestamp: new Date().toISOString()
        });

        // 최대 100개 기록 유지
        if (newState.winners.length > 100) {
          newState.winners = newState.winners.slice(0, 100);
        }

        saveToStorage(newState);
        return newState;
      });
    },

    // 특정 게임의 잭팟 정보 조회
    getGameJackpot: (gameType) => {
      let jackpotData;
      const unsubscribe = subscribe(state => {
        jackpotData = state.games[gameType];
      })();
      unsubscribe();
      return jackpotData;
    },

    // 전체 잭팟 금액 조회
    getTotalJackpot: () => {
      let total = 0;
      const unsubscribe = subscribe(state => {
        total = state.global.amount;
      })();
      unsubscribe();
      return total;
    },

    // 잭팟 금액 증가 (시뮬레이션용 - 다른 유저의 베팅으로 인한 증가 효과)
    simulateIncrease: () => {
      update(state => {
        const newState = { ...state };

        // 전체 잭팟 미세 증가
        const globalIncrease = Math.floor(Math.random() * 100) + 10;
        newState.global.amount += globalIncrease;

        // 각 게임별 미세 증가
        Object.keys(newState.games).forEach(gameId => {
          const increase = Math.floor(Math.random() * 50) + 5;
          newState.games[gameId].amount += increase;
        });

        saveToStorage(newState);
        return newState;
      });
    },

    // 표시 모드 변경
    setDisplayMode: (mode) => {
      update(state => {
        const newState = { ...state, displayMode: mode };
        saveToStorage(newState);
        return newState;
      });
    },

    // 리셋
    reset: () => {
      set(initialState);
      saveToStorage(initialState);
    }
  };
}

export const jackpotStore = createJackpotStore();

// 파생 스토어
export const globalJackpot = derived(jackpotStore, $jackpotStore => $jackpotStore.global);

export const gameJackpots = derived(jackpotStore, $jackpotStore => $jackpotStore.games);

export const totalJackpotAmount = derived(jackpotStore, $jackpotStore => {
  const gameTotal = Object.values($jackpotStore.games).reduce((sum, game) => sum + game.amount, 0);
  return $jackpotStore.global.amount + gameTotal;
});

export const recentWinners = derived(jackpotStore, $jackpotStore =>
  $jackpotStore.winners.slice(0, 10)
);

// 유틸리티 함수
export function formatJackpotAmount(amount) {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  }
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

export function getContributionDisplay(rate) {
  return `${(rate * 100).toFixed(1)}%`;
}

// 잭팟 당첨 확률 계산
export function checkJackpotWin(gameType, betAmount) {
  let jackpotData;
  const unsubscribe = jackpotStore.subscribe(state => {
    jackpotData = state.games[gameType];
  })();
  unsubscribe();

  if (!jackpotData || betAmount < jackpotData.minBet) {
    return { won: false, reason: '최소 베팅 금액 미달' };
  }

  // 베팅 금액이 높을수록 당첨 확률 증가
  const betMultiplier = betAmount / jackpotData.minBet;
  const adjustedChance = jackpotData.winChance * Math.min(betMultiplier, 10);

  const won = Math.random() < adjustedChance;

  return {
    won,
    chance: adjustedChance,
    reason: won ? '축하합니다!' : '다음 기회에...'
  };
}
