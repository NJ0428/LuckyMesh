import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 업적 정의
const achievementDefinitions = {
  // 기본 게임 업적
  firstWin: {
    id: 'firstWin',
    title: '첫 승리',
    description: '첫 번째 게임에서 승리하세요',
    icon: '🎉',
    category: 'basic',
    requirement: { type: 'wins', value: 1 },
    reward: { type: 'badge', value: 'first_winner' }
  },

  winStreak5: {
    id: 'winStreak5',
    title: '연승의 시작',
    description: '5연승을 달성하세요',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'winStreak', value: 5 },
    reward: { type: 'badge', value: 'streak_master' }
  },

  winStreak10: {
    id: 'winStreak10',
    title: '연승 마스터',
    description: '10연승을 달성하세요',
    icon: '⚡',
    category: 'streak',
    requirement: { type: 'winStreak', value: 10 },
    reward: { type: 'badge', value: 'streak_legend' }
  },

  // 블랙잭 관련 업적
  blackjack1: {
    id: 'blackjack1',
    title: '블랙잭!',
    description: '첫 번째 블랙잭을 달성하세요',
    icon: '🃏',
    category: 'blackjack',
    requirement: { type: 'blackjacks', value: 1 },
    reward: { type: 'badge', value: 'blackjack_newbie' }
  },

  blackjack10: {
    id: 'blackjack10',
    title: '블랙잭 컬렉터',
    description: '블랙잭을 10번 달성하세요',
    icon: '🎰',
    category: 'blackjack',
    requirement: { type: 'blackjacks', value: 10 },
    reward: { type: 'badge', value: 'blackjack_collector' }
  },

  // 게임 수 관련 업적
  games50: {
    id: 'games50',
    title: '경험 쌓기',
    description: '50게임을 플레이하세요',
    icon: '📈',
    category: 'experience',
    requirement: { type: 'totalGames', value: 50 },
    reward: { type: 'badge', value: 'experienced_player' }
  },

  games100: {
    id: 'games100',
    title: '베테랑 플레이어',
    description: '100게임을 플레이하세요',
    icon: '🏆',
    category: 'experience',
    requirement: { type: 'totalGames', value: 100 },
    reward: { type: 'badge', value: 'veteran_player' }
  },

  // 돈 관련 업적
  profit10k: {
    id: 'profit10k',
    title: '수익 달성',
    description: '총 $10,000의 순수익을 달성하세요',
    icon: '💰',
    category: 'money',
    requirement: { type: 'netProfit', value: 10000 },
    reward: { type: 'badge', value: 'money_maker' }
  },

  bigWin: {
    id: 'bigWin',
    title: '대박!',
    description: '한 게임에서 $1,000 이상 획득하세요',
    icon: '💎',
    category: 'money',
    requirement: { type: 'biggestWin', value: 1000 },
    reward: { type: 'badge', value: 'big_winner' }
  },

  // 전략 관련 업적
  perfectStrategy: {
    id: 'perfectStrategy',
    title: '완벽한 전략',
    description: '연속 20게임에서 기본 전략을 완벽하게 따르세요',
    icon: '🧠',
    category: 'strategy',
    requirement: { type: 'perfectStrategyStreak', value: 20 },
    reward: { type: 'badge', value: 'strategy_master' }
  },

  // 특별한 상황 업적
  split4Times: {
    id: 'split4Times',
    title: '스플릿 마스터',
    description: '한 게임에서 4번 스플릿하세요',
    icon: '✂️',
    category: 'special',
    requirement: { type: 'maxSplits', value: 4 },
    reward: { type: 'badge', value: 'split_master' }
  },

  allDoubleWin: {
    id: 'allDoubleWin',
    title: '더블다운 승부사',
    description: '더블다운으로 10번 연속 승리하세요',
    icon: '🎲',
    category: 'special',
    requirement: { type: 'doubleWinStreak', value: 10 },
    reward: { type: 'badge', value: 'double_master' }
  },

  // 사이드 베팅 업적
  perfectPairWin: {
    id: 'perfectPairWin',
    title: '완벽한 페어',
    description: 'Perfect Pairs 사이드 베팅에서 승리하세요',
    icon: '👫',
    category: 'sidebet',
    requirement: { type: 'perfectPairWins', value: 1 },
    reward: { type: 'badge', value: 'pair_master' }
  },

  twentyOnePlusThreeWin: {
    id: 'twentyOnePlusThreeWin',
    title: '21+3 마스터',
    description: '21+3 사이드 베팅에서 승리하세요',
    icon: '🃏',
    category: 'sidebet',
    requirement: { type: 'twentyOnePlusThreeWins', value: 1 },
    reward: { type: 'badge', value: 'poker_master' }
  },

  // 시간 관련 업적
  longSession: {
    id: 'longSession',
    title: '마라톤 플레이어',
    description: '2시간 연속으로 플레이하세요',
    icon: '⏰',
    category: 'time',
    requirement: { type: 'sessionLength', value: 7200 }, // 2시간 (초)
    reward: { type: 'badge', value: 'marathon_player' }
  },

  // 멀티플레이어 업적
  multiplayerWin: {
    id: 'multiplayerWin',
    title: '멀티플레이어 승리',
    description: '멀티플레이어 게임에서 승리하세요',
    icon: '👥',
    category: 'multiplayer',
    requirement: { type: 'multiplayerWins', value: 1 },
    reward: { type: 'badge', value: 'social_player' }
  }
};

