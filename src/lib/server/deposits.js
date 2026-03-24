import { depositQueries, userQueries } from './database.js';

// VIP 등급별 기본 이자율 설정
const VIP_INTEREST_RATES = {
  bronze: 0.01,    // 1% 일일 이자
  silver: 0.015,   // 1.5% 일일 이자
  gold: 0.02,      // 2% 일일 이자
  platinum: 0.025, // 2.5% 일일 이자
  diamond: 0.03    // 3% 일일 이자
};

// 이자 지급 주기 상수
const INTEREST_PERIODS = {
  daily: 1,      // 1일
  weekly: 7      // 7일
};

// 비활성화 기간 (일)
const INACTIVE_DAYS = 7;

/**
 * 사용자의 예치금 계좌를 생성합니다.
 */
export function createDepositAccount(userId, initialAmount = 0, interestType = 'daily') {
  try {
    const user = userQueries.findById.get(userId);
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    // 이미 예치금 계좌가 있는지 확인
    const existing = depositQueries.findByUserId.get(userId);
    if (existing) {
      return { success: false, error: '이미 예치금 계좌가 존재합니다.' };
    }

    // VIP 등급에 따른 이자율 설정
    const interestRate = VIP_INTEREST_RATES[user.vip_tier] || 0.01;

    // 예치금 계좌 생성
    const result = depositQueries.create.run(userId, initialAmount, interestRate, interestType);

    // 초기 입금 내역 기록
    if (initialAmount > 0) {
      const deposit = depositQueries.findByUserId.get(userId);
      depositQueries.createTransaction.run(
        deposit.id,
        userId,
        'deposit',
        initialAmount,
        0,
        initialAmount,
        '초기 입금'
      );
    }

    return {
      success: true,
      depositId: result.lastInsertRowid,
      interestRate,
      message: '예치금 계좌가 생성되었습니다.'
    };
  } catch (error) {
    console.error('예치금 계좌 생성 오류:', error);
    return { success: false, error: '계좌 생성에 실패했습니다.' };
  }
}

/**
 * 예치금 계좌에 칩을 입금합니다.
 */
export function depositChips(userId, amount) {
  try {
    if (amount <= 0) {
      return { success: false, error: '입금 금액은 0보다 커야 합니다.' };
    }

    const user = userQueries.findById.get(userId);
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    if (user.balance < amount) {
      return { success: false, error: '잔액이 부족합니다.' };
    }

    const deposit = depositQueries.findByUserId.get(userId);
    if (!deposit) {
      return { success: false, error: '예치금 계좌를 찾을 수 없습니다.' };
    }

    if (deposit.status !== 'active') {
      return { success: false, error: '비활성화된 계좌입니다.' };
    }

    const balanceBefore = deposit.amount;
    const balanceAfter = balanceBefore + amount;

    // 사용자 잔액 차감
    userQueries.updateBalance.run(user.balance - amount, userId);

    // 예치금 입금
    depositQueries.deposit.run(amount, deposit.id, userId);

    // 입금 내역 기록
    depositQueries.createTransaction.run(
      deposit.id,
      userId,
      'deposit',
      amount,
      balanceBefore,
      balanceAfter,
      '입금'
    );

    // 활동 시간 업데이트
    depositQueries.updateActivity.run(userId);

    return {
      success: true,
      balance: balanceAfter,
      message: `${amount.toLocaleString()}칩을 입금했습니다.`
    };
  } catch (error) {
    console.error('입금 오류:', error);
    return { success: false, error: '입금에 실패했습니다.' };
  }
}

/**
 * 예치금 계좌에서 칩을 출금합니다.
 */
export function withdrawChips(userId, amount) {
  try {
    if (amount <= 0) {
      return { success: false, error: '출금 금액은 0보다 커야 합니다.' };
    }

    const deposit = depositQueries.findByUserId.get(userId);
    if (!deposit) {
      return { success: false, error: '예치금 계좌를 찾을 수 없습니다.' };
    }

    if (deposit.status !== 'active') {
      return { success: false, error: '비활성화된 계좌입니다.' };
    }

    if (deposit.amount < amount) {
      return { success: false, error: '예치금이 부족합니다.' };
    }

    const user = userQueries.findById.get(userId);
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    const balanceBefore = deposit.amount;
    const balanceAfter = balanceBefore - amount;

    // 예치금 출금
    depositQueries.withdraw.run(amount, deposit.id, userId, amount);

    // 사용자 잔액 증가
    userQueries.updateBalance.run(user.balance + amount, userId);

    // 출금 내역 기록
    depositQueries.createTransaction.run(
      deposit.id,
      userId,
      'withdrawal',
      amount,
      balanceBefore,
      balanceAfter,
      '출금'
    );

    // 활동 시간 업데이트
    depositQueries.updateActivity.run(userId);

    return {
      success: true,
      balance: balanceAfter,
      message: `${amount.toLocaleString()}칩을 출금했습니다.`
    };
  } catch (error) {
    console.error('출금 오류:', error);
    return { success: false, error: '출금에 실패했습니다.' };
  }
}

