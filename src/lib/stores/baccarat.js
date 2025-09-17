import { writable } from 'svelte/store';

// 카드 덱 생성
function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];

  // 8덱 바카라
  for (let deckNum = 0; deckNum < 8; deckNum++) {
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

// 카드 값 계산 (바카라 규칙)
function getCardValue(card) {
  if (card.value === 'A') return 1;
  if (['J', 'Q', 'K'].includes(card.value)) return 0;
  return parseInt(card.value);
}

// 핸드 점수 계산
function calculateHandValue(hand) {
  const sum = hand.reduce((total, card) => total + getCardValue(card), 0);
  return sum % 10; // 바카라는 일의 자리만 사용
}

// 3번째 카드 규칙
function needsThirdCard(playerTotal, bankerTotal, playerThirdCard = null) {
  const result = { player: false, banker: false };

  // 내추럴 (8 또는 9)
  if (playerTotal >= 8 || bankerTotal >= 8) {
    return result;
  }

  // 플레이어 규칙
  if (playerTotal <= 5) {
    result.player = true;
  }

  // 뱅커 규칙 (플레이어가 3번째 카드를 받은 경우)
  if (result.player && playerThirdCard !== null) {
    const thirdCardValue = getCardValue(playerThirdCard);

    if (bankerTotal <= 2) {
      result.banker = true;
    } else if (bankerTotal === 3 && thirdCardValue !== 8) {
      result.banker = true;
    } else if (bankerTotal === 4 && [2,3,4,5,6,7].includes(thirdCardValue)) {
      result.banker = true;
    } else if (bankerTotal === 5 && [4,5,6,7].includes(thirdCardValue)) {
      result.banker = true;
    } else if (bankerTotal === 6 && [6,7].includes(thirdCardValue)) {
      result.banker = true;
    }
  }
  // 뱅커 규칙 (플레이어가 3번째 카드를 받지 않은 경우)
  else if (!result.player && bankerTotal <= 5) {
    result.banker = true;
  }

  return result;
}

// 게임 상태 초기값
const initialState = {
  // 게임 진행 상태
  gameState: 'betting', // 'betting', 'dealing', 'finished'

  // 카드 덱
  deck: createDeck(),

  // 플레이어와 뱅커 핸드
  playerHand: [],
  bankerHand: [],

  // 점수
  playerScore: 0,
  bankerScore: 0,

  // 베팅
  bets: {
    player: 0,
    banker: 0,
    tie: 0,
    playerPair: 0,
    bankerPair: 0
  },

  // 게임 결과
  winner: null, // 'player', 'banker', 'tie'

  // 사이드 베팅 결과
  sideBets: {
    playerPair: false,
    bankerPair: false
  },

  // 플레이어 잔고
  balance: 10000,

  // 게임 히스토리
  history: [],

  // 딜링 애니메이션
  isDealing: false,

  // 메시지
  message: '베팅을 시작하세요!'
};

export const baccaratStore = writable(initialState);

// 게임 액션들
export const baccaratActions = {
  // 베팅
  placeBet(betType, amount) {
    baccaratStore.update(state => {
      if (state.gameState !== 'betting' || state.balance < amount) {
        return state;
      }

      const newBets = { ...state.bets };
      newBets[betType] += amount;

      return {
        ...state,
        bets: newBets,
        balance: state.balance - amount,
        message: `${betType}에 $${amount} 베팅했습니다.`
      };
    });
  },

  // 베팅 초기화
  clearBets() {
    baccaratStore.update(state => {
      if (state.gameState !== 'betting') return state;

      const totalBets = Object.values(state.bets).reduce((sum, bet) => sum + bet, 0);

      return {
        ...state,
        bets: {
          player: 0,
          banker: 0,
          tie: 0,
          playerPair: 0,
          bankerPair: 0
        },
        balance: state.balance + totalBets,
        message: '베팅이 초기화되었습니다.'
      };
    });
  },

  // 게임 시작 (카드 딜링)
  deal() {
    baccaratStore.update(state => {
      if (state.gameState !== 'betting') return state;

      const totalBets = Object.values(state.bets).reduce((sum, bet) => sum + bet, 0);
      if (totalBets === 0) {
        return { ...state, message: '먼저 베팅을 해주세요!' };
      }

      let newDeck = [...state.deck];

      // 카드 4장 딜링 (플레이어 2장, 뱅커 2장)
      const playerHand = [newDeck.pop(), newDeck.pop()];
      const bankerHand = [newDeck.pop(), newDeck.pop()];

      const playerScore = calculateHandValue(playerHand);
      const bankerScore = calculateHandValue(bankerHand);

      // 페어 체크
      const playerPair = playerHand[0].value === playerHand[1].value;
      const bankerPair = bankerHand[0].value === bankerHand[1].value;

      return {
        ...state,
        deck: newDeck,
        playerHand,
        bankerHand,
        playerScore,
        bankerScore,
        sideBets: {
          playerPair,
          bankerPair
        },
        gameState: 'dealing',
        isDealing: true,
        message: '카드를 딜링 중입니다...'
      };
    });

    // 딜링 애니메이션 후 3번째 카드 규칙 적용
    setTimeout(() => {
      baccaratActions.checkThirdCard();
    }, 2000);
  },

  // 3번째 카드 규칙 확인
  checkThirdCard() {
    baccaratStore.update(state => {
      let newDeck = [...state.deck];
      let playerHand = [...state.playerHand];
      let bankerHand = [...state.bankerHand];

      const thirdCardNeeded = needsThirdCard(state.playerScore, state.bankerScore);
      let playerThirdCard = null;

      // 플레이어 3번째 카드
      if (thirdCardNeeded.player) {
        playerThirdCard = newDeck.pop();
        playerHand.push(playerThirdCard);
      }

      // 뱅커 3번째 카드
      if (needsThirdCard(state.playerScore, state.bankerScore, playerThirdCard).banker) {
        bankerHand.push(newDeck.pop());
      }

      const finalPlayerScore = calculateHandValue(playerHand);
      const finalBankerScore = calculateHandValue(bankerHand);

      // 승부 결정
      let winner;
      if (finalPlayerScore > finalBankerScore) {
        winner = 'player';
      } else if (finalBankerScore > finalPlayerScore) {
        winner = 'banker';
      } else {
        winner = 'tie';
      }

      return {
        ...state,
        deck: newDeck,
        playerHand,
        bankerHand,
        playerScore: finalPlayerScore,
        bankerScore: finalBankerScore,
        winner,
        gameState: 'finished',
        isDealing: false,
        message: `게임 종료! ${winner === 'player' ? '플레이어' : winner === 'banker' ? '뱅커' : '무승부'} 승리!`
      };
    });

    // 결과 처리
    setTimeout(() => {
      baccaratActions.calculateWinnings();
    }, 1000);
  },

  // 상금 계산
  calculateWinnings() {
    baccaratStore.update(state => {
      let winnings = 0;
      const { bets, winner, sideBets } = state;

      // 메인 베팅 결과
      if (winner === 'player' && bets.player > 0) {
        winnings += bets.player * 2; // 1:1 배당
      }
      if (winner === 'banker' && bets.banker > 0) {
        winnings += Math.floor(bets.banker * 1.95); // 1:1 배당에서 5% 수수료 차감
      }
      if (winner === 'tie' && bets.tie > 0) {
        winnings += bets.tie * 9; // 8:1 배당
      }

      // 사이드 베팅 결과
      if (sideBets.playerPair && bets.playerPair > 0) {
        winnings += bets.playerPair * 12; // 11:1 배당
      }
      if (sideBets.bankerPair && bets.bankerPair > 0) {
        winnings += bets.bankerPair * 12; // 11:1 배당
      }

      // 히스토리 추가
      const gameResult = {
        playerScore: state.playerScore,
        bankerScore: state.bankerScore,
        winner,
        sideBets,
        bets: { ...bets },
        winnings,
        timestamp: new Date()
      };

      return {
        ...state,
        balance: state.balance + winnings,
        history: [gameResult, ...state.history.slice(0, 19)], // 최근 20게임만 보관
        message: winnings > 0 ? `축하합니다! $${winnings}을 획득했습니다!` : '다음 게임에 도전해보세요!'
      };
    });
  },

  // 새 게임 시작
  newGame() {
    baccaratStore.update(state => {
      // 덱이 부족하면 새 덱 생성
      let newDeck = state.deck;
      if (newDeck.length < 20) {
        newDeck = createDeck();
      }

      return {
        ...state,
        gameState: 'betting',
        deck: newDeck,
        playerHand: [],
        bankerHand: [],
        playerScore: 0,
        bankerScore: 0,
        bets: {
          player: 0,
          banker: 0,
          tie: 0,
          playerPair: 0,
          bankerPair: 0
        },
        winner: null,
        sideBets: {
          playerPair: false,
          bankerPair: false
        },
        isDealing: false,
        message: '새 게임을 시작하세요!'
      };
    });
  },

  // 게임 리셋 (잔고 초기화)
  resetGame() {
    baccaratStore.set({ ...initialState, deck: createDeck() });
  }
};