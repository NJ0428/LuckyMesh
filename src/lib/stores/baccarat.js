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
    bankerPair: 0,
    bigSmall: 0,
    lucky6: 0,
    dragonBonus: 0
  },

  // 게임 결과
  winner: null, // 'player', 'banker', 'tie'

  // 사이드 베팅 결과
  sideBets: {
    playerPair: false,
    bankerPair: false,
    bigSmall: null, // 'big' (5-6장), 'small' (4장)
    lucky6: null, // { banker6: true, twoCard: boolean } - 뱅커가 6으로 승리
    dragonBonus: null // { winner: 'player'|'banker', margin: number, payout: number }
  },

  // 플레이어 잔고
  balance: 10000,

  // 게임 히스토리
  history: [],

  // 로드맵 데이터
  roadmaps: {
    beadRoad: [],
    bigRoad: [],
    bigEyeRoad: [],
    smallRoad: [],
    cockroachRoad: []
  },

  // 통계
  stats: {
    playerWins: 0,
    bankerWins: 0,
    ties: 0,
    playerPairs: 0,
    bankerPairs: 0,
    currentStreak: { type: null, count: 0 },
    longestStreak: { type: null, count: 0 },
    hotTrend: null, // 'player', 'banker', 'tie'
    shoeNumber: 1,
    gamesInShoe: 0
  },

  // 베팅 시스템
  bettingSystem: {
    lastBets: null,
    favoriteBets: [],
    betTimer: 30,
    betLimits: {
      min: 10,
      max: 1000
    }
  },

  // 딜링 애니메이션
  isDealing: false,

  // 메시지
  message: '베팅을 시작하세요!'
};

// 로드맵 계산 함수들
function calculateBeadRoad(history) {
  return history.map(game => ({
    winner: game.winner,
    playerPair: game.sideBets.playerPair,
    bankerPair: game.sideBets.bankerPair
  }));
}

function calculateBigRoad(history) {
  const bigRoad = [];
  let currentColumn = [];
  let lastWinner = null;

  history.forEach(game => {
    const winner = game.winner === 'tie' ? lastWinner : game.winner;

    if (winner !== lastWinner && lastWinner !== null) {
      bigRoad.push([...currentColumn]);
      currentColumn = [];
    }

    if (winner) {
      currentColumn.push({
        winner,
        tie: game.winner === 'tie'
      });
      if (game.winner !== 'tie') {
        lastWinner = winner;
      }
    }
  });

  if (currentColumn.length > 0) {
    bigRoad.push(currentColumn);
  }

  return bigRoad;
}

function calculateDerivedRoad(bigRoad, skip) {
  const derivedRoad = [];

  for (let i = skip; i < bigRoad.length; i++) {
    const currentDepth = bigRoad[i].length;
    const compareColumn = i - skip;

    if (compareColumn < 0) continue;

    const compareDepth = bigRoad[compareColumn].length;

    if (i > skip && bigRoad[i - 1]) {
      const prevCompareColumn = i - skip - 1;
      if (prevCompareColumn >= 0 && bigRoad[prevCompareColumn]) {
        const prevCompareDepth = bigRoad[prevCompareColumn].length;

        if (currentDepth === compareDepth && prevCompareDepth === bigRoad[prevCompareColumn - 1]?.length) {
          derivedRoad.push('red');
        } else {
          derivedRoad.push('blue');
        }
      }
    }
  }

  return derivedRoad;
}

function updateRoadmaps(history) {
  return {
    beadRoad: calculateBeadRoad(history),
    bigRoad: calculateBigRoad(history),
    bigEyeRoad: calculateDerivedRoad(calculateBigRoad(history), 1),
    smallRoad: calculateDerivedRoad(calculateBigRoad(history), 2),
    cockroachRoad: calculateDerivedRoad(calculateBigRoad(history), 3)
  };
}

