import { writable } from 'svelte/store';
import { soundActions } from './soundSystem.js';

// 룰렛 번호와 색상 정의
const rouletteNumbers = [
  { number: 0, color: 'green' },
  { number: 32, color: 'red' },
  { number: 15, color: 'black' },
  { number: 19, color: 'red' },
  { number: 4, color: 'black' },
  { number: 21, color: 'red' },
  { number: 2, color: 'black' },
  { number: 25, color: 'red' },
  { number: 17, color: 'black' },
  { number: 34, color: 'red' },
  { number: 6, color: 'black' },
  { number: 27, color: 'red' },
  { number: 13, color: 'black' },
  { number: 36, color: 'red' },
  { number: 11, color: 'black' },
  { number: 30, color: 'red' },
  { number: 8, color: 'black' },
  { number: 23, color: 'red' },
  { number: 10, color: 'black' },
  { number: 5, color: 'red' },
  { number: 24, color: 'black' },
  { number: 16, color: 'red' },
  { number: 33, color: 'black' },
  { number: 1, color: 'red' },
  { number: 20, color: 'black' },
  { number: 14, color: 'red' },
  { number: 31, color: 'black' },
  { number: 9, color: 'red' },
  { number: 22, color: 'black' },
  { number: 18, color: 'red' },
  { number: 29, color: 'black' },
  { number: 7, color: 'red' },
  { number: 28, color: 'black' },
  { number: 12, color: 'red' },
  { number: 35, color: 'black' },
  { number: 3, color: 'red' },
  { number: 26, color: 'black' }
];

// 번호별 색상 매핑
const numberColors = {};
rouletteNumbers.forEach(item => {
  numberColors[item.number] = item.color;
});

// 베팅 타입별 당첨 체크 함수
function checkWin(betType, betValue, winningNumber) {
  const color = numberColors[winningNumber];

  switch (betType) {
    case 'straight':
      return winningNumber === parseInt(betValue);

    case 'split':
      // betValue는 "1,2" 형식의 문자열
      const splitNumbers = betValue.split(',').map(n => parseInt(n));
      return splitNumbers.includes(winningNumber);

    case 'street':
      // betValue는 "1,2,3" 형식의 문자열
      const streetNumbers = betValue.split(',').map(n => parseInt(n));
      return streetNumbers.includes(winningNumber);

    case 'corner':
      // betValue는 "1,2,4,5" 형식의 문자열
      const cornerNumbers = betValue.split(',').map(n => parseInt(n));
      return cornerNumbers.includes(winningNumber);

    case 'line':
      // betValue는 "1,2,3,4,5,6" 형식의 문자열
      const lineNumbers = betValue.split(',').map(n => parseInt(n));
      return lineNumbers.includes(winningNumber);

    case 'red':
      return color === 'red';

    case 'black':
      return color === 'black';

    case 'even':
      return winningNumber !== 0 && winningNumber % 2 === 0;

    case 'odd':
      return winningNumber !== 0 && winningNumber % 2 === 1;

    case 'low':
      return winningNumber >= 1 && winningNumber <= 18;

    case 'high':
      return winningNumber >= 19 && winningNumber <= 36;

    case 'dozen1':
      return winningNumber >= 1 && winningNumber <= 12;

    case 'dozen2':
      return winningNumber >= 13 && winningNumber <= 24;

    case 'dozen3':
      return winningNumber >= 25 && winningNumber <= 36;

    case 'column1':
      return winningNumber > 0 && (winningNumber - 1) % 3 === 0;

    case 'column2':
      return winningNumber > 0 && (winningNumber - 2) % 3 === 0;

    case 'column3':
      return winningNumber > 0 && winningNumber % 3 === 0;

    case 'neighbors':
      // betValue는 "17,2" (중앙번호, 양옆개수) 형식
      const [center, count] = betValue.split(',').map(n => parseInt(n));
      const wheelOrder = rouletteNumbers.map(n => n.number);
      const centerIndex = wheelOrder.indexOf(center);
      const neighbors = [];
      for (let i = -count; i <= count; i++) {
        const idx = (centerIndex + i + wheelOrder.length) % wheelOrder.length;
        neighbors.push(wheelOrder[idx]);
      }
      return neighbors.includes(winningNumber);

    case 'voisins':
      return frenchBets.voisins.includes(winningNumber);

    case 'tiers':
      return frenchBets.tiers.includes(winningNumber);

    case 'orphelins':
      return frenchBets.orphelins.includes(winningNumber);

    default:
      return false;
  }
}

