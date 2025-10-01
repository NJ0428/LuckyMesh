import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 게임 통계 초기값
const defaultStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  busts: 0,
  surrenders: 0,
  totalBet: 0,
  totalWinnings: 0,
  totalLoss: 0,
  netProfit: 0,
  winStreak: 0,
  maxWinStreak: 0,
  lossStreak: 0,
  maxLossStreak: 0,
  averageBet: 0,
  winRate: 0,
  profitPerGame: 0,
  dailyStats: {},
  weeklyStats: {},
  monthlyStats: {},
  gameHistory: [], // 최근 게임들
  sessionStats: {
    gamesPlayed: 0,
    netProfit: 0,
    startBalance: 10000,
    currentBalance: 10000,
    startTime: null,
    biggestWin: 0,
    biggestLoss: 0
  }
};

// 로컬 스토리지에서 통계 불러오기
function loadStatsFromStorage() {
  if (!browser) return defaultStats;

  try {
    const saved = localStorage.getItem('blackjack-stats');
    if (saved) {
      const parsedStats = JSON.parse(saved);
      return { ...defaultStats, ...parsedStats };
    }
  } catch (error) {
    console.warn('Failed to load blackjack stats from localStorage:', error);
  }

  return defaultStats;
}

// 로컬 스토리지에 통계 저장
function saveStatsToStorage(stats) {
  if (!browser) return;

  try {
    localStorage.setItem('blackjack-stats', JSON.stringify(stats));
  } catch (error) {
    console.warn('Failed to save blackjack stats to localStorage:', error);
  }
}

// 스토어 생성
export const blackjackStats = writable(loadStatsFromStorage());

