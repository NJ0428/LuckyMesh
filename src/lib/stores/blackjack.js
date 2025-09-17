import { writable } from 'svelte/store';

// 카드 덱 생성
function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];

  // 6덱 블랙잭
  for (let deckNum = 0; deckNum < 6; deckNum++) {
    for (let suit of suits) {
      for (let value of values) {
        deck.push({ suit, value, id: `${suit}${value}-${deckNum}` });
      }
    }
  }

  return shuffle(deck);
}

// 카드 셔플
function shuffle(deck) {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

// 카드 값 계산 (블랙잭 규칙)
function getCardValue(card) {
  if (card.value === 'A') return 11; // 일단 11로 계산, 나중에 조정
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  return parseInt(card.value);
}

// 핸드 점수 계산
function calculateHandValue(hand) {
  let sum = 0;
  let aces = 0;

  // 먼저 A가 아닌 카드들의 합계 계산
  for (let card of hand) {
    if (card.value === 'A') {
      aces++;
      sum += 11;
    } else {
      sum += getCardValue(card);
    }
  }

  // A를 1로 변환하여 버스트 방지
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }

  return sum;
}

// 핸드가 소프트인지 확인 (A가 11로 계산되고 있는 경우)
function isSoftHand(hand) {
  const hasAce = hand.some(card => card.value === 'A');
  const sum = calculateHandValue(hand);

  if (!hasAce) return false;

  // A가 1로만 계산되는 경우를 확인
  let sumWithAcesAsOne = 0;
  for (let card of hand) {
    if (card.value === 'A') {
      sumWithAcesAsOne += 1;
    } else {
      sumWithAcesAsOne += getCardValue(card);
    }
  }

  return sum !== sumWithAcesAsOne;
}

// 딜러의 행동 결정 (17 이상에서 스탠드)
function shouldDealerHit(hand) {
  const value = calculateHandValue(hand);

  // 하드 17 이상에서는 항상 스탠드
  if (value >= 18) return false;

  // 소프트 17에서는 히트 (일반적인 카지노 규칙)
  if (value === 17 && isSoftHand(hand)) return true;

  // 하드 17에서는 스탠드
  if (value === 17) return false;

  // 16 이하에서는 히트
  return value < 17;
}

// 게임 상태 초기값
const initialState = {
  // 게임 진행 상태
  gameState: 'betting', // 'betting', 'playing', 'dealer-turn', 'finished'

  // 카드 덱
  deck: createDeck(),

  // 플레이어와 딜러 핸드
  playerHands: [[]], // 스플릿을 위해 배열로 관리
  dealerHand: [],
  currentHandIndex: 0, // 현재 플레이 중인 핸드

  // 베팅
  bets: [0], // 각 핸드별 베팅 금액

  // 게임 결과
  results: [], // 각 핸드별 결과

  // 플레이어 잔고
  balance: 10000,

  // 게임 옵션 상태
  canDouble: false,
  canSplit: false,
  canSurrender: false,

  // 인슈어런스
  insuranceBet: 0,
  canInsurance: false,

  // 딜링 애니메이션
  isDealing: false,

  // 메시지
  message: '베팅을 시작하세요!'
};

export const blackjackStore = writable(initialState);