// 베팅 타입별 배당률
const payouts = {
  straight: 35,    // 스트레이트 업 (단일 번호)
  split: 17,       // 스플릿 (2개 번호)
  street: 11,      // 스트리트 (3개 번호)
  corner: 8,       // 코너 (4개 번호)
  line: 5,         // 라인 (6개 번호)
  red: 1,         // 빨강
  black: 1,       // 검정
  even: 1,        // 짝수
  odd: 1,         // 홀수
  low: 1,         // 1-18
  high: 1,        // 19-36
  dozen1: 2,      // 1-12
  dozen2: 2,      // 13-24
  dozen3: 2,      // 25-36
  column1: 2,     // 첫 번째 세로줄
  column2: 2,     // 두 번째 세로줄
  column3: 2,     // 세 번째 세로줄
  neighbors: 35,  // 이웃 번호 (단일 번호와 동일)
  voisins: 17,    // Voisins du Zero (0 주변)
  tiers: 17,      // Tiers du Cylindre (휠 반대편)
  orphelins: 35   // Orphelins (고아 번호들)
};

// 프렌치 베팅 정의
const frenchBets = {
  voisins: [0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35],
  tiers: [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36],
  orphelins: [1, 6, 9, 14, 17, 20, 31, 34]
};

// 게임 상태 초기값
const initialState = {
  // 게임 진행 상태
  gameState: 'betting', // 'betting', 'spinning', 'finished'

  // 룰렛 휠
  wheelRotation: 0,
  isSpinning: false,
  spinDuration: 0,

  // 당첨 번호
  winningNumber: null,

  // 베팅들
  bets: {},

  // 플레이어 잔고
  balance: 10000,

  // 게임 히스토리
  history: [],

  // 메시지
  message: '베팅을 시작하세요!',

  // 베팅 타이머
  bettingTimeLimit: 30, // 초
  bettingTimeRemaining: 30,
  timerEnabled: false,
  autoSpinEnabled: false,

  // 즐겨찾기 베팅 패턴
  favoriteBets: [],
  lastBets: null,

  // 자동 플레이
  autoPlay: {
    enabled: false,
    spinsRemaining: 0,
    totalSpins: 0,
    stopOnWin: false,
    stopOnLoss: false,
    maxLoss: 0,
    maxWin: 0
  }
};

export const rouletteStore = writable(initialState);

