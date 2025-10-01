import { writable } from 'svelte/store';

// 기본 전략 테이블 (하드 핸드)
const basicStrategyHard = {
  // [플레이어 합계][딜러 업카드] = 액션
  '5': ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'], // A,2,3,4,5,6,7,8,9,10
  '6': ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  '7': ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  '8': ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'],
  '9': ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'],
  '10': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  '11': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'],
  '12': ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '13': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '14': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'],
  '15': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'R', 'H'],
  '16': ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'R', 'R', 'R'],
  '17': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  '18': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  '19': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  '20': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
  '21': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S']
};

// 기본 전략 테이블 (소프트 핸드)
const basicStrategySoft = {
  'A,2': ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,2 (13)
  'A,3': ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,3 (14)
  'A,4': ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,4 (15)
  'A,5': ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,5 (16)
  'A,6': ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'], // A,6 (17)
  'A,7': ['S', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H', 'H'], // A,7 (18)
  'A,8': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], // A,8 (19)
  'A,9': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S']  // A,9 (20)
};

// 기본 전략 테이블 (페어)
const basicStrategyPairs = {
  'A,A': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  '2,2': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '3,3': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '4,4': ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '5,5': ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'],
  '6,6': ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'],
  '7,7': ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'],
  '8,8': ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  '9,9': ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'],
  '10,10': ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S']
};

// 카드 카운팅 시스템 (Hi-Lo)
const hiLoValues = {
  'A': -1, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0, '10': -1, 'J': -1, 'Q': -1, 'K': -1
};

// 전략 상태
const initialState = {
  showBasicStrategy: false,
  showHints: true,
  cardCountingMode: false,
  runningCount: 0,
  trueCount: 0,
  cardsDealt: 0,
  decksRemaining: 6,
  currentHint: null,
  strategyStats: {
    correctPlays: 0,
    totalPlays: 0,
    accuracy: 0
  }
};

export const strategyStore = writable(initialState);

// 딜러 업카드를 인덱스로 변환
function getDealerIndex(dealerCard) {
  const cardValue = dealerCard.value;
  const indexMap = {
    'A': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5,
    '7': 6, '8': 7, '9': 8, '10': 9, 'J': 9, 'Q': 9, 'K': 9
  };
  return indexMap[cardValue];
}

// 핸드 값 계산
function calculateHandValue(hand) {
  let sum = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      aces++;
      sum += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      sum += 10;
    } else {
      sum += parseInt(card.value);
    }
  }

  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }

  return sum;
}

// 소프트 핸드 여부 확인
function isSoftHand(hand) {
  const hasAce = hand.some(card => card.value === 'A');
  if (!hasAce) return false;

  const sum = calculateHandValue(hand);
  let sumWithAcesAsOne = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      sumWithAcesAsOne += 1;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      sumWithAcesAsOne += 10;
    } else {
      sumWithAcesAsOne += parseInt(card.value);
    }
  }

  return sum !== sumWithAcesAsOne;
}

// 페어 여부 확인
function isPair(hand) {
  if (hand.length !== 2) return false;

  const [card1, card2] = hand;
  let value1 = card1.value;
  let value2 = card2.value;

  // J, Q, K는 모두 10으로 취급
  if (['J', 'Q', 'K'].includes(value1)) value1 = '10';
  if (['J', 'Q', 'K'].includes(value2)) value2 = '10';

  return value1 === value2;
}

