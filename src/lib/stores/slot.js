import { writable } from 'svelte/store';

export const initialState = {
  gameState: 'ready', // ready, spinning, finished
  balance: 10000,
  currentBet: 100,
  betAmount: 100,

  // 슬롯 머신 상태
  reels: [
    { symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'], currentIndex: 0, isSpinning: false },
    { symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'], currentIndex: 0, isSpinning: false },
    { symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'], currentIndex: 0, isSpinning: false }
  ],

  // 결과
  result: [],
  winAmount: 0,
  totalWin: 0,

  // 메시지
  message: '베팅 금액을 선택하고 스핀 버튼을 누르세요!',

  // 게임 기록
  history: [],

  // 자동 플레이
  autoPlay: {
    enabled: false,
    spinsRemaining: 0
  },

  // 통계
  stats: {
    totalSpins: 0,
    totalWins: 0,
    biggestWin: 0,
    currentStreak: 0,
    bestStreak: 0
  }
};

export const slotStore = writable(initialState);

// 슬롯 심볼 설정 (가중치 포함)
export const SYMBOLS = [
  { icon: '🍒', name: 'cherry', value: 2, weight: 30 },
  { icon: '🍋', name: 'lemon', value: 3, weight: 25 },
  { icon: '🍊', name: 'orange', value: 4, weight: 20 },
  { icon: '🍇', name: 'grape', value: 5, weight: 15 },
  { icon: '🔔', name: 'bell', value: 10, weight: 8 },
  { icon: '💎', name: 'diamond', value: 20, weight: 5 },
  { icon: '7️⃣', name: 'seven', value: 50, weight: 2 }
];

// 페이라인 설정
export const PAYLINES = [
  [[0, 0], [1, 0], [2, 0]], // 상단
  [[0, 1], [1, 1], [2, 1]], // 중앙
  [[0, 2], [1, 2], [2, 2]], // 하단
  [[0, 0], [1, 1], [2, 2]], // 대각선 내려가기
  [[0, 2], [1, 1], [2, 0]]  // 대각선 올라가기
];

// 베팅 금액 옵션
export const BET_AMOUNTS = [10, 50, 100, 500, 1000, 5000];

// 유틸리티 함수
export function getRandomSymbol() {
  const totalWeight = SYMBOLS.reduce((sum, symbol) => sum + symbol.weight, 0);
  let random = Math.random() * totalWeight;

  for (const symbol of SYMBOLS) {
    random -= symbol.weight;
    if (random <= 0) return symbol;
  }

  return SYMBOLS[0]; // 기본값
}

export function checkWin(result) {
  let winAmount = 0;
  const winningLines = [];

  for (let i = 0; i < PAYLINES.length; i++) {
    const line = PAYLINES[i];
    const symbols = line.map(([reelIndex, symbolIndex]) =>
      result[reelIndex][symbolIndex]
    );

    // 모든 심볼이 같은지 확인
    if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) {
      const symbol = SYMBOLS.find(s => s.icon === symbols[0]);
      if (symbol) {
        const lineWin = symbol.value;
        winAmount += lineWin;
        winningLines.push({
          lineIndex: i,
          symbols: symbols,
          winAmount: lineWin
        });
      }
    }
  }

  return { winAmount, winningLines };
}

export function calculateTotalWin(winAmount, betAmount) {
  return winAmount * betAmount;
}

export function formatWinAmount(amount) {
  return new Intl.NumberFormat('ko-KR').format(amount);
}