// 게임 액션들
export const rouletteActions = {
  // 베팅
  placeBet(betType, betValue, amount) {
    console.log('rouletteActions.placeBet 호출됨:', { betType, betValue, amount });
    rouletteStore.update(state => {
      console.log('현재 상태:', { gameState: state.gameState, balance: state.balance });
      if (state.gameState !== 'betting' || state.balance < amount) {
        console.log('베팅 불가 조건:', { gameState: state.gameState, balance: state.balance, amount });
        return state;
      }

      const betKey = betValue ? `${betType}-${betValue}` : betType;
      const newBets = { ...state.bets };

      if (!newBets[betKey]) {
        newBets[betKey] = {
          type: betType,
          value: betValue,
          amount: 0
        };
      }

      newBets[betKey].amount += amount;

      // 베팅 사운드 재생
      soundActions?.playChipBet();

      return {
        ...state,
        bets: newBets,
        balance: state.balance - amount,
        message: `${amount}원을 베팅했습니다.`
      };
    });
  },

  // 베팅 초기화
  clearBets() {
    rouletteStore.update(state => {
      if (state.gameState !== 'betting') return state;

      const totalBets = Object.values(state.bets).reduce((sum, bet) => sum + bet.amount, 0);

      return {
        ...state,
        bets: {},
        balance: state.balance + totalBets,
        message: '베팅이 초기화되었습니다.'
      };
    });
  },

  // 스핀 시작
  spin() {
    rouletteStore.update(state => {
      const totalBets = Object.values(state.bets).reduce((sum, bet) => sum + bet.amount, 0);

      if (state.gameState !== 'betting' || totalBets === 0) {
        return { ...state, message: '먼저 베팅을 해주세요!' };
      }

      // 당첨 번호 결정 (랜덤)
      const winningNumber = Math.floor(Math.random() * 37); // 0-36

      // 휠 회전각도 계산 (당첨 번호에 맞춰)
      const numberIndex = rouletteNumbers.findIndex(item => item.number === winningNumber);
      const singleNumberAngle = 360 / rouletteNumbers.length;
      const targetAngle = numberIndex * singleNumberAngle;

      // 여러 바퀴 돌기 + 타겟 각도 (포인터는 12시 방향에 있으므로 270도 오프셋 추가)
      const totalRotations = 5 + Math.random() * 3; // 5-8바퀴
      const finalRotation = (totalRotations * 360) + (270 - targetAngle);

      const spinDuration = 3000 + Math.random() * 2000; // 3-5초

      // 스핀 사운드 재생
      soundActions?.playRouletteSpin();

      return {
        ...state,
        gameState: 'spinning',
        isSpinning: true,
        wheelRotation: finalRotation,
        spinDuration,
        winningNumber,
        lastBets: { ...state.bets }, // 마지막 베팅 저장
        message: '룰렛이 돌아가고 있습니다...'
      };
    });

    // 공 튕김 사운드 (2.5초 후)
    setTimeout(() => {
      soundActions?.playRouletteBounce();
    }, 2500);

    // 스핀 완료 후 결과 처리
    setTimeout(() => {
      rouletteActions.finishSpin();
    }, 4000); // 4초 후 결과 처리
  },

  // 스핀 완료 처리
  finishSpin() {
    rouletteStore.update(state => {
      if (!state.isSpinning) return state;

      let totalWinnings = 0;
      const winResults = [];

      // 각 베팅 체크
      Object.entries(state.bets).forEach(([betKey, bet]) => {
        const isWin = checkWin(bet.type, bet.value, state.winningNumber);
        if (isWin) {
          const payout = payouts[bet.type];
          const winAmount = bet.amount * (payout + 1); // 원금 + 상금
          totalWinnings += winAmount;
          winResults.push({ ...bet, winAmount, payout });
        }
      });

      // 히스토리 추가
      const gameResult = {
        winningNumber: state.winningNumber,
        winningColor: numberColors[state.winningNumber],
        bets: { ...state.bets },
        totalBet: Object.values(state.bets).reduce((sum, bet) => sum + bet.amount, 0),
        totalWinnings,
        netResult: totalWinnings - Object.values(state.bets).reduce((sum, bet) => sum + bet.amount, 0),
        timestamp: new Date()
      };

      const color = numberColors[state.winningNumber];
      const colorText = color === 'red' ? '빨강' : color === 'black' ? '검정' : '초록';

      // 종료 사운드 재생
      soundActions?.playRouletteFinal();

      // 승리/패배 사운드 재생 (0.3초 후)
      setTimeout(() => {
        if (totalWinnings > 0) {
          soundActions?.playWin();
        } else {
          soundActions?.playLose();
        }
      }, 300);

      return {
        ...state,
        gameState: 'finished',
        isSpinning: false,
        balance: state.balance + totalWinnings,
        history: [gameResult, ...state.history.slice(0, 19)], // 최근 20게임만 보관
        message: `${state.winningNumber} ${colorText}! ${totalWinnings > 0 ? `${totalWinnings}원 획득!` : '다음 게임에 도전하세요!'}`
      };
    });
  },

  // 새 게임 시작
  newGame() {
    rouletteStore.update(state => {
      // 자동 플레이 조건 체크
      rouletteActions.checkAutoPlayConditions();

      const newState = {
        ...state,
        gameState: 'betting',
        wheelRotation: state.wheelRotation, // 회전각도는 유지
        isSpinning: false,
        spinDuration: 0,
        winningNumber: null,
        bets: {},
        message: '새 게임을 시작하세요!'
      };

      // 자동 플레이가 활성화되어 있고 lastBets가 있으면 자동으로 베팅 반복
      if (state.autoPlay.enabled && state.autoPlay.spinsRemaining > 0 && state.lastBets) {
        const totalAmount = Object.values(state.lastBets).reduce((sum, bet) => sum + bet.amount, 0);
        if (state.balance >= totalAmount) {
          newState.bets = { ...state.lastBets };
          newState.balance = state.balance - totalAmount;

          // 자동 스핀
          setTimeout(() => rouletteActions.spin(), 1000);
        } else {
          newState.autoPlay = { ...state.autoPlay, enabled: false, spinsRemaining: 0 };
          newState.message = '잔고 부족으로 자동 플레이가 중지되었습니다.';
        }
      }

      return newState;
    });
  },

  // 게임 리셋 (잔고 초기화)
  resetGame() {
    rouletteStore.set(initialState);
  },

  // 타이머 설정
  setTimerEnabled(enabled) {
    rouletteStore.update(state => ({
      ...state,
      timerEnabled: enabled,
      bettingTimeRemaining: enabled ? state.bettingTimeLimit : 30
    }));
  },

  setAutoSpinEnabled(enabled) {
    rouletteStore.update(state => ({
      ...state,
      autoSpinEnabled: enabled
    }));
  },

  setBettingTimeLimit(seconds) {
    rouletteStore.update(state => ({
      ...state,
      bettingTimeLimit: seconds,
      bettingTimeRemaining: seconds
    }));
  },

  startBettingTimer() {
    rouletteStore.update(state => {
      if (!state.timerEnabled || state.gameState !== 'betting') return state;

      return {
        ...state,
        bettingTimeRemaining: state.bettingTimeLimit
      };
    });
  },

  decrementTimer() {
    rouletteStore.update(state => {
      if (!state.timerEnabled || state.gameState !== 'betting') return state;

      const newTime = state.bettingTimeRemaining - 1;

      if (newTime <= 0 && state.autoSpinEnabled && Object.keys(state.bets).length > 0) {
        // 자동 스핀
        setTimeout(() => rouletteActions.spin(), 100);
      }

      return {
        ...state,
        bettingTimeRemaining: Math.max(0, newTime)
      };
    });
  },

  // 즐겨찾기 베팅 패턴
  saveFavoriteBet(name) {
    rouletteStore.update(state => {
      const totalBets = Object.values(state.bets).reduce((sum, bet) => sum + bet.amount, 0);
      if (totalBets === 0) return state;

      const favorite = {
        id: Date.now(),
        name,
        bets: { ...state.bets },
        totalAmount: totalBets,
        createdAt: new Date()
      };

      return {
        ...state,
        favoriteBets: [...state.favoriteBets, favorite]
      };
    });
  },

  loadFavoriteBet(favoriteId) {
    rouletteStore.update(state => {
      const favorite = state.favoriteBets.find(f => f.id === favoriteId);
      if (!favorite || state.gameState !== 'betting') return state;

      const totalAmount = Object.values(favorite.bets).reduce((sum, bet) => sum + bet.amount, 0);
      if (state.balance < totalAmount) {
        return { ...state, message: '잔고가 부족합니다!' };
      }

      return {
        ...state,
        bets: { ...favorite.bets },
        balance: state.balance - totalAmount,
        message: `'${favorite.name}' 패턴을 불러왔습니다.`
      };
    });
  },

  deleteFavoriteBet(favoriteId) {
    rouletteStore.update(state => ({
      ...state,
      favoriteBets: state.favoriteBets.filter(f => f.id !== favoriteId)
    }));
  },

  repeatLastBet() {
    rouletteStore.update(state => {
      if (!state.lastBets || state.gameState !== 'betting') return state;

      const totalAmount = Object.values(state.lastBets).reduce((sum, bet) => sum + bet.amount, 0);
      if (state.balance < totalAmount) {
        return { ...state, message: '잔고가 부족합니다!' };
      }

      return {
        ...state,
        bets: { ...state.lastBets },
        balance: state.balance - totalAmount,
        message: '이전 베팅을 반복했습니다.'
      };
    });
  },

  // 자동 플레이
  startAutoPlay(spins, options = {}) {
    rouletteStore.update(state => ({
      ...state,
      autoPlay: {
        enabled: true,
        spinsRemaining: spins,
        totalSpins: spins,
        stopOnWin: options.stopOnWin || false,
        stopOnLoss: options.stopOnLoss || false,
        maxLoss: options.maxLoss || 0,
        maxWin: options.maxWin || 0
      }
    }));

    // 첫 스핀 시작
    if (Object.keys(rouletteStore.bets || {}).length > 0) {
      setTimeout(() => rouletteActions.spin(), 500);
    }
  },

  stopAutoPlay() {
    rouletteStore.update(state => ({
      ...state,
      autoPlay: {
        ...state.autoPlay,
        enabled: false,
        spinsRemaining: 0
      }
    }));
  },

  checkAutoPlayConditions() {
    rouletteStore.update(state => {
      if (!state.autoPlay.enabled || state.gameState !== 'finished') return state;

      const lastGame = state.history[0];

      // 중지 조건 체크
      if (state.autoPlay.stopOnWin && lastGame?.netResult > 0) {
        return {
          ...state,
          autoPlay: { ...state.autoPlay, enabled: false, spinsRemaining: 0 },
          message: '승리로 자동 플레이가 중지되었습니다.'
        };
      }

      if (state.autoPlay.stopOnLoss && lastGame?.netResult < 0) {
        return {
          ...state,
          autoPlay: { ...state.autoPlay, enabled: false, spinsRemaining: 0 },
          message: '패배로 자동 플레이가 중지되었습니다.'
        };
      }

      // 스핀 카운트 감소
      const spinsRemaining = state.autoPlay.spinsRemaining - 1;

      if (spinsRemaining <= 0) {
        return {
          ...state,
          autoPlay: { ...state.autoPlay, enabled: false, spinsRemaining: 0 },
          message: '자동 플레이가 완료되었습니다.'
        };
      }

      return {
        ...state,
        autoPlay: { ...state.autoPlay, spinsRemaining }
      };
    });
  }
};

export { rouletteNumbers, numberColors };