function updateStats(state, winner, sideBets) {
  const stats = { ...state.stats };

  // 승리 카운트
  if (winner === 'player') stats.playerWins++;
  if (winner === 'banker') stats.bankerWins++;
  if (winner === 'tie') stats.ties++;

  // 페어 카운트
  if (sideBets.playerPair) stats.playerPairs++;
  if (sideBets.bankerPair) stats.bankerPairs++;

  // 연승 추적
  if (winner === stats.currentStreak.type) {
    stats.currentStreak.count++;
  } else {
    stats.currentStreak = { type: winner, count: 1 };
  }

  if (stats.currentStreak.count > stats.longestStreak.count) {
    stats.longestStreak = { ...stats.currentStreak };
  }

  // 핫 트렌드 (최근 10게임 기준)
  const recentGames = state.history.slice(0, 10);
  const recentPlayerWins = recentGames.filter(g => g.winner === 'player').length;
  const recentBankerWins = recentGames.filter(g => g.winner === 'banker').length;

  if (recentPlayerWins > recentBankerWins + 2) {
    stats.hotTrend = 'player';
  } else if (recentBankerWins > recentPlayerWins + 2) {
    stats.hotTrend = 'banker';
  } else {
    stats.hotTrend = null;
  }

  stats.gamesInShoe++;

  return stats;
}

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

      // 사이드 베팅 결과 계산
      const totalCards = playerHand.length + bankerHand.length;
      const bigSmall = totalCards === 4 ? 'small' : 'big';

      // Lucky 6: 뱅커가 6으로 승리
      let lucky6 = null;
      if (winner === 'banker' && finalBankerScore === 6) {
        lucky6 = {
          banker6: true,
          twoCard: bankerHand.length === 2
        };
      }

      // Dragon Bonus: 승리 마진 계산
      let dragonBonus = null;
      const margin = Math.abs(finalPlayerScore - finalBankerScore);
      if (winner !== 'tie' && margin >= 4) {
        const payoutMap = {
          4: 1, 5: 2, 6: 4, 7: 6, 8: 10, 9: 30
        };
        dragonBonus = {
          winner,
          margin,
          payout: payoutMap[margin] || 30
        };
      }
      // 내추럴 승리 (9 또는 8)
      if (winner !== 'tie' && (finalPlayerScore === 9 || finalBankerScore === 9)) {
        dragonBonus = {
          winner,
          margin: finalPlayerScore === 9 || finalBankerScore === 9 ? 9 : 8,
          payout: finalPlayerScore === 9 || finalBankerScore === 9 ? 30 : 10
        };
      }

      return {
        ...state,
        deck: newDeck,
        playerHand,
        bankerHand,
        playerScore: finalPlayerScore,
        bankerScore: finalBankerScore,
        winner,
        sideBets: {
          ...state.sideBets,
          bigSmall,
          lucky6,
          dragonBonus
        },
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
        // Tie일 때 플레이어/뱅커 베팅 반환
        winnings += bets.player + bets.banker;
      }

      // 사이드 베팅 결과
      if (sideBets.playerPair && bets.playerPair > 0) {
        winnings += bets.playerPair * 12; // 11:1 배당
      }
      if (sideBets.bankerPair && bets.bankerPair > 0) {
        winnings += bets.bankerPair * 12; // 11:1 배당
      }

      // Big/Small 베팅
      if (bets.bigSmall > 0 && sideBets.bigSmall) {
        if (sideBets.bigSmall === 'big') {
          winnings += bets.bigSmall * 1.54; // 0.54:1 배당
        } else {
          winnings += bets.bigSmall * 2.5; // 1.5:1 배당
        }
      }

      // Lucky 6 베팅
      if (bets.lucky6 > 0 && sideBets.lucky6) {
        if (sideBets.lucky6.twoCard) {
          winnings += bets.lucky6 * 21; // 20:1 배당 (2장으로 6)
        } else {
          winnings += bets.lucky6 * 13; // 12:1 배당 (3장으로 6)
        }
      }

      // Dragon Bonus 베팅
      if (bets.dragonBonus > 0 && sideBets.dragonBonus) {
        winnings += bets.dragonBonus * (sideBets.dragonBonus.payout + 1);
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

      const newHistory = [gameResult, ...state.history.slice(0, 49)]; // 최근 50게임 보관 (로드맵용)

      // 통계 업데이트
      const updatedStats = updateStats(state, winner, sideBets);

      // 로드맵 업데이트
      const updatedRoadmaps = updateRoadmaps(newHistory);

      // 마지막 베팅 저장
      const lastBets = { ...bets };

      return {
        ...state,
        balance: state.balance + winnings,
        history: newHistory,
        stats: updatedStats,
        roadmaps: updatedRoadmaps,
        bettingSystem: {
          ...state.bettingSystem,
          lastBets
        },
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
          bankerPair: 0,
          bigSmall: 0,
          lucky6: 0,
          dragonBonus: 0
        },
        winner: null,
        sideBets: {
          playerPair: false,
          bankerPair: false,
          bigSmall: null,
          lucky6: null,
          dragonBonus: null
        },
        isDealing: false,
        message: '새 게임을 시작하세요!'
      };
    });
  },

  // 게임 리셋 (잔고 초기화)
  resetGame() {
    baccaratStore.set({ ...initialState, deck: createDeck() });
  },

  // 이전 베팅 반복
  repeatLastBet() {
    baccaratStore.update(state => {
      if (!state.bettingSystem.lastBets || state.gameState !== 'betting') {
        return state;
      }

      const totalBets = Object.values(state.bettingSystem.lastBets).reduce((sum, bet) => sum + bet, 0);
      if (state.balance < totalBets) {
        return { ...state, message: '잔액이 부족합니다!' };
      }

      return {
        ...state,
        bets: { ...state.bettingSystem.lastBets },
        balance: state.balance - totalBets,
        message: '이전 베팅을 반복했습니다.'
      };
    });
  },

  // 즐겨찾기 베팅 저장
  saveFavoriteBet(name) {
    baccaratStore.update(state => {
      const currentBets = { ...state.bets };
      const totalBets = Object.values(currentBets).reduce((sum, bet) => sum + bet, 0);

      if (totalBets === 0) {
        return { ...state, message: '저장할 베팅이 없습니다!' };
      }

      const favoriteBets = [...state.bettingSystem.favoriteBets];
      const existingIndex = favoriteBets.findIndex(fav => fav.name === name);

      if (existingIndex >= 0) {
        favoriteBets[existingIndex] = { name, bets: currentBets };
      } else {
        favoriteBets.push({ name, bets: currentBets });
      }

      return {
        ...state,
        bettingSystem: {
          ...state.bettingSystem,
          favoriteBets: favoriteBets.slice(0, 5) // 최대 5개까지
        },
        message: `"${name}" 베팅 패턴이 저장되었습니다!`
      };
    });
  },

  // 즐겨찾기 베팅 불러오기
  loadFavoriteBet(name) {
    baccaratStore.update(state => {
      if (state.gameState !== 'betting') return state;

      const favorite = state.bettingSystem.favoriteBets.find(fav => fav.name === name);
      if (!favorite) {
        return { ...state, message: '저장된 베팅을 찾을 수 없습니다!' };
      }

      const totalBets = Object.values(favorite.bets).reduce((sum, bet) => sum + bet, 0);
      if (state.balance < totalBets) {
        return { ...state, message: '잔액이 부족합니다!' };
      }

      return {
        ...state,
        bets: { ...favorite.bets },
        balance: state.balance - totalBets,
        message: `"${name}" 베팅을 불러왔습니다.`
      };
    });
  },

  // 즐겨찾기 베팅 삭제
  deleteFavoriteBet(name) {
    baccaratStore.update(state => {
      return {
        ...state,
        bettingSystem: {
          ...state.bettingSystem,
          favoriteBets: state.bettingSystem.favoriteBets.filter(fav => fav.name !== name)
        },
        message: `"${name}" 베팅 패턴이 삭제되었습니다.`
      };
    });
  },

  // 베팅 제한 설정
  setBetLimits(min, max) {
    baccaratStore.update(state => {
      return {
        ...state,
        bettingSystem: {
          ...state.bettingSystem,
          betLimits: { min, max }
        }
      };
    });
  },

  // 새 슈 시작
  newShoe() {
    baccaratStore.update(state => {
      return {
        ...state,
        deck: createDeck(),
        history: [],
        roadmaps: {
          beadRoad: [],
          bigRoad: [],
          bigEyeRoad: [],
          smallRoad: [],
          cockroachRoad: []
        },
        stats: {
          ...state.stats,
          shoeNumber: state.stats.shoeNumber + 1,
          gamesInShoe: 0,
          currentStreak: { type: null, count: 0 }
        },
        message: `새로운 슈 #${state.stats.shoeNumber + 1}이 시작되었습니다!`
      };
    });
  }
};