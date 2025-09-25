import { writable } from 'svelte/store';

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

    default:
      return false;
  }
}

// 베팅 타입별 배당률
const payouts = {
  straight: 35,    // 스트레이트 업 (단일 번호)
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
  column3: 2      // 세 번째 세로줄
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
  message: '베팅을 시작하세요!'
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

      return {
        ...state,
        gameState: 'spinning',
        isSpinning: true,
        wheelRotation: finalRotation,
        spinDuration,
        winningNumber,
        message: '룰렛이 돌아가고 있습니다...'
      };
    });

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
      return {
        ...state,
        gameState: 'betting',
        wheelRotation: state.wheelRotation, // 회전각도는 유지
        isSpinning: false,
        spinDuration: 0,
        winningNumber: null,
        bets: {},
        message: '새 게임을 시작하세요!'
      };
    });
  },

  // 게임 리셋 (잔고 초기화)
  resetGame() {
    rouletteStore.set(initialState);
  }
};

export { rouletteNumbers, numberColors };