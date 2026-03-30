import { gachaQueries, gachaConfigQueries, gachaVipBonusQueries, dailyRewardQueries, userQueries } from './database.js';

/**
 * 확률 계산 및 뽑기 결과 생성
 * @param {number} userId - 사용자 ID
 * @param {string} vipTier - VIP 등급
 * @returns {object} 뽑기 결과
 */
export function calculateGachaResult(userId, vipTier) {
  try {
    const configs = gachaConfigQueries.getAllConfigs.all();
    const vipBonus = gachaVipBonusQueries.getBonusByTier.get(vipTier);

    if (!configs || configs.length === 0) {
      return {
        success: false,
        error: '보상 설정이 없습니다.'
      };
    }

    // VIP 보너스 적용
    const probabilityMultiplier = vipBonus?.probability_multiplier || 1.0;
    const rareBonus = vipBonus?.rarity_bonus_rare || 0.0;
    const legendaryBonus = vipBonus?.rarity_bonus_legendary || 0.0;

    // 조정된 확률 계산
    let adjustedProbabilities = configs.map(config => {
      let adjustedProb = config.base_probability;

      if (config.rarity === 'rare') {
        adjustedProb += rareBonus;
      } else if (config.rarity === 'legendary') {
        adjustedProb += legendaryBonus;
      }

      return {
        ...config,
        adjusted_probability: adjustedProb * probabilityMultiplier
      };
    });

    // 확률 정규화 (합이 100%가 되도록)
    const totalProb = adjustedProbabilities.reduce((sum, item) => sum + item.adjusted_probability, 0);
    adjustedProbabilities = adjustedProbabilities.map(item => ({
      ...item,
      normalized_probability: (item.adjusted_probability / totalProb) * 100
    }));

    // 가중치 랜덤 선택
    const random = Math.random() * 100;
    let cumulativeProb = 0;
    let selectedReward = null;

    for (const reward of adjustedProbabilities) {
      cumulativeProb += reward.normalized_probability;
      if (random <= cumulativeProb) {
        selectedReward = reward;
        break;
      }
    }

    if (!selectedReward) {
      selectedReward = adjustedProbabilities[0]; // 기본값
    }

    // VIP 보너스 보상 증가
    const bonusMultiplier = 1.0 + rareBonus + legendaryBonus;
    const finalRewardAmount = Math.floor(selectedReward.base_reward_amount * bonusMultiplier);

    return {
      success: true,
      result: {
        rarity: selectedReward.rarity,
        reward_amount: finalRewardAmount,
        base_reward: selectedReward.base_reward_amount,
        bonus_multiplier: bonusMultiplier,
        probability: selectedReward.normalized_probability,
        icon: selectedReward.icon,
        color: selectedReward.color,
        vip_bonus_applied: bonusMultiplier > 1.0
      }
    };
  } catch (error) {
    console.error('Calculate gacha result error:', error);
    return {
      success: false,
      error: '뽑기 결과 계산 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 일일 보상 생성
 * @param {number} userId - 사용자 ID
 * @returns {object} 생성된 일일 보상
 */
export function createDailyReward(userId) {
  try {
    const user = userQueries.findById.get(userId);
    if (!user) {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      };
    }

    const vipBonus = gachaVipBonusQueries.getBonusByTier.get(user.vip_tier);
    const rewardAmount = vipBonus?.daily_reward_amount || 5000;

    // SQLite의 INSERT ... RETURNING은 지원하지 않으므로 별도 조회
    dailyRewardQueries.getOrCreateDaily.run(userId, user.vip_tier, rewardAmount);
    const dailyReward = dailyRewardQueries.getTodayReward.get(userId);

    return {
      success: true,
      data: {
        id: dailyReward.id,
        reward_amount: dailyReward.reward_amount,
        is_claimed: dailyReward.is_claimed,
        expires_at: dailyReward.expires_at,
        vip_tier: user.vip_tier
      }
    };
  } catch (error) {
    console.error('Create daily reward error:', error);
    return {
      success: false,
      error: '일일 보상 생성 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 일일 보상 수령
 * @param {number} userId - 사용자 ID
 * @returns {object} 수령 결과
 */
export function claimDailyReward(userId) {
  try {
    const dailyReward = dailyRewardQueries.getTodayReward.get(userId);

    if (!dailyReward) {
      return {
        success: false,
        error: '오늘의 보상이 없습니다.'
      };
    }

    if (dailyReward.is_claimed) {
      return {
        success: false,
        error: '이미 수령한 보상입니다.'
      };
    }

    // 보상 만료 확인
    if (new Date(dailyReward.expires_at) < new Date()) {
      return {
        success: false,
        error: '만료된 보상입니다.'
      };
    }

    // 보상 수령 처리
    const claimed = dailyRewardQueries.claimReward.run(dailyReward.id, userId);

    if (claimed.changes === 0) {
      return {
        success: false,
        error: '보상 수령에 실패했습니다.'
      };
    }

    // 사용자 잔액 업데이트
    const user = userQueries.findById.get(userId);
    if (user) {
      userQueries.updateBalance.run(user.balance + dailyReward.reward_amount, userId);
    }

    return {
      success: true,
      message: `${dailyReward.reward_amount.toLocaleString()}칩을 받았습니다!`,
      data: {
        reward_amount: dailyReward.reward_amount,
        new_balance: user ? user.balance + dailyReward.reward_amount : 0
      }
    };
  } catch (error) {
    console.error('Claim daily reward error:', error);
    return {
      success: false,
      error: '일일 보상 수령 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 룰렛 뽑기 실행
 * @param {number} userId - 사용자 ID
 * @param {boolean} isFreeSpin - 무료 뽑기 여부
 * @returns {object} 뽑기 결과
 */
export function performGachaSpin(userId, isFreeSpin = true) {
  try {
    const user = userQueries.findById.get(userId);
    if (!user) {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      };
    }

    // 오늘의 뽑기 정보 조회/생성
    gachaQueries.getOrCreateTodaySpins.run(userId, user.vip_tier);
    let spinInfo = gachaQueries.getOrCreateTodaySpins.get(userId, user.vip_tier);

    if (!spinInfo) {
      return {
        success: false,
        error: '뽑기 정보를 생성할 수 없습니다.'
      };
    }

    // 무료 뽑기 횟수 확인
    const vipBonus = gachaVipBonusQueries.getBonusByTier.get(user.vip_tier);
    const maxFreeSpins = vipBonus?.free_spins_per_day || 1;

    if (isFreeSpin && spinInfo.free_spins_used >= maxFreeSpins) {
      return {
        success: false,
        error: '오늘의 무료 뽑기 횟수를 모두 사용했습니다.',
        remaining_free_spins: 0
      };
    }

    // 뽑기 결과 계산
    const gachaResult = calculateGachaResult(userId, user.vip_tier);

    if (!gachaResult.success) {
      return gachaResult;
    }

    // 뽑기 횟수 업데이트
    gachaQueries.updateSpinCount.run(
      isFreeSpin ? 1 : 0,
      isFreeSpin ? 0 : 1,
      spinInfo.id,
      userId
    );

    // 뽑기 결과 저장
    gachaQueries.createResult.run(
      userId,
      spinInfo.id,
      gachaResult.result.rarity,
      gachaResult.result.reward_amount,
      isFreeSpin ? 1 : 0,
      gachaResult.result.vip_bonus_applied ? 1 : 0,
      gachaResult.result.bonus_multiplier
    );

    // 사용자 잔액 업데이트
    userQueries.updateBalance.run(user.balance + gachaResult.result.reward_amount, userId);

    return {
      success: true,
      message: `${getRarityLabel(gachaResult.result.rarity)} 등급! ${gachaResult.result.reward_amount.toLocaleString()}칩을 획득했습니다!`,
      data: {
        ...gachaResult.result,
        remaining_free_spins: maxFreeSpins - spinInfo.free_spins_used - (isFreeSpin ? 1 : 0),
        new_balance: user.balance + gachaResult.result.reward_amount
      }
    };
  } catch (error) {
    console.error('Gacha spin error:', error);
    return {
      success: false,
      error: '뽑기 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 뽑기 가능 여부 확인
 * @param {number} userId - 사용자 ID
 * @returns {object} 뽑기 가능 정보
 */
export function checkGachaAvailability(userId) {
  try {
    const user = userQueries.findById.get(userId);
    if (!user) {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      };
    }

    // 오늘의 뽑기 정보 생성
    gachaQueries.getOrCreateTodaySpins.run(userId, user.vip_tier);
    const spinInfo = gachaQueries.getOrCreateTodaySpins.get(userId, user.vip_tier);
    const vipBonus = gachaVipBonusQueries.getBonusByTier.get(user.vip_tier);
    const maxFreeSpins = vipBonus?.free_spins_per_day || 1;

    return {
      success: true,
      data: {
        can_spin: spinInfo.free_spins_used < maxFreeSpins,
        remaining_free_spins: Math.max(0, maxFreeSpins - spinInfo.free_spins_used),
        total_spins_today: spinInfo.total_spins,
        vip_tier: user.vip_tier
      }
    };
  } catch (error) {
    console.error('Check gacha availability error:', error);
    return {
      success: false,
      error: '뽑기 가능 여부 확인 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 뽑기 내역 조회
 * @param {number} userId - 사용자 ID
 * @param {number} limit - 조회 개수 제한
 * @returns {object} 뽑기 내역
 */
export function getGachaHistory(userId, limit = 20) {
  try {
    const results = gachaQueries.getUserResults.all(userId, limit);

    return {
      success: true,
      data: results.map(r => ({
        id: r.id,
        rarity: r.rarity,
        reward_amount: r.reward_amount,
        is_free_spin: r.is_free_spin,
        vip_bonus_applied: r.vip_bonus_applied,
        vip_bonus_multiplier: r.vip_bonus_multiplier,
        created_at: r.created_at
      }))
    };
  } catch (error) {
    console.error('Get gacha history error:', error);
    return {
      success: false,
      error: '뽑기 내역 조회 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 일일 보상 가능 여부 확인
 * @param {number} userId - 사용자 ID
 * @returns {object} 일일 보상 정보
 */
export function checkDailyRewardAvailability(userId) {
  try {
    const dailyReward = dailyRewardQueries.getTodayReward.get(userId);
    const user = userQueries.findById.get(userId);

    if (!dailyReward) {
      // 새로운 보상 생성
      return createDailyReward(userId);
    }

    return {
      success: true,
      data: {
        can_claim: !dailyReward.is_claimed,
        is_claimed: dailyReward.is_claimed,
        reward_amount: dailyReward.reward_amount,
        expires_at: dailyReward.expires_at,
        vip_tier: user.vip_tier
      }
    };
  } catch (error) {
    console.error('Check daily reward availability error:', error);
    return {
      success: false,
      error: '일일 보상 확인 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 레어도 한글 라벨 반환
 * @param {string} rarity - 레어도
 * @returns {string} 한글 라벨
 */
function getRarityLabel(rarity) {
  const labels = {
    common: '일반',
    rare: '희귀',
    legendary: '전설'
  };
  return labels[rarity] || '알 수 없음';
}
