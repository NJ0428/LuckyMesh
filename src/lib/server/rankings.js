import { rankingQueries, rewardConfigQueries, rewardDistributionQueries, vipQueries, gameQueries, userQueries } from './database.js';

/**
 * 랭킹 계산 및 저장
 * @param {string} rankingType - 'daily', 'weekly', 'monthly'
 * @param {string} gameType - 'blackjack', 'baccarat', 'roulette', 'slots', 'poker', 'sicbo', 'all'
 * @param {string} vipTier - 'silver', 'gold', 'platinum', 'all'
 * @param {string} periodStart - 기간 시작 (ISO string)
 * @param {string} periodEnd - 기간 종료 (ISO string)
 */
export function calculateRankings(rankingType, gameType, vipTier, periodStart, periodEnd) {
  try {
    // 기존 랭킹 삭제
    rankingQueries.deleteByPeriod.run(periodStart, periodEnd);

    // 게임 기록 집계
    let gameFilter = gameType === 'all' ? '' : `AND gh.game_type = '${gameType}'`;
    let vipFilter = vipTier === 'all' ? '' : `AND u.vip_tier = '${vipTier}'`;

    const aggregateQuery = `
      SELECT
        gh.user_id,
        u.username,
        u.vip_tier,
        COUNT(*) as games_played,
        SUM(gh.bet_amount) as total_bet_amount,
        SUM(gh.win_amount) as total_winnings,
        SUM(gh.win_amount - gh.bet_amount) as net_profit,
        CAST(SUM(CASE WHEN gh.win_amount > gh.bet_amount THEN 1 ELSE 0 END) AS REAL) / COUNT(*) as win_rate
      FROM game_history gh
      JOIN users u ON gh.user_id = u.id
      WHERE gh.created_at >= '${periodStart}'
        AND gh.created_at < '${periodEnd}'
        ${gameFilter}
        ${vipFilter}
      GROUP BY gh.user_id
      HAVING net_profit > 0
      ORDER BY net_profit DESC
    `;

    const results = gameQueries.getStats?.statement?.dataSource?.execute(aggregateQuery);

    // SQLite 직접 쿼리 실행
    const db = require('./database.js').default;
    const rankings = db.prepare(aggregateQuery).all();

    // 순위 부여 및 저장
    let rank = 1;
    let previousProfit = null;

    rankings.forEach((ranking, index) => {
      // 동순위 처리
      if (previousProfit !== null && ranking.net_profit < previousProfit) {
        rank = index + 1;
      }

      rankingQueries.upsert.run(
        ranking.user_id,
        rankingType,
        gameType,
        ranking.vip_tier || 'silver',
        periodStart,
        periodEnd,
        ranking.total_winnings || 0,
        ranking.total_bet_amount || 0,
        ranking.net_profit || 0,
        ranking.games_played || 0,
        ranking.win_rate || 0,
        rank
      );

      previousProfit = ranking.net_profit;
    });

    return {
      success: true,
      totalPlayers: rankings.length,
      message: `${rankings.length}명의 랭킹이 계산되었습니다.`
    };
  } catch (error) {
    console.error('Ranking calculation error:', error);
    return {
      success: false,
      error: '랭킹 계산 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 보상 지급
 * @param {string} rankingType - 'daily', 'weekly', 'monthly'
 * @param {string} gameType - 게임 타입
 * @param {string} periodStart - 기간 시작
 * @param {string} periodEnd - 기간 종료
 */
export function distributeRewards(rankingType, gameType, periodStart, periodEnd) {
  try {
    const db = require('./database.js').default;

    // 해당 기간의 랭킹 조회
    const rankings = db.prepare(`
      SELECT r.*, u.username
      FROM rankings r
      JOIN users u ON r.user_id = u.id
      WHERE r.period_start = ? AND r.period_end = ?
        AND r.ranking_type = ? AND r.game_type = ?
      ORDER BY r.rank ASC
    `).all(periodStart, periodEnd, rankingType, gameType);

    let distributedCount = 0;

    rankings.forEach(ranking => {
      // 해당 순위의 보상 설정 조회
      const reward = rewardConfigQueries.findForRank.get(
        rankingType,
        gameType,
        ranking.vip_tier,
        ranking.rank,
        ranking.rank
      );

      if (reward) {
        // 보상 지급 내역 생성
        const expiresAt = calculateRewardExpiry(reward.reward_type);
        rewardDistributionQueries.create.run(
          ranking.user_id,
          ranking.id,
          reward.id,
          reward.reward_type,
          reward.reward_amount,
          expiresAt
        );

        // VIP 포인트 지급
        if (reward.reward_type === 'points') {
          vipQueries.updatePoints.run(
            reward.reward_amount,
            0,
            ranking.user_id
          );
        }

        // 현금 보상인 경우 잔액에 추가 (자동 지급)
        if (reward.reward_type === 'cash') {
          const user = userQueries.findById.get(ranking.user_id);
          if (user) {
            userQueries.updateBalance.run(
              user.balance + reward.reward_amount,
              ranking.user_id
            );
          }
        }

        distributedCount++;
      }
    });

    return {
      success: true,
      distributedCount,
      message: `${distributedCount}명에게 보상이 지급되었습니다.`
    };
  } catch (error) {
    console.error('Reward distribution error:', error);
    return {
      success: false,
      error: '보상 지급 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 보상 만료일 계산
 * @param {string} rewardType - 'cash', 'bonus', 'points'
 * @returns {string|null} ISO datetime string
 */
function calculateRewardExpiry(rewardType) {
  if (rewardType === 'points') {
    return null; // VIP 포인트는 만료 없음
  }

  const now = new Date();
  if (rewardType === 'cash') {
    now.setDate(now.getDate() + 7); // 현금 보상 7일
  } else if (rewardType === 'bonus') {
    now.setDate(now.getDate() + 30); // 보너스 보상 30일
  }

  return now.toISOString();
}

/**
 * 초기 보상 설정 생성
 */
export function initializeRewardConfigs() {
  const configs = [
    // 일간 랭킹 보상
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 1, rankTo: 1, rewardType: 'cash', rewardAmount: 1000000 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 2, rankTo: 3, rewardType: 'cash', rewardAmount: 500000 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 4, rankTo: 10, rewardType: 'cash', rewardAmount: 100000 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 11, rankTo: 50, rewardType: 'cash', rewardAmount: 50000 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 51, rankTo: 100, rewardType: 'cash', rewardAmount: 10000 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 1, rankTo: 1, rewardType: 'points', rewardAmount: 1000 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 2, rankTo: 3, rewardType: 'points', rewardAmount: 500 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 4, rankTo: 10, rewardType: 'points', rewardAmount: 100 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 11, rankTo: 50, rewardType: 'points', rewardAmount: 50 },
    { rankingType: 'daily', gameType: 'all', vipTier: 'all', rankFrom: 51, rankTo: 100, rewardType: 'points', rewardAmount: 10 },

    // 주간 랭킹 보상
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 1, rankTo: 1, rewardType: 'cash', rewardAmount: 5000000 },
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 2, rankTo: 3, rewardType: 'cash', rewardAmount: 2000000 },
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 4, rankTo: 10, rewardType: 'cash', rewardAmount: 500000 },
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 11, rankTo: 50, rewardType: 'cash', rewardAmount: 200000 },
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 1, rankTo: 1, rewardType: 'points', rewardAmount: 5000 },
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 2, rankTo: 3, rewardType: 'points', rewardAmount: 2000 },
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 4, rankTo: 10, rewardType: 'points', rewardAmount: 500 },
    { rankingType: 'weekly', gameType: 'all', vipTier: 'all', rankFrom: 11, rankTo: 50, rewardType: 'points', rewardAmount: 200 },

    // 월간 랭킹 보상
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 1, rankTo: 1, rewardType: 'cash', rewardAmount: 20000000 },
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 2, rankTo: 3, rewardType: 'cash', rewardAmount: 10000000 },
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 4, rankTo: 10, rewardType: 'cash', rewardAmount: 2000000 },
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 11, rankTo: 50, rewardType: 'cash', rewardAmount: 1000000 },
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 1, rankTo: 1, rewardType: 'points', rewardAmount: 20000 },
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 2, rankTo: 3, rewardType: 'points', rewardAmount: 10000 },
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 4, rankTo: 10, rewardType: 'points', rewardAmount: 2000 },
    { rankingType: 'monthly', gameType: 'all', vipTier: 'all', rankFrom: 11, rankTo: 50, rewardType: 'points', rewardAmount: 1000 },
  ];

  try {
    const db = require('./database.js').default;

    // 기존 설정 삭제
    db.exec('DELETE FROM ranking_rewards');

    // 새 설정 삽입
    const insertStmt = db.prepare(`
      INSERT INTO ranking_rewards (ranking_type, game_type, vip_tier, rank_from, rank_to, reward_type, reward_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    configs.forEach(config => {
      insertStmt.run(
        config.rankingType,
        config.gameType,
        config.vipTier,
        config.rankFrom,
        config.rankTo,
        config.rewardType,
        config.rewardAmount
      );
    });

    return {
      success: true,
      message: `${configs.length}개의 보상 설정이 초기화되었습니다.`
    };
  } catch (error) {
    console.error('Reward config initialization error:', error);
    return {
      success: false,
      error: '보상 설정 초기화 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 기간별 랭킹 조회
 */
export function getRankings(rankingType, gameType, vipTier, periodStart, periodEnd) {
  try {
    let query;
    let params;

    if (vipTier === 'all') {
      query = rankingQueries.findByPeriod;
      params = [periodStart, periodEnd, rankingType, gameType];
    } else {
      query = rankingQueries.findByVipTier;
      params = [periodStart, periodEnd, rankingType, gameType, vipTier];
    }

    const rankings = query.all(...params);

    return {
      success: true,
      data: rankings.map(r => ({
        rank: r.rank,
        userId: r.user_id,
        username: r.username,
        fullName: r.full_name,
        vipTier: r.vip_tier,
        totalWinnings: r.total_winnings,
        totalBetAmount: r.total_bet_amount,
        netProfit: r.net_profit,
        gamesPlayed: r.games_played,
        winRate: r.win_rate
      }))
    };
  } catch (error) {
    console.error('Get rankings error:', error);
    return {
      success: false,
      error: '랭킹 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 사용자의 랭킹 조회
 */
export function getUserRank(userId, rankingType, gameType, periodStart, periodEnd) {
  try {
    const ranking = rankingQueries.findUserRank.get(
      userId,
      periodStart,
      periodEnd,
      rankingType,
      gameType
    );

    if (!ranking) {
      return {
        success: true,
        data: null
      };
    }

    return {
      success: true,
      data: {
        rank: ranking.rank,
        vipTier: ranking.vip_tier,
        totalWinnings: ranking.total_winnings,
        totalBetAmount: ranking.total_bet_amount,
        netProfit: ranking.net_profit,
        gamesPlayed: ranking.games_played,
        winRate: ranking.win_rate
      }
    };
  } catch (error) {
    console.error('Get user rank error:', error);
    return {
      success: false,
      error: '내 순위 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 랭킹 요약 통계 조회
 */
export function getRankingSummary(rankingType, gameType, periodStart, periodEnd) {
  try {
    const summary = rankingQueries.getSummary.get(
      periodStart,
      periodEnd,
      rankingType,
      gameType
    );

    return {
      success: true,
      data: {
        totalPlayers: summary.total_players || 0,
        top10Players: summary.top_10_players || 0,
        avgProfit: summary.avg_profit || 0,
        avgWinRate: summary.avg_win_rate || 0
      }
    };
  } catch (error) {
    console.error('Get ranking summary error:', error);
    return {
      success: false,
      error: '요약 통계 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 받을 수 있는 보상 조회
 */
export function getAvailableRewards(userId) {
  try {
    const rewards = rewardDistributionQueries.findUnclaimed.all(userId);

    return {
      success: true,
      data: rewards.map(r => ({
        id: r.id,
        rewardType: r.reward_type,
        rewardAmount: r.reward_amount,
        rankFrom: r.rank_from,
        rankTo: r.rank_to,
        gameType: r.game_type,
        rankingType: r.ranking_type,
        distributedAt: r.distributed_at,
        expiresAt: r.expires_at
      }))
    };
  } catch (error) {
    console.error('Get available rewards error:', error);
    return {
      success: false,
      error: '받을 보상 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 보상 수령
 */
export function claimReward(rewardId, userId) {
  try {
    // 보상 정보 조회
    const reward = rewardDistributionQueries.findById.get(rewardId);

    if (!reward) {
      return {
        success: false,
        error: '보상을 찾을 수 없습니다.'
      };
    }

    if (reward.user_id !== userId) {
      return {
        success: false,
        error: '권한이 없습니다.'
      };
    }

    if (reward.is_claimed) {
      return {
        success: false,
        error: '이미 수령한 보상입니다.'
      };
    }

    // 만료 확인
    if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
      return {
        success: false,
        error: '만료된 보상입니다.'
      };
    }

    // 보상 수령 처리
    const claimed = rewardDistributionQueries.claim.run(rewardId, userId);

    if (claimed.changes === 0) {
      return {
        success: false,
        error: '보상 수령에 실패했습니다.'
      };
    }

    // 보너스 보상인 경우 잔액에 추가
    if (reward.reward_type === 'bonus') {
      const user = userQueries.findById.get(userId);
      if (user) {
        userQueries.updateBalance.run(
          user.balance + reward.reward_amount,
          userId
        );
      }
    }

    return {
      success: true,
      message: `${reward.reward_amount}원을 받았습니다.`,
      data: {
        rewardType: reward.reward_type,
        rewardAmount: reward.reward_amount
      }
    };
  } catch (error) {
    console.error('Claim reward error:', error);
    return {
      success: false,
      error: '보상 수령 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 보상 내역 조회
 */
export function getRewardHistory(userId) {
  try {
    const history = rewardDistributionQueries.findByUser.all(userId);

    return {
      success: true,
      data: history.map(r => ({
        id: r.id,
        rewardType: r.reward_type,
        rewardAmount: r.reward_amount,
        rankFrom: r.rank_from,
        rankTo: r.rank_to,
        gameType: r.game_type,
        rankingType: r.ranking_type,
        isClaimed: r.is_claimed,
        distributedAt: r.distributed_at,
        claimedAt: r.claimed_at,
        expiresAt: r.expires_at
      }))
    };
  } catch (error) {
    console.error('Get reward history error:', error);
    return {
      success: false,
      error: '보상 내역 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 기간 계산 헬퍼 함수
 */
export function getPeriod(rankingType, date = new Date()) {
  const periodStart = new Date(date);
  const periodEnd = new Date(date);

  switch (rankingType) {
    case 'daily':
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setHours(23, 59, 59, 999);
      periodEnd.setDate(periodEnd.getDate() + 1);
      break;
    case 'weekly':
      const dayOfWeek = periodStart.getDay();
      const diff = periodStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      periodStart.setDate(diff);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setDate(diff + 7);
      periodEnd.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(1);
      periodEnd.setHours(0, 0, 0, 0);
      break;
  }

  return {
    start: periodStart.toISOString(),
    end: periodEnd.toISOString()
  };
}
