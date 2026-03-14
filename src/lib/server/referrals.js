import { referralQueries, userQueries } from './database.js';
import { randomBytes } from 'crypto';

/**
 * 추천 코드 생성
 */
function generateReferralCode() {
	const bytes = randomBytes(4);
	return bytes.toString('base64').replace(/[+/=]/g, '').substring(0, 8).toUpperCase();
}

/**
 * 추천 코드 생성 또는 조회
 */
export async function getOrCreateReferralCode(userId) {
	// 기존 코드 확인
	const existing = referralQueries.findCodeByUserId.get(userId);
	if (existing) {
		return {
			code: existing.code,
			usageCount: existing.usage_count,
			isActive: existing.is_active,
			createdAt: existing.created_at
		};
	}

	// 새 코드 생성
	let code;
	let attempts = 0;
	const maxAttempts = 10;

	do {
		code = generateReferralCode();
		const codeCheck = referralQueries.findCodeByCode.get(code);
		if (!codeCheck) break;
		attempts++;

		if (attempts >= maxAttempts) {
			throw new Error('추천 코드 생성에 실패했습니다. 다시 시도해주세요.');
		}
	} while (true);

	referralQueries.createCode.run(userId, code);

	return {
		code,
		usageCount: 0,
		isActive: true,
		createdAt: new Date().toISOString()
	};
}

/**
 * 추천 코드 적용 (가입 시)
 */
export async function applyReferralCode(referredUserId, code) {
	// 추천 코드 확인
	const referralCode = referralQueries.findCodeByCode.get(code);
	if (!referralCode) {
		throw new Error('유효하지 않은 추천 코드입니다.');
	}

	// 자기 자신의 코드 사용 불가
	if (referralCode.user_id === referredUserId) {
		throw new Error('자신의 추천 코드는 사용할 수 없습니다.');
	}

	// 이미 추천되었는지 확인
	const existingReferral = referralQueries.checkReferred.get(referredUserId);
	if (existingReferral) {
		throw new Error('이미 추천 코드를 사용했습니다.');
	}

	// 사용 횟수 제한 확인 (필요시)
	if (
		referralCode.max_uses !== null &&
		referralCode.usage_count >= referralCode.max_uses
	) {
		throw new Error('추천 코드의 사용 횟수가 초과되었습니다.');
	}

	// 추천 내역 생성
	const result = referralQueries.createReferral.run(referralCode.user_id, referredUserId, code);

	// 추천 코드 사용 횟수 증가
	referralQueries.incrementCodeUsage.run(code);

	// 피추천인 보너스 지급 (10,000칩)
	const referredBonus = 10000;
	userQueries.updateBalance.run(referredBonus, referredUserId);

	return {
		success: true,
		referralId: result.lastInsertRowid,
		referredBonus,
		referrerId: referralCode.user_id,
		message: `추천인 보너스 ${referredBonus.toLocaleString()}칩을 받았습니다!`
	};
}

/**
 * 추천인 보상 지급
 */
export async function payReferrerReward(referralId) {
	const referral = referralQueries.findByCode.get(
		referralQueries.findCodeByUserId.get(referralId)
	);

	if (!referral || referral.reward_paid) {
		return { success: false, message: '이미 보상이 지급되었습니다.' };
	}

	// 추천인 보상 지급 (50,000칩)
	const referrerReward = 50000;
	userQueries.updateBalance.run(referrerReward, referral.referrer_id);

	// 보상 지급 상태 업데이트
	referralQueries.markRewardPaid.run(referralId);

	return {
		success: true,
		reward: referrerReward,
		message: `추천인 보상 ${referrerReward.toLocaleString()}칩을 받았습니다!`
	};
}

/**
 * 추천 통계 조회
 */
export async function getReferralStats(userId) {
	const stats = referralQueries.getStats.get(userId);
	const referrals = referralQueries.findByReferrerId.all(userId);

	return {
		totalReferrals: stats.total_referrals || 0,
		paidReferrals: stats.paid_referrals || 0,
		totalRewards: stats.total_rewards || 0,
		referrals: referrals.map((r) => ({
			id: r.id,
			referredUsername: r.referred_name,
			referredFullName: r.referred_full_name,
			status: r.status,
			rewardAmount: r.reward_amount,
			rewardPaid: r.reward_paid,
			createdAt: r.created_at,
			completedAt: r.completed_at,
			rewardedAt: r.rewarded_at
		}))
	};
}

/**
 * 추천한 사용자 목록 조회
 */
export async function getReferredUsers(userId) {
	const referrals = referralQueries.findByReferrerId.all(userId);

	return referrals.map((r) => ({
		id: r.id,
		referredUsername: r.referred_name,
		referredFullName: r.referred_full_name,
		status: r.status,
		rewardAmount: r.reward_amount,
		rewardPaid: r.reward_paid,
		createdAt: r.created_at,
		completedAt: r.completed_at
	}));
}

/**
 * 추천 코드 정보 조회
 */
export async function getReferralCodeInfo(code) {
	const referralCode = referralQueries.findCodeByCode.get(code);

	if (!referralCode) {
		return null;
	}

	return {
		userId: referralCode.user_id,
		username: referralCode.username,
		fullName: referralCode.full_name,
		code: referralCode.code,
		usageCount: referralCode.usage_count,
		isActive: referralCode.is_active,
		createdAt: referralCode.created_at,
		expiresAt: referralCode.expires_at
	};
}