// 전략 액션들
export const strategyActions = {
  // 기본 전략 추천 가져오기
  getBasicStrategyAction(playerHand, dealerUpCard, canDouble = true, canSplit = true, canSurrender = true) {
    const dealerIndex = getDealerIndex(dealerUpCard);
    const playerValue = calculateHandValue(playerHand);

    // 페어 처리
    if (isPair(playerHand) && canSplit) {
      const cardValue = playerHand[0].value;
      let pairKey;

      if (['J', 'Q', 'K'].includes(cardValue)) {
        pairKey = '10,10';
      } else {
        pairKey = `${cardValue},${cardValue}`;
      }

      if (basicStrategyPairs[pairKey]) {
        const action = basicStrategyPairs[pairKey][dealerIndex];
        if (action === 'P') return 'split';
      }
    }

    // 소프트 핸드 처리
    if (isSoftHand(playerHand) && playerHand.length === 2) {
      const nonAceCard = playerHand.find(card => card.value !== 'A');
      const softKey = `A,${nonAceCard.value}`;

      if (basicStrategySoft[softKey]) {
        const action = basicStrategySoft[softKey][dealerIndex];

        switch (action) {
          case 'H': return 'hit';
          case 'S': return 'stand';
          case 'D': return canDouble ? 'double' : 'hit';
          case 'R': return canSurrender ? 'surrender' : 'hit';
        }
      }
    }

    // 하드 핸드 처리
    const hardKey = playerValue.toString();
    if (basicStrategyHard[hardKey]) {
      const action = basicStrategyHard[hardKey][dealerIndex];

      switch (action) {
        case 'H': return 'hit';
        case 'S': return 'stand';
        case 'D': return canDouble ? 'double' : 'hit';
        case 'R': return canSurrender ? 'surrender' : 'hit';
      }
    }

    // 기본값
    return playerValue <= 11 ? 'hit' : 'stand';
  },

  // 힌트 생성
  generateHint(playerHand, dealerUpCard, canDouble, canSplit, canSurrender) {
    const recommendedAction = this.getBasicStrategyAction(playerHand, dealerUpCard, canDouble, canSplit, canSurrender);
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = dealerUpCard.value;

    let explanation = '';

    switch (recommendedAction) {
      case 'hit':
        if (playerValue <= 11) {
          explanation = '11 이하이므로 버스트 위험이 없습니다.';
        } else if (playerValue <= 16) {
          explanation = `딜러 업카드가 ${dealerValue}이므로 카드를 더 받는 것이 유리합니다.`;
        } else {
          explanation = '기본 전략에 따라 히트를 권장합니다.';
        }
        break;

      case 'stand':
        if (playerValue >= 17) {
          explanation = '17 이상이므로 스탠드합니다.';
        } else {
          explanation = `딜러 업카드가 ${dealerValue}이므로 스탠드하는 것이 안전합니다.`;
        }
        break;

      case 'double':
        explanation = `현재 상황에서 더블다운이 가장 유리한 선택입니다.`;
        break;

      case 'split':
        explanation = `페어를 스플릿하는 것이 수학적으로 유리합니다.`;
        break;

      case 'surrender':
        explanation = `이 상황에서는 항복하는 것이 손실을 최소화합니다.`;
        break;
    }

    return {
      action: recommendedAction,
      explanation,
      playerValue,
      dealerValue
    };
  },

  // 힌트 설정
  setHint(hint) {
    strategyStore.update(state => ({
      ...state,
      currentHint: hint
    }));
  },

  // 힌트 지우기
  clearHint() {
    strategyStore.update(state => ({
      ...state,
      currentHint: null
    }));
  },

  // 플레이 정확도 추적
  recordPlay(playerAction, recommendedAction) {
    strategyStore.update(state => {
      const isCorrect = playerAction === recommendedAction;
      const newCorrectPlays = state.strategyStats.correctPlays + (isCorrect ? 1 : 0);
      const newTotalPlays = state.strategyStats.totalPlays + 1;

      return {
        ...state,
        strategyStats: {
          correctPlays: newCorrectPlays,
          totalPlays: newTotalPlays,
          accuracy: (newCorrectPlays / newTotalPlays) * 100
        }
      };
    });
  },

  // 카드 카운팅 업데이트
  updateCardCount(dealtCards) {
    strategyStore.update(state => {
      if (!state.cardCountingMode) return state;

      let runningCount = state.runningCount;

      // 새로 딜링된 카드들의 카운트 값 계산
      dealtCards.forEach(card => {
        const countValue = hiLoValues[card.value] || 0;
        runningCount += countValue;
      });

      const cardsDealt = state.cardsDealt + dealtCards.length;
      const decksRemaining = Math.max(0.5, 6 - (cardsDealt / 52));
      const trueCount = Math.round((runningCount / decksRemaining) * 10) / 10;

      return {
        ...state,
        runningCount,
        trueCount,
        cardsDealt,
        decksRemaining
      };
    });
  },

  // 카드 카운팅 모드 토글
  toggleCardCounting() {
    strategyStore.update(state => ({
      ...state,
      cardCountingMode: !state.cardCountingMode
    }));
  },

  // 카드 카운팅 리셋
  resetCardCount() {
    strategyStore.update(state => ({
      ...state,
      runningCount: 0,
      trueCount: 0,
      cardsDealt: 0,
      decksRemaining: 6
    }));
  },

  // 기본 전략 표시 토글
  toggleBasicStrategy() {
    strategyStore.update(state => ({
      ...state,
      showBasicStrategy: !state.showBasicStrategy
    }));
  },

  // 힌트 표시 토글
  toggleHints() {
    strategyStore.update(state => ({
      ...state,
      showHints: !state.showHints
    }));
  },

  // 베팅 크기 추천 (카드 카운팅 기반)
  getRecommendedBetSize(baseAmount, bankroll) {
    let state;
    strategyStore.subscribe(s => state = s)();

    if (!state.cardCountingMode) {
      return baseAmount;
    }

    const trueCount = state.trueCount;

    // 켈리 기준을 단순화한 베팅 시스템
    if (trueCount <= 1) {
      return Math.min(baseAmount, bankroll * 0.01); // 최소 베팅
    } else if (trueCount <= 2) {
      return Math.min(baseAmount * 1.5, bankroll * 0.02);
    } else if (trueCount <= 3) {
      return Math.min(baseAmount * 2, bankroll * 0.03);
    } else if (trueCount <= 4) {
      return Math.min(baseAmount * 3, bankroll * 0.04);
    } else {
      return Math.min(baseAmount * 4, bankroll * 0.05); // 최대 베팅
    }
  },

  // 인슈어런스 추천
  shouldTakeInsurance(trueCount) {
    // 트루 카운트가 +3 이상일 때만 인슈어런스 권장
    return trueCount >= 3;
  },

  // 전략 통계 리셋
  resetStats() {
    strategyStore.update(state => ({
      ...state,
      strategyStats: {
        correctPlays: 0,
        totalPlays: 0,
        accuracy: 0
      }
    }));
  },

  // 액션을 한국어로 변환
  translateAction(action) {
    const translations = {
      'hit': '히트',
      'stand': '스탠드',
      'double': '더블다운',
      'split': '스플릿',
      'surrender': '항복'
    };
    return translations[action] || action;
  }
};