/**
 * 이자를 지급합니다.
 */
export function payInterest(depositId) {
  try {
    const deposit = depositQueries.findById.get(depositId);
    if (!deposit) {
      return { success: false, error: '예치금 계좌를 찾을 수 없습니다.' };
    }

    if (deposit.status !== 'active') {
      return { success: false, error: '비활성화된 계좌입니다.' };
    }

    if (deposit.amount <= 0) {
      return { success: false, error: '이자를 지급할 예치금이 없습니다.' };
    }

    const balanceBefore = deposit.amount;
    const interestAmount = Math.floor(balanceBefore * deposit.interest_rate);
    const balanceAfter = balanceBefore + interestAmount;

    // 이자 지급
    depositQueries.deposit.run(interestAmount, deposit.id, deposit.user_id);

    // 이자 지급 내역 기록
    depositQueries.createInterestHistory.run(
      deposit.id,
      deposit.user_id,
      interestAmount,
      deposit.interest_rate,
      balanceBefore,
      balanceAfter
    );

    // 이자 지급 시간 업데이트
    depositQueries.updateInterestPaid.run(deposit.id);

    return {
      success: true,
      interestAmount,
      balance: balanceAfter,
      message: `${interestAmount.toLocaleString()}칩의 이자가 지급되었습니다.`
    };
  } catch (error) {
    console.error('이자 지급 오류:', error);
    return { success: false, error: '이자 지급에 실패했습니다.' };
  }
}

/**
 * 모든 활성 계좌에 이자를 지급합니다 (일일).
 */
export function payDailyInterest() {
  try {
    const activeDeposits = depositQueries.findActive.all();
    let successCount = 0;
    let totalInterest = 0;

    for (const deposit of activeDeposits) {
      // 일일 이자 지급 대상만
      if (deposit.interest_type === 'daily') {
        // 마지막 이자 지급 시간 확인 (24시간 이후)
        if (deposit.last_interest_paid) {
          const lastPaid = new Date(deposit.last_interest_paid);
          const now = new Date();
          const hoursDiff = (now - lastPaid) / (1000 * 60 * 60);

          if (hoursDiff >= 24) {
            const result = payInterest(deposit.id);
            if (result.success) {
              successCount++;
              totalInterest += result.interestAmount;
            }
          }
        } else {
          // 이자 지급 내역이 없으면 지급
          const result = payInterest(deposit.id);
          if (result.success) {
            successCount++;
            totalInterest += result.interestAmount;
          }
        }
      }
    }

    return {
      success: true,
      successCount,
      totalInterest,
      message: `${successCount}개 계좌에 총 ${totalInterest.toLocaleString()}칩의 이자를 지급했습니다.`
    };
  } catch (error) {
    console.error('일일 이자 지급 오류:', error);
    return { success: false, error: '일일 이자 지급에 실패했습니다.' };
  }
}

/**
 * 모든 활성 계좌에 이자를 지급합니다 (주간).
 */
export function payWeeklyInterest() {
  try {
    const activeDeposits = depositQueries.findActive.all();
    let successCount = 0;
    let totalInterest = 0;

    for (const deposit of activeDeposits) {
      // 주간 이자 지급 대상만
      if (deposit.interest_type === 'weekly') {
        // 마지막 이자 지급 시간 확인 (7일 이후)
        if (deposit.last_interest_paid) {
          const lastPaid = new Date(deposit.last_interest_paid);
          const now = new Date();
          const daysDiff = (now - lastPaid) / (1000 * 60 * 60 * 24);

          if (daysDiff >= 7) {
            const result = payInterest(deposit.id);
            if (result.success) {
              successCount++;
              totalInterest += result.interestAmount;
            }
          }
        } else {
          // 이자 지급 내역이 없으면 지급
          const result = payInterest(deposit.id);
          if (result.success) {
            successCount++;
            totalInterest += result.interestAmount;
          }
        }
      }
    }

    return {
      success: true,
      successCount,
      totalInterest,
      message: `${successCount}개 계좌에 총 ${totalInterest.toLocaleString()}칩의 이자를 지급했습니다.`
    };
  } catch (error) {
    console.error('주간 이자 지급 오류:', error);
    return { success: false, error: '주간 이자 지급에 실패했습니다.' };
  }
}