// 업적 상태 초기값
const initialState = {
  achievements: {},
  unlockedAchievements: [],
  progress: {},
  recentUnlocks: [],
  sessionProgress: {},
  statistics: {
    // 기본 통계
    totalGames: 0,
    wins: 0,
    winStreak: 0,
    maxWinStreak: 0,
    blackjacks: 0,
    netProfit: 0,
    biggestWin: 0,

    // 전략 통계
    perfectStrategyStreak: 0,
    strategyAccuracy: 0,

    // 특별한 플레이 통계
    maxSplits: 0,
    doubleWinStreak: 0,
    currentDoubleWinStreak: 0,

    // 사이드 베팅 통계
    perfectPairWins: 0,
    twentyOnePlusThreeWins: 0,

    // 세션 통계
    sessionLength: 0,
    sessionStartTime: null,

    // 멀티플레이어 통계
    multiplayerWins: 0
  }
};

// 로컬 스토리지에서 업적 불러오기
function loadAchievements() {
  if (!browser) return initialState;

  try {
    const saved = localStorage.getItem('blackjack-achievements');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load achievements:', error);
  }

  return initialState;
}

// 로컬 스토리지에 업적 저장
function saveAchievements(state) {
  if (!browser) return;

  try {
    localStorage.setItem('blackjack-achievements', JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save achievements:', error);
  }
}

// 업적 스토어
export const achievementsStore = writable(loadAchievements());

// 업적 액션들
export const achievementsActions = {
  // 업적 진행 상황 업데이트
  updateProgress(gameResult) {
    achievementsStore.update(state => {
      const newState = { ...state };

      // 통계 업데이트
      if (gameResult.totalGames !== undefined) {
        newState.statistics.totalGames = gameResult.totalGames;
      }
      if (gameResult.wins !== undefined) {
        newState.statistics.wins = gameResult.wins;
      }
      if (gameResult.winStreak !== undefined) {
        newState.statistics.winStreak = gameResult.winStreak;
        newState.statistics.maxWinStreak = Math.max(newState.statistics.maxWinStreak, gameResult.winStreak);
      }
      if (gameResult.blackjacks !== undefined) {
        newState.statistics.blackjacks = gameResult.blackjacks;
      }
      if (gameResult.netProfit !== undefined) {
        newState.statistics.netProfit = gameResult.netProfit;
      }
      if (gameResult.biggestWin !== undefined) {
        newState.statistics.biggestWin = Math.max(newState.statistics.biggestWin, gameResult.biggestWin);
      }

      // 특별한 상황 업데이트
      if (gameResult.splitsInGame !== undefined) {
        newState.statistics.maxSplits = Math.max(newState.statistics.maxSplits, gameResult.splitsInGame);
      }

      if (gameResult.doubleWin !== undefined) {
        if (gameResult.doubleWin) {
          newState.statistics.currentDoubleWinStreak++;
          newState.statistics.doubleWinStreak = Math.max(
            newState.statistics.doubleWinStreak,
            newState.statistics.currentDoubleWinStreak
          );
        } else {
          newState.statistics.currentDoubleWinStreak = 0;
        }
      }

      // 사이드 베팅 업데이트
      if (gameResult.perfectPairWin) {
        newState.statistics.perfectPairWins++;
      }
      if (gameResult.twentyOnePlusThreeWin) {
        newState.statistics.twentyOnePlusThreeWins++;
      }

      // 전략 정확도 업데이트
      if (gameResult.strategyAccuracy !== undefined) {
        newState.statistics.strategyAccuracy = gameResult.strategyAccuracy;

        if (gameResult.perfectStrategy) {
          newState.statistics.perfectStrategyStreak++;
        } else {
          newState.statistics.perfectStrategyStreak = 0;
        }
      }

      // 세션 길이 업데이트
      if (!newState.statistics.sessionStartTime) {
        newState.statistics.sessionStartTime = Date.now();
      }
      newState.statistics.sessionLength = Math.floor((Date.now() - newState.statistics.sessionStartTime) / 1000);

      // 업적 확인 및 언락
      this.checkAchievements(newState);

      saveAchievements(newState);
      return newState;
    });
  },

  // 업적 확인
  checkAchievements(state) {
    Object.values(achievementDefinitions).forEach(achievement => {
      // 이미 언락된 업적은 건너뛰기
      if (state.unlockedAchievements.includes(achievement.id)) {
        return;
      }

      const req = achievement.requirement;
      const statValue = state.statistics[req.type];

      // 요구 조건 확인
      if (statValue !== undefined && statValue >= req.value) {
        this.unlockAchievement(state, achievement);
      }
    });
  },

  // 업적 언락
  unlockAchievement(state, achievement) {
    state.unlockedAchievements.push(achievement.id);
    state.achievements[achievement.id] = {
      ...achievement,
      unlockedAt: new Date().toISOString()
    };

    // 최근 언락에 추가 (최대 5개까지만 보관)
    state.recentUnlocks.unshift({
      ...achievement,
      unlockedAt: new Date().toISOString()
    });
    if (state.recentUnlocks.length > 5) {
      state.recentUnlocks = state.recentUnlocks.slice(0, 5);
    }

    // 업적 언락 알림을 위한 이벤트 디스패치
    if (browser && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('achievementUnlocked', {
        detail: achievement
      }));
    }
  },

  // 멀티플레이어 승리 기록
  recordMultiplayerWin() {
    achievementsStore.update(state => {
      const newState = { ...state };
      newState.statistics.multiplayerWins++;
      this.checkAchievements(newState);
      saveAchievements(newState);
      return newState;
    });
  },

  // 업적 진행률 계산
  getAchievementProgress(achievementId) {
    let state;
    achievementsStore.subscribe(s => state = s)();

    const achievement = achievementDefinitions[achievementId];
    if (!achievement) return 0;

    const req = achievement.requirement;
    const currentValue = state.statistics[req.type] || 0;
    const progress = Math.min((currentValue / req.value) * 100, 100);

    return {
      current: currentValue,
      required: req.value,
      percentage: progress,
      completed: progress >= 100
    };
  },

  // 카테고리별 업적 가져오기
  getAchievementsByCategory(category) {
    return Object.values(achievementDefinitions).filter(
      achievement => achievement.category === category
    );
  },

  // 모든 카테고리 가져오기
  getCategories() {
    const categories = [...new Set(Object.values(achievementDefinitions).map(a => a.category))];
    return categories.map(category => ({
      id: category,
      name: this.getCategoryName(category),
      icon: this.getCategoryIcon(category)
    }));
  },

  // 카테고리 이름 가져오기
  getCategoryName(category) {
    const names = {
      basic: '기본',
      streak: '연승',
      blackjack: '블랙잭',
      experience: '경험',
      money: '수익',
      strategy: '전략',
      special: '특별',
      sidebet: '사이드 베팅',
      time: '시간',
      multiplayer: '멀티플레이어'
    };
    return names[category] || category;
  },

  // 카테고리 아이콘 가져오기
  getCategoryIcon(category) {
    const icons = {
      basic: '🎮',
      streak: '🔥',
      blackjack: '🃏',
      experience: '📈',
      money: '💰',
      strategy: '🧠',
      special: '⭐',
      sidebet: '🎲',
      time: '⏰',
      multiplayer: '👥'
    };
    return icons[category] || '🏆';
  },

  // 업적 통계 리셋
  resetAchievements() {
    achievementsStore.set(initialState);
    if (browser) {
      localStorage.removeItem('blackjack-achievements');
    }
  },

  // 세션 시작
  startSession() {
    achievementsStore.update(state => {
      const newState = { ...state };
      newState.statistics.sessionStartTime = Date.now();
      newState.statistics.sessionLength = 0;
      saveAchievements(newState);
      return newState;
    });
  },

  // 최근 언락된 업적 지우기
  clearRecentUnlocks() {
    achievementsStore.update(state => {
      const newState = { ...state };
      newState.recentUnlocks = [];
      saveAchievements(newState);
      return newState;
    });
  }
};