// 날짜 키 생성 함수들
function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getWeekKey(date = new Date()) {
  const year = date.getFullYear();
  const weekNumber = getWeekNumber(date);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

function getMonthKey(date = new Date()) {
  return date.toISOString().substring(0, 7); // YYYY-MM
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// 통계 업데이트 함수들
export const blackjackStatsActions = {
  // 새 세션 시작
  startSession(balance = 10000) {
    blackjackStats.update(stats => {
      const now = new Date();
      stats.sessionStats = {
        gamesPlayed: 0,
        netProfit: 0,
        startBalance: balance,
        currentBalance: balance,
        startTime: now.toISOString(),
        biggestWin: 0,
        biggestLoss: 0
      };
      saveStatsToStorage(stats);
      return stats;
    });
  },

  // 게임 결과 기록
  recordGameResult(gameResult) {
    blackjackStats.update(stats => {
      const {
        results,
        bets,
        winnings = 0,
        balance,
        playerHands = [],
        dealerHand = []
      } = gameResult;

      const now = new Date();
      const dateKey = getDateKey(now);
      const weekKey = getWeekKey(now);
      const monthKey = getMonthKey(now);

      // 기본 통계 업데이트
      stats.totalGames++;
      stats.sessionStats.gamesPlayed++;
      stats.sessionStats.currentBalance = balance;

      const totalBet = bets.reduce((sum, bet) => sum + bet, 0);
      const netResult = winnings - totalBet;

      stats.totalBet += totalBet;
      stats.netProfit += netResult;
      stats.sessionStats.netProfit += netResult;

      if (netResult > 0) {
        stats.totalWinnings += winnings;
        stats.wins++;
        stats.winStreak++;
        stats.lossStreak = 0;
        stats.maxWinStreak = Math.max(stats.maxWinStreak, stats.winStreak);

        if (netResult > stats.sessionStats.biggestWin) {
          stats.sessionStats.biggestWin = netResult;
        }
      } else if (netResult < 0) {
        stats.totalLoss += Math.abs(netResult);
        stats.losses++;
        stats.lossStreak++;
        stats.winStreak = 0;
        stats.maxLossStreak = Math.max(stats.maxLossStreak, stats.lossStreak);

        if (Math.abs(netResult) > stats.sessionStats.biggestLoss) {
          stats.sessionStats.biggestLoss = Math.abs(netResult);
        }
      } else {
        stats.pushes++;
        stats.winStreak = 0;
        stats.lossStreak = 0;
      }

      // 특별한 결과들 카운트
      results.forEach(result => {
        if (result === 'blackjack') stats.blackjacks++;
        if (result === 'bust') stats.busts++;
        if (result === 'surrender') stats.surrenders++;
      });

      // 계산된 통계들 업데이트
      stats.winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;
      stats.averageBet = stats.totalGames > 0 ? stats.totalBet / stats.totalGames : 0;
      stats.profitPerGame = stats.totalGames > 0 ? stats.netProfit / stats.totalGames : 0;

      // 일일 통계
      if (!stats.dailyStats[dateKey]) {
        stats.dailyStats[dateKey] = {
          games: 0,
          wins: 0,
          losses: 0,
          netProfit: 0,
          totalBet: 0
        };
      }
      const dailyStat = stats.dailyStats[dateKey];
      dailyStat.games++;
      dailyStat.totalBet += totalBet;
      dailyStat.netProfit += netResult;
      if (netResult > 0) dailyStat.wins++;
      else if (netResult < 0) dailyStat.losses++;

      // 주간 통계
      if (!stats.weeklyStats[weekKey]) {
        stats.weeklyStats[weekKey] = {
          games: 0,
          wins: 0,
          losses: 0,
          netProfit: 0,
          totalBet: 0
        };
      }
      const weeklyStat = stats.weeklyStats[weekKey];
      weeklyStat.games++;
      weeklyStat.totalBet += totalBet;
      weeklyStat.netProfit += netResult;
      if (netResult > 0) weeklyStat.wins++;
      else if (netResult < 0) weeklyStat.losses++;

      // 월간 통계
      if (!stats.monthlyStats[monthKey]) {
        stats.monthlyStats[monthKey] = {
          games: 0,
          wins: 0,
          losses: 0,
          netProfit: 0,
          totalBet: 0
        };
      }
      const monthlyStat = stats.monthlyStats[monthKey];
      monthlyStat.games++;
      monthlyStat.totalBet += totalBet;
      monthlyStat.netProfit += netResult;
      if (netResult > 0) monthlyStat.wins++;
      else if (netResult < 0) monthlyStat.losses++;

      // 게임 히스토리 저장 (최근 100게임만)
      stats.gameHistory.unshift({
        timestamp: now.toISOString(),
        results,
        bets,
        winnings,
        netResult,
        playerHands: playerHands.map(hand => hand.map(card => `${card.value}${card.suit}`)),
        dealerHand: dealerHand.map(card => `${card.value}${card.suit}`),
        balance
      });

      if (stats.gameHistory.length > 100) {
        stats.gameHistory = stats.gameHistory.slice(0, 100);
      }

      saveStatsToStorage(stats);
      return stats;
    });
  },

  // 통계 리셋
  resetStats() {
    blackjackStats.set(defaultStats);
    saveStatsToStorage(defaultStats);
  },

  // 특정 기간 통계 가져오기
  getPeriodStats(period, key) {
    let stats;
    blackjackStats.subscribe(s => stats = s)();

    switch (period) {
      case 'daily':
        return stats.dailyStats[key] || { games: 0, wins: 0, losses: 0, netProfit: 0, totalBet: 0 };
      case 'weekly':
        return stats.weeklyStats[key] || { games: 0, wins: 0, losses: 0, netProfit: 0, totalBet: 0 };
      case 'monthly':
        return stats.monthlyStats[key] || { games: 0, wins: 0, losses: 0, netProfit: 0, totalBet: 0 };
      default:
        return { games: 0, wins: 0, losses: 0, netProfit: 0, totalBet: 0 };
    }
  },

  // 오늘 통계
  getTodayStats() {
    return this.getPeriodStats('daily', getDateKey());
  },

  // 이번 주 통계
  getThisWeekStats() {
    return this.getPeriodStats('weekly', getWeekKey());
  },

  // 이번 달 통계
  getThisMonthStats() {
    return this.getPeriodStats('monthly', getMonthKey());
  }
};