/**
 * 비활성 계좌를 자동 해지하고 예치금을 반환합니다.
 */
export function closeInactiveAccounts() {
  try {
    const inactiveDeposits = depositQueries.findInactive.all(INACTIVE_DAYS);
    let closedCount = 0;
    let totalRefund = 0;

    for (const deposit of inactiveDeposits) {
      const user = userQueries.findById.get(deposit.user_id);
      if (!user) continue;

      // 사용자 잔액으로 환불
      userQueries.updateBalance.run(user.balance + deposit.amount, deposit.user_id);

      // 계좌 상태 변경
      depositQueries.updateStatus.run('closed', deposit.id);

      // 출금 내역 기록
      depositQueries.createTransaction.run(
        deposit.id,
        deposit.user_id,
        'withdrawal',
        deposit.amount,
        deposit.amount,
        0,
        `${INACTIVE_DAYS}일 이상 비활성화로 자동 해지`
      );

      closedCount++;
      totalRefund += deposit.amount;
    }

    return {
      success: true,
      closedCount,
      totalRefund,
      message: `${closedCount}개의 비활성 계좌를 해지하고 총 ${totalRefund.toLocaleString()}칩을 반환했습니다.`
    };
  } catch (error) {
    console.error('비활성 계좌 해지 오류:', error);
    return { success: false, error: '비활성 계좌 해지에 실패했습니다.' };
  }
}

/**
 * VIP 등급 변경 시 이자율을 업데이트합니다.
 */
export function updateInterestRateByVipTier(userId) {
  try {
    const user = userQueries.findById.get(userId);
    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    const deposit = depositQueries.findByUserId.get(userId);
    if (!deposit) {
      return { success: false, error: '예치금 계좌를 찾을 수 없습니다.' };
    }

    const newInterestRate = VIP_INTEREST_RATES[user.vip_tier] || 0.01;

    if (deposit.interest_rate !== newInterestRate) {
      depositQueries.updateInterestRate(newInterestRate, deposit.id);
      return {
        success: true,
        oldRate: deposit.interest_rate,
        newRate: newInterestRate,
        message: `이자율이 ${(deposit.interest_rate * 100).toFixed(1)}%에서 ${(newInterestRate * 100).toFixed(1)}%로 변경되었습니다.`
      };
    }

    return {
      success: true,
      message: '이자율 변경이 필요하지 않습니다.'
    };
  } catch (error) {
    console.error('이자율 업데이트 오류:', error);
    return { success: false, error: '이자율 업데이트에 실패했습니다.' };
  }
}

/**
 * 사용자의 예치금 계좌 정보를 조회합니다.
 */
export function getDepositAccount(userId) {
  try {
    const deposit = depositQueries.findByUserId.get(userId);
    if (!deposit) {
      return { success: false, error: '예치금 계좌를 찾을 수 없습니다.' };
    }

    // 이자 지급 내역 조회
    const interestHistory = depositQueries.findInterestHistory.all(userId, 10);

    // 입출금 내역 조회
    const transactions = depositQueries.findTransactions.all(userId, 20);

    return {
      success: true,
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        interestRate: deposit.interest_rate,
        interestType: deposit.interest_type,
        status: deposit.status,
        lastInterestPaid: deposit.last_interest_paid,
        lastActivity: deposit.last_activity,
        createdAt: deposit.created_at
      },
      interestHistory,
      transactions
    };
  } catch (error) {
    console.error('예치금 계좌 조회 오류:', error);
    return { success: false, error: '계좌 조회에 실패했습니다.' };
  }
}

/**
 * 예치금 시스템 전체 통계를 조회합니다.
 */
export function getDepositStats() {
  try {
    const totalStats = depositQueries.getTotalStats.get();
    const vipRates = depositQueries.getVipInterestRates.all();

    return {
      success: true,
      stats: {
        totalAccounts: totalStats.total_accounts,
        totalDeposited: totalStats.total_deposited,
        avgDeposit: totalStats.avg_deposit,
        avgInterestRate: totalStats.avg_interest_rate
      },
      vipRates
    };
  } catch (error) {
    console.error('예치금 통계 조회 오류:', error);
    return { success: false, error: '통계 조회에 실패했습니다.' };
  }
}