// 게임 액션들
export const blackjackActions = {
  // 베팅
  placeBet(amount) {
    blackjackStore.update(state => {
      if (state.gameState !== 'betting' || state.balance < amount) {
        return state;
      }

      return {
        ...state,
        bets: [amount],
        balance: state.balance - amount,
        message: `$${amount}을 베팅했습니다.`
      };
    });
  },

  // 베팅 초기화
  clearBets() {
    blackjackStore.update(state => {
      if (state.gameState !== 'betting') return state;

      const totalBets = state.bets.reduce((sum, bet) => sum + bet, 0);

      return {
        ...state,
        bets: [0],
        balance: state.balance + totalBets,
        message: '베팅이 초기화되었습니다.'
      };
    });
  },

  // 게임 시작 (카드 딜링)
  deal() {
    blackjackStore.update(state => {
      if (state.gameState !== 'betting' || state.bets[0] === 0) {
        return { ...state, message: '먼저 베팅을 해주세요!' };
      }

      let newDeck = [...state.deck];

      // 플레이어 2장, 딜러 2장 (딜러 첫번째 카드는 히든)
      const playerHand = [newDeck.pop(), newDeck.pop()];
      const dealerHand = [newDeck.pop(), newDeck.pop()];

      // 인슈어런스 체크 (딜러 오픈카드가 A인 경우)
      const canInsurance = dealerHand[0].value === 'A';

      // 블랙잭 체크
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);

      // 스플릿 가능 체크
      const canSplit = playerHand[0].value === playerHand[1].value && state.balance >= state.bets[0];

      // 더블다운 가능 체크
      const canDouble = state.balance >= state.bets[0];

      // 항복 가능 체크
      const canSurrender = true;

      // 플레이어 블랙잭인 경우 즉시 게임 종료
      if (playerValue === 21) {
        return {
          ...state,
          deck: newDeck,
          playerHands: [playerHand],
          dealerHand,
          gameState: 'finished',
          results: [dealerValue === 21 ? 'push' : 'blackjack'],
          message: dealerValue === 21 ? '무승부!' : '블랙잭!'
        };
      }

      return {
        ...state,
        deck: newDeck,
        playerHands: [playerHand],
        dealerHand,
        currentHandIndex: 0,
        gameState: canInsurance ? 'insurance' : 'playing',
        canDouble,
        canSplit,
        canSurrender,
        canInsurance,
        isDealing: true,
        message: canInsurance ? '인슈어런스를 하시겠습니까?' : '카드를 받거나 스탠드하세요.'
      };
    });

    setTimeout(() => {
      blackjackStore.update(state => ({ ...state, isDealing: false }));
    }, 1000);
  },

  // 히트 (카드 받기)
  hit() {
    blackjackStore.update(state => {
      if (state.gameState !== 'playing') return state;

      let newDeck = [...state.deck];
      let newPlayerHands = [...state.playerHands];
      const currentHand = [...newPlayerHands[state.currentHandIndex]];

      currentHand.push(newDeck.pop());
      newPlayerHands[state.currentHandIndex] = currentHand;

      const handValue = calculateHandValue(currentHand);

      // 버스트 체크
      if (handValue > 21) {
        return blackjackActions.nextHand({
          ...state,
          deck: newDeck,
          playerHands: newPlayerHands,
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          message: '버스트!'
        });
      }

      // 21이면 자동으로 스탠드
      if (handValue === 21) {
        return blackjackActions.nextHand({
          ...state,
          deck: newDeck,
          playerHands: newPlayerHands,
          canDouble: false,
          canSplit: false,
          canSurrender: false,
          message: '21!'
        });
      }

      return {
        ...state,
        deck: newDeck,
        playerHands: newPlayerHands,
        canDouble: false, // 히트 후에는 더블다운 불가
        canSplit: false, // 히트 후에는 스플릿 불가
        canSurrender: false, // 히트 후에는 항복 불가
      };
    });
  },

  // 스탠드
  stand() {
    blackjackStore.update(state => {
      if (state.gameState !== 'playing') return state;

      return blackjackActions.nextHand({
        ...state,
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        message: '스탠드!'
      });
    });
  },

  // 더블다운
  double() {
    blackjackStore.update(state => {
      if (state.gameState !== 'playing' || !state.canDouble || state.balance < state.bets[state.currentHandIndex]) {
        return state;
      }

      let newDeck = [...state.deck];
      let newPlayerHands = [...state.playerHands];
      let newBets = [...state.bets];

      const currentHand = [...newPlayerHands[state.currentHandIndex]];
      currentHand.push(newDeck.pop());
      newPlayerHands[state.currentHandIndex] = currentHand;

      // 베팅 두 배로
      newBets[state.currentHandIndex] *= 2;

      return blackjackActions.nextHand({
        ...state,
        deck: newDeck,
        playerHands: newPlayerHands,
        bets: newBets,
        balance: state.balance - state.bets[state.currentHandIndex],
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        message: '더블다운!'
      });
    });
  },

  // 스플릿
  split() {
    blackjackStore.update(state => {
      if (state.gameState !== 'playing' || !state.canSplit || state.balance < state.bets[0]) {
        return state;
      }

      let newDeck = [...state.deck];
      let newPlayerHands = [...state.playerHands];
      let newBets = [...state.bets];

      const currentHand = newPlayerHands[state.currentHandIndex];

      // 두 핸드로 분할
      const firstHand = [currentHand[0], newDeck.pop()];
      const secondHand = [currentHand[1], newDeck.pop()];

      newPlayerHands[state.currentHandIndex] = firstHand;
      newPlayerHands.push(secondHand);
      newBets.push(state.bets[state.currentHandIndex]);

      return {
        ...state,
        deck: newDeck,
        playerHands: newPlayerHands,
        bets: newBets,
        balance: state.balance - state.bets[state.currentHandIndex],
        canDouble: true,
        canSplit: false, // 한 번만 스플릿 가능
        canSurrender: false,
        message: '스플릿!'
      };
    });
  },

  // 항복
  surrender() {
    blackjackStore.update(state => {
      if (state.gameState !== 'playing' || !state.canSurrender) {
        return state;
      }

      // 베팅의 절반을 돌려받음
      const refund = Math.floor(state.bets[0] / 2);

      return {
        ...state,
        gameState: 'finished',
        results: ['surrender'],
        balance: state.balance + refund,
        message: `항복했습니다. $${refund}을 돌려받았습니다.`
      };
    });
  },

  // 인슈어런스
  insurance() {
    blackjackStore.update(state => {
      if (!state.canInsurance || state.balance < Math.floor(state.bets[0] / 2)) {
        return state;
      }

      const insuranceAmount = Math.floor(state.bets[0] / 2);

      return {
        ...state,
        insuranceBet: insuranceAmount,
        balance: state.balance - insuranceAmount,
        canInsurance: false,
        gameState: 'playing',
        message: '인슈어런스를 걸었습니다.'
      };
    });
  },

  // 인슈어런스 거절
  noInsurance() {
    blackjackStore.update(state => {
      return {
        ...state,
        canInsurance: false,
        gameState: 'playing',
        message: '게임을 계속합니다.'
      };
    });
  },

  // 다음 핸드로 이동 또는 딜러 턴
  nextHand(currentState) {
    if (currentState.currentHandIndex < currentState.playerHands.length - 1) {
      // 다음 핸드로
      return {
        ...currentState,
        currentHandIndex: currentState.currentHandIndex + 1,
        canDouble: true,
        canSplit: false,
        canSurrender: false,
        message: '다음 핸드를 플레이하세요.'
      };
    } else {
      // 딜러 턴 시작
      setTimeout(() => {
        blackjackActions.dealerPlay();
      }, 1000);

      return {
        ...currentState,
        gameState: 'dealer-turn',
        message: '딜러 턴입니다.'
      };
    }
  },

  // 딜러 플레이
  dealerPlay() {
    blackjackStore.update(state => {
      let newDeck = [...state.deck];
      let dealerHand = [...state.dealerHand];

      // 딜러가 카드를 받아야 하는지 확인하고 받기
      while (shouldDealerHit(dealerHand)) {
        dealerHand.push(newDeck.pop());
      }

      const dealerValue = calculateHandValue(dealerHand);
      const results = [];

      // 각 플레이어 핸드와 비교
      for (let i = 0; i < state.playerHands.length; i++) {
        const playerValue = calculateHandValue(state.playerHands[i]);

        if (playerValue > 21) {
          results.push('bust');
        } else if (dealerValue > 21) {
          results.push('win');
        } else if (playerValue > dealerValue) {
          results.push('win');
        } else if (playerValue < dealerValue) {
          results.push('lose');
        } else {
          results.push('push');
        }
      }

      // 인슈어런스 체크
      let insuranceWin = false;
      if (state.insuranceBet > 0) {
        insuranceWin = dealerValue === 21;
      }

      return {
        ...state,
        deck: newDeck,
        dealerHand,
        results,
        gameState: 'finished',
        message: '게임 종료!',
        insuranceWin
      };
    });

    // 상금 계산
    setTimeout(() => {
      blackjackActions.calculateWinnings();
    }, 500);
  },

  // 상금 계산
  calculateWinnings() {
    blackjackStore.update(state => {
      let winnings = 0;

      // 각 핸드별 상금 계산
      for (let i = 0; i < state.results.length; i++) {
        const result = state.results[i];
        const bet = state.bets[i];

        switch (result) {
          case 'blackjack':
            winnings += Math.floor(bet * 2.5); // 3:2 배당
            break;
          case 'win':
            winnings += bet * 2; // 1:1 배당
            break;
          case 'push':
            winnings += bet; // 베팅금 반환
            break;
          case 'surrender':
            winnings += Math.floor(bet / 2); // 절반 반환
            break;
          // 'lose', 'bust'는 상금 없음
        }
      }

      // 인슈어런스 상금
      if (state.insuranceBet > 0 && state.insuranceWin) {
        winnings += state.insuranceBet * 3; // 2:1 배당 + 원금
      }

      return {
        ...state,
        balance: state.balance + winnings,
        message: winnings > 0 ? `축하합니다! $${winnings}을 획득했습니다!` : '다음 게임에 도전해보세요!'
      };
    });
  },

  // 새 게임 시작
  newGame() {
    blackjackStore.update(state => {
      // 덱이 부족하면 새 덱 생성
      let newDeck = state.deck;
      if (newDeck.length < 20) {
        newDeck = createDeck();
      }

      return {
        ...state,
        gameState: 'betting',
        deck: newDeck,
        playerHands: [[]],
        dealerHand: [],
        currentHandIndex: 0,
        bets: [0],
        results: [],
        canDouble: false,
        canSplit: false,
        canSurrender: false,
        insuranceBet: 0,
        canInsurance: false,
        insuranceWin: false,
        isDealing: false,
        message: '새 게임을 시작하세요!'
      };
    });
  },

  // 게임 리셋 (잔고 초기화)
  resetGame() {
    blackjackStore.set({ ...initialState, deck: createDeck() });
  }
};