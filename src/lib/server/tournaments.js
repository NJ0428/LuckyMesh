import { tournamentQueries, userQueries } from './database.js';

/**
 * 토너먼트 생성
 * @param {Object} config - 토너먼트 설정
 * @returns {Object} 생성 결과
 */
export function createTournament(config) {
  try {
    const result = tournamentQueries.create.run(
      config.name,
      config.description || null,
      config.tournamentType, // 'daily', 'weekly', 'special'
      config.gameType, // 'blackjack', 'baccarat', 'roulette', 'slots', 'poker', 'sicbo', 'all'
      config.entryFee || 0,
      config.prizePool || 0,
      config.minParticipants || 10,
      config.maxParticipants || 1000,
      config.registrationStart,
      config.registrationEnd,
      config.tournamentStart,
      config.tournamentEnd,
      config.prizeDistributionType || 'percentage',
      config.totalPrizes || 10,
      config.vipTierRequired || 'all',
      config.minBalanceRequired || 0,
      config.autoStart !== undefined ? config.autoStart : true,
      config.createdBy || null
    );

    // 보상 구성 생성
    if (config.prizes && config.prizes.length > 0) {
      config.prizes.forEach(prize => {
        tournamentQueries.createPrize.run(
          result.lastInsertRowid,
          prize.rankFrom,
          prize.rankTo,
          prize.prizeType, // 'cash', 'bonus', 'points'
          prize.prizeAmount,
          prize.prizePercentage || null
        );
      });
    }

    return {
      success: true,
      data: {
        id: result.lastInsertRowid,
        message: '토너먼트가 생성되었습니다.'
      }
    };
  } catch (error) {
    console.error('Create tournament error:', error);
    return {
      success: false,
      error: '토너먼트 생성 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 참가
 * @param {number} tournamentId - 토너먼트 ID
 * @param {number} userId - 사용자 ID
 * @returns {Object} 참가 결과
 */
export function joinTournament(tournamentId, userId) {
  try {
    // 토너먼트 조회
    const tournament = tournamentQueries.findById.get(tournamentId);
    if (!tournament) {
      return {
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      };
    }

    // 상태 확인
    if (tournament.status !== 'registration') {
      return {
        success: false,
        error: '현재 참가 신청 기간이 아닙니다.'
      };
    }

    // 기간 확인
    const now = new Date();
    if (now < new Date(tournament.registration_start) || now > new Date(tournament.registration_end)) {
      return {
        success: false,
        error: '참가 신청 기간이 아닙니다.'
      };
    }

    // 사용자 정보 확인
    const user = userQueries.findById.get(userId);
    if (!user) {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      };
    }

    // 잔액 확인
    if (user.balance < tournament.entry_fee) {
      return {
        success: false,
        error: `잔액이 부족합니다. 필요 금액: ${tournament.entry_fee.toLocaleString()}원`
      };
    }

    // 최소 잔액 확인
    if (user.balance < tournament.min_balance_required) {
      return {
        success: false,
        error: `최소 잔액 요건을 충족하지 않습니다. 필요: ${tournament.min_balance_required.toLocaleString()}원`
      };
    }

    // VIP 등급 확인
    if (tournament.vip_tier_required !== 'all') {
      const vipTierOrder = { 'silver': 1, 'gold': 2, 'platinum': 3 };
      if (vipTierOrder[user.vip_tier] < vipTierOrder[tournament.vip_tier_required]) {
        return {
          success: false,
          error: `${tournament.vip_tier_required.toUpperCase()} 등급 이상만 참가 가능합니다.`
        };
      }
    }

    // 이미 참가 중인지 확인
    const existingParticipant = tournamentQueries.findParticipant.get(tournamentId, userId);
    if (existingParticipant) {
      return {
        success: false,
        error: '이미 참가 중인 토너먼트입니다.'
      };
    }

    // 참가자 수 확인
    const participantCount = tournamentQueries.countParticipants.get(tournamentId);
    if (participantCount.count >= tournament.max_participants) {
      return {
        success: false,
        error: '참가 인원이 가득 찼습니다.'
      };
    }

    // 참가비 차감
    userQueries.updateBalance.run(user.balance - tournament.entry_fee, userId);

    // 참가자 추가
    tournamentQueries.addParticipant.run(
      tournamentId,
      userId,
      tournament.entry_fee,
      tournament.entry_fee
    );

    return {
      success: true,
      message: '토너먼트에 참가했습니다.',
      data: {
        tournamentId,
        entryFee: tournament.entry_fee
      }
    };
  } catch (error) {
    console.error('Join tournament error:', error);
    return {
      success: false,
      error: '토너먼트 참가 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 탈퇴
 * @param {number} tournamentId - 토너먼트 ID
 * @param {number} userId - 사용자 ID
 * @returns {Object} 탈퇴 결과
 */
export function leaveTournament(tournamentId, userId) {
  try {
    // 토너먼트 조회
    const tournament = tournamentQueries.findById.get(tournamentId);
    if (!tournament) {
      return {
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      };
    }

    // 상태 확인 (진행 중에는 탈퇴 불가)
    if (tournament.status === 'ongoing' || tournament.status === 'completed') {
      return {
        success: false,
        error: '이미 시작된 토너먼트는 탈퇴할 수 없습니다.'
      };
    }

    // 참가자 확인
    const participant = tournamentQueries.findParticipant.get(tournamentId, userId);
    if (!participant) {
      return {
        success: false,
        error: '참가 중인 토너먼트가 아닙니다.'
      };
    }

    // 참가비 환불
    if (participant.entry_fee_paid > 0) {
      const user = userQueries.findById.get(userId);
      if (user) {
        userQueries.updateBalance.run(user.balance + participant.entry_fee_paid, userId);
      }
    }

    // 참가자 삭제
    tournamentQueries.removeParticipant.run(tournamentId, userId);

    return {
      success: true,
      message: '토너먼트에서 탈퇴했습니다.'
    };
  } catch (error) {
    console.error('Leave tournament error:', error);
    return {
      success: false,
      error: '토너먼트 탈퇴 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 시작
 * @param {number} tournamentId - 토너먼트 ID
 * @returns {Object} 시작 결과
 */
export function startTournament(tournamentId) {
  try {
    // 토너먼트 조회
    const tournament = tournamentQueries.findById.get(tournamentId);
    if (!tournament) {
      return {
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      };
    }

    // 상태 확인
    if (tournament.status !== 'registration') {
      return {
        success: false,
        error: '이미 시작되었거나 종료된 토너먼트입니다.'
      };
    }

    // 최소 참가자 확인
    const participantCount = tournamentQueries.countParticipants.get(tournamentId);
    if (participantCount.count < tournament.min_participants) {
      return {
        success: false,
        error: `최소 참가자 수에 미달합니다. 필요: ${tournament.min_participants}명, 현재: ${participantCount.count}명`
      };
    }

    // 상태 변경
    tournamentQueries.updateStatus.run('ongoing', tournamentId);

    // 모든 참가자의 랭킹 초기화
    const db = require('./database.js').default;
    db.prepare(`
      UPDATE tournament_participants
      SET current_rank = 0, updated_at = CURRENT_TIMESTAMP
      WHERE tournament_id = ? AND status = 'registered'
    `).run(tournamentId);

    return {
      success: true,
      message: '토너먼트가 시작되었습니다.',
      data: {
        participantCount: participantCount.count
      }
    };
  } catch (error) {
    console.error('Start tournament error:', error);
    return {
      success: false,
      error: '토너먼트 시작 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 종료 및 상금 지급
 * @param {number} tournamentId - 토너먼트 ID
 * @returns {Object} 종료 결과
 */
export function endTournament(tournamentId) {
  try {
    const db = require('./database.js').default;

    // 토너먼트 조회
    const tournament = tournamentQueries.findById.get(tournamentId);
    if (!tournament) {
      return {
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      };
    }

    // 상태 확인
    if (tournament.status !== 'ongoing') {
      return {
        success: false,
        error: '진행 중인 토너먼트가 아닙니다.'
      };
    }

    // 최종 랭킹 계산
    tournamentQueries.recalculateRankings.run(tournamentId);

    // 보상 지급
    const prizes = tournamentQueries.findPrizesByTournament.all(tournamentId);
    let distributedCount = 0;

    prizes.forEach(prize => {
      if (!prize.is_distributed) {
        // 해당 순위 범위의 참가자 찾기
        const winners = db.prepare(`
          SELECT tp.*, u.username
          FROM tournament_participants tp
          JOIN users u ON tp.user_id = u.id
          WHERE tp.tournament_id = ? AND tp.current_rank >= ? AND tp.current_rank <= ?
          ORDER BY tp.current_rank ASC
        `).all(tournamentId, prize.rank_from, prize.rank_to);

        if (winners.length > 0) {
          // 각 승리자에게 보상 지급
          winners.forEach(winner => {
            const user = userQueries.findById.get(winner.user_id);
            if (user) {
              if (prize.prize_type === 'points') {
                // VIP 포인트 지급
                const vipQueries = require('./database.js').vipQueries;
                vipQueries.updatePoints.run(prize.prize_amount, 0, winner.user_id);
              } else {
                // 현금 또는 보너스 지급
                userQueries.updateBalance.run(user.balance + prize.prize_amount, winner.user_id);
              }
            }
          });

          // 보상 지급 표시
          tournamentQueries.distributePrize.run(winners[0].user_id, prize.id);
          distributedCount++;
        }
      }
    });

    // 상태 변경
    tournamentQueries.updateStatus.run('completed', tournamentId);

    return {
      success: true,
      message: `토너먼트가 종료되었습니다. ${distributedCount}명에게 상금이 지급되었습니다.`,
      data: {
        distributedCount
      }
    };
  } catch (error) {
    console.error('End tournament error:', error);
    return {
      success: false,
      error: '토너먼트 종료 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 게임 기록
 * @param {number} userId - 사용자 ID
 * @param {string} gameType - 게임 타입
 * @param {number} betAmount - 베팅 금액
 * @param {number} winAmount - 당첨 금액
 * @returns {Object} 기록 결과
 */
export function recordTournamentGame(userId, gameType, betAmount, winAmount) {
  try {
    const db = require('./database.js').default;

    // 사용자가 참가 중인 진행 중인 토너먼트 찾기
    const activeTournaments = tournamentQueries.findActiveTournamentsForUser.all(userId);

    if (activeTournaments.length === 0) {
      return {
        success: true,
        message: '진행 중인 토너먼트가 없습니다.'
      };
    }

    let recordedCount = 0;

    activeTournaments.forEach(tournament => {
      // 게임 타입 확인
      if (tournament.game_type !== 'all' && tournament.game_type !== gameType) {
        return; // 이 토너먼트는 해당 게임 타입이 아님
      }

      const profit = winAmount - betAmount;
      const result = profit > 0 ? 'win' : (profit < 0 ? 'lose' : 'tie');

      // 게임 기록 추가
      tournamentQueries.recordGame.run(
        tournament.id,
        userId,
        gameType,
        betAmount,
        winAmount,
        result
      );

      // 참가자 통계 업데이트
      tournamentQueries.updateParticipantStats.run(
        betAmount,
        winAmount,
        winAmount,
        betAmount,
        tournament.id,
        userId
      );

      // 랭킹 재계산
      tournamentQueries.recalculateRankings.run(tournament.id);

      recordedCount++;
    });

    return {
      success: true,
      message: `${recordedCount}개의 토너먼트에 게임이 기록되었습니다.`,
      data: {
        recordedCount
      }
    };
  } catch (error) {
    console.error('Record tournament game error:', error);
    return {
      success: false,
      error: '토너먼트 게임 기록 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 랭킹판 조회
 * @param {number} tournamentId - 토너먼트 ID
 * @returns {Object} 랭킹판 데이터
 */
export function getTournamentLeaderboard(tournamentId) {
  try {
    // 토너먼트 조회
    const tournament = tournamentQueries.findById.get(tournamentId);
    if (!tournament) {
      return {
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      };
    }

    // 참가자 랭킹 조회
    const participants = tournamentQueries.findParticipantsByTournament.all(tournamentId);

    // 보상 정보 추가
    const leaderboard = participants.map(p => {
      const prize = tournamentQueries.findPrizesForRank.get(tournamentId, p.current_rank, p.current_rank);
      return {
        rank: p.current_rank,
        userId: p.user_id,
        username: p.username,
        vipTier: p.vip_tier,
        totalBetAmount: p.total_bet_amount,
        totalWinAmount: p.total_win_amount,
        netProfit: p.net_profit,
        gamesPlayed: p.games_played,
        status: p.status,
        potentialPrize: prize ? {
          type: prize.prize_type,
          amount: prize.prize_amount
        } : null
      };
    });

    return {
      success: true,
      data: {
        tournament: {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status,
          tournamentType: tournament.tournament_type,
          gameType: tournament.game_type,
          prizePool: tournament.prize_pool,
          entryFee: tournament.entry_fee,
          tournamentStart: tournament.tournament_start,
          tournamentEnd: tournament.tournament_end
        },
        leaderboard
      }
    };
  } catch (error) {
    console.error('Get tournament leaderboard error:', error);
    return {
      success: false,
      error: '랭킹판 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 사용자의 토너먼트 성적 조회
 * @param {number} tournamentId - 토너먼트 ID
 * @param {number} userId - 사용자 ID
 * @returns {Object} 성적 데이터
 */
export function getMyTournamentPerformance(tournamentId, userId) {
  try {
    // 토너먼트 조회
    const tournament = tournamentQueries.findById.get(tournamentId);
    if (!tournament) {
      return {
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      };
    }

    // 참가자 정보 조회
    const participant = tournamentQueries.findParticipant.get(tournamentId, userId);

    if (!participant) {
      return {
        success: true,
        data: {
          isParticipant: false,
          tournament: {
            id: tournament.id,
            name: tournament.name,
            status: tournament.status
          }
        }
      };
    }

    // 게임 기록 조회
    const games = tournamentQueries.findGamesByUserAndTournament.all(tournamentId, userId);

    // 잠재적 보상 조회
    let potentialPrize = null;
    if (participant.current_rank > 0) {
      const prize = tournamentQueries.findPrizesForRank.get(tournamentId, participant.current_rank, participant.current_rank);
      if (prize) {
        potentialPrize = {
          type: prize.prize_type,
          amount: prize.prize_amount,
          rankFrom: prize.rank_from,
          rankTo: prize.rank_to
        };
      }
    }

    return {
      success: true,
      data: {
        isParticipant: true,
        tournament: {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status
        },
        performance: {
          rank: participant.current_rank,
          totalBetAmount: participant.total_bet_amount,
          totalWinAmount: participant.total_win_amount,
          netProfit: participant.net_profit,
          gamesPlayed: participant.games_played,
          status: participant.status,
          entryFeePaid: participant.entry_fee_paid
        },
        potentialPrize,
        games: games.map(g => ({
          gameType: g.game_type,
          betAmount: g.bet_amount,
          winAmount: g.win_amount,
          result: g.result,
          playedAt: g.played_at
        }))
      }
    };
  } catch (error) {
    console.error('Get my tournament performance error:', error);
    return {
      success: false,
      error: '성적 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 목록 조회
 * @param {Object} filters - 필터 옵션
 * @returns {Object} 토너먼트 목록
 */
export function getTournaments(filters = {}) {
  try {
    let tournaments;

    if (filters.status) {
      tournaments = tournamentQueries.findByStatus.all(filters.status);
    } else if (filters.type && filters.status) {
      tournaments = tournamentQueries.findByTypeAndStatus.all(filters.type, filters.status);
    } else {
      tournaments = tournamentQueries.findAll.all();
    }

    return {
      success: true,
      data: tournaments.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        tournamentType: t.tournament_type,
        gameType: t.game_type,
        entryFee: t.entry_fee,
        prizePool: t.prize_pool,
        minParticipants: t.min_participants,
        maxParticipants: t.max_participants,
        status: t.status,
        registrationStart: t.registration_start,
        registrationEnd: t.registration_end,
        tournamentStart: t.tournament_start,
        tournamentEnd: t.tournament_end,
        vipTierRequired: t.vip_tier_required,
        minBalanceRequired: t.min_balance_required,
        createdAt: t.created_at
      }))
    };
  } catch (error) {
    console.error('Get tournaments error:', error);
    return {
      success: false,
      error: '토너먼트 목록 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 토너먼트 상세 조회
 * @param {number} tournamentId - 토너먼트 ID
 * @returns {Object} 토너먼트 상세 정보
 */
export function getTournamentDetails(tournamentId) {
  try {
    const db = require('./database.js').default;

    const tournament = tournamentQueries.findById.get(tournamentId);

    if (!tournament) {
      return {
        success: false,
        error: '토너먼트를 찾을 수 없습니다.'
      };
    }

    // 참가자 수 조회
    const participantCount = tournamentQueries.countParticipants.get(tournamentId);

    // 보상 구성 조회
    const prizes = tournamentQueries.findPrizesByTournament.all(tournamentId);

    return {
      success: true,
      data: {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        tournamentType: tournament.tournament_type,
        gameType: tournament.game_type,
        entryFee: tournament.entry_fee,
        prizePool: tournament.prize_pool,
        minParticipants: tournament.min_participants,
        maxParticipants: tournament.max_participants,
        status: tournament.status,
        registrationStart: tournament.registration_start,
        registrationEnd: tournament.registration_end,
        tournamentStart: tournament.tournament_start,
        tournamentEnd: tournament.tournament_end,
        vipTierRequired: tournament.vip_tier_required,
        minBalanceRequired: tournament.min_balance_required,
        currentParticipants: participantCount.count,
        prizes: prizes.map(p => ({
          rankFrom: p.rank_from,
          rankTo: p.rank_to,
          prizeType: p.prize_type,
          prizeAmount: p.prize_amount,
          prizePercentage: p.prize_percentage
        })),
        createdAt: tournament.created_at
      }
    };
  } catch (error) {
    console.error('Get tournament details error:', error);
    return {
      success: false,
      error: '토너먼트 상세 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 초기 토너먼트 템플릿 생성
 */
export function initializeDefaultTournaments() {
  const now = new Date();

  const defaultTournaments = [
    {
      name: '일일 블랙잭 챌린지',
      description: '매일 진행되는 블랙잭 토너먼트',
      tournamentType: 'daily',
      gameType: 'blackjack',
      entryFee: 10000,
      prizePool: 1000000,
      minParticipants: 10,
      maxParticipants: 500,
      registrationStart: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
      registrationEnd: new Date(now.setHours(23, 59, 59, 999)).toISOString(),
      tournamentStart: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
      tournamentEnd: new Date(now.setHours(23, 59, 59, 999)).toISOString(),
      prizes: [
        { rankFrom: 1, rankTo: 1, prizeType: 'cash', prizeAmount: 500000 },
        { rankFrom: 2, rankTo: 3, prizeType: 'cash', prizeAmount: 200000 },
        { rankFrom: 4, rankTo: 10, prizeType: 'cash', prizeAmount: 50000 },
        { rankFrom: 11, rankTo: 50, prizeType: 'points', prizeAmount: 1000 }
      ]
    },
    {
      name: '주간 바카라 배틀',
      description: '매주 진행되는 바카라 토너먼트',
      tournamentType: 'weekly',
      gameType: 'baccarat',
      entryFee: 50000,
      prizePool: 5000000,
      minParticipants: 20,
      maxParticipants: 1000,
      registrationStart: new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString(),
      registrationEnd: new Date(now.setDate(now.getDate() - now.getDay() + 7)).toISOString(),
      tournamentStart: new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString(),
      tournamentEnd: new Date(now.setDate(now.getDate() - now.getDay() + 7)).toISOString(),
      prizes: [
        { rankFrom: 1, rankTo: 1, prizeType: 'cash', prizeAmount: 2000000 },
        { rankFrom: 2, rankTo: 3, prizeType: 'cash', prizeAmount: 1000000 },
        { rankFrom: 4, rankTo: 10, prizeType: 'cash', prizeAmount: 200000 },
        { rankFrom: 11, rankTo: 100, prizeType: 'points', prizeAmount: 5000 }
      ]
    },
    {
      name: '주말 룰렛 Royale',
      description: '주말에만 진행되는 특별 룰렛 토너먼트',
      tournamentType: 'weekly',
      gameType: 'roulette',
      entryFee: 20000,
      prizePool: 2000000,
      minParticipants: 15,
      maxParticipants: 800,
      registrationStart: new Date(now.setDate(now.getDate() - now.getDay() + 6)).toISOString(),
      registrationEnd: new Date(now.setDate(now.getDate() - now.getDay() + 8)).toISOString(),
      tournamentStart: new Date(now.setDate(now.getDate() - now.getDay() + 6)).toISOString(),
      tournamentEnd: new Date(now.setDate(now.getDate() - now.getDay() + 8)).toISOString(),
      vipTierRequired: 'gold',
      prizes: [
        { rankFrom: 1, rankTo: 1, prizeType: 'cash', prizeAmount: 1000000 },
        { rankFrom: 2, rankTo: 3, prizeType: 'cash', prizeAmount: 500000 },
        { rankFrom: 4, rankTo: 10, prizeType: 'cash', prizeAmount: 100000 },
        { rankFrom: 11, rankTo: 50, prizeType: 'points', prizeAmount: 2000 }
      ]
    }
  ];

  const results = [];

  defaultTournaments.forEach(config => {
    const result = createTournament(config);
    if (result.success) {
      results.push(result.data);
    }
  });

  return {
    success: true,
    message: `${results.length}개의 기본 토너먼트가 생성되었습니다.`,
    data: results
  };
}
