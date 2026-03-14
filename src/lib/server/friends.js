import { friendQueries, blockQueries, userQueries, chipGiftQueries } from './database.js';

/**
 * VIP 등급별 최대 친구 수
 */
const MAX_FRIENDS_BY_VIP = {
	silver: 100,
	gold: 500,
	platinum: Infinity
};

/**
 * 친구 요청 보내기
 */
export async function sendFriendRequest(senderId, receiverId) {
	// 자기 자신에게 친구 요청 불가
	if (senderId === receiverId) {
		throw new Error('자기 자신에게 친구 요청을 보낼 수 없습니다.');
	}

	// 수신자 확인
	const receiver = userQueries.findById.get(receiverId);
	if (!receiver) {
		throw new Error('사용자를 찾을 수 없습니다.');
	}

	// 이미 친구인지 확인
	const existing = friendQueries.checkExisting.get(senderId, receiverId, senderId, receiverId);
	if (existing) {
		if (existing.status === 'accepted') {
			throw new Error('이미 친구입니다.');
		} else if (existing.status === 'pending') {
			throw new Error('이미 친구 요청을 보냈습니다.');
		}
	}

	// 차단 여부 확인
	const blocked = blockQueries.checkBidirectionalBlocked.get(
		senderId,
		receiverId,
		receiverId,
		senderId
	);
	if (blocked) {
		throw new Error('차단된 사용자입니다.');
	}

	// 발신자의 친구 수 확인
	const sender = userQueries.findById.get(senderId);
	const friendCount = friendQueries.countFriends.get(senderId, senderId);
	const maxFriends = MAX_FRIENDS_BY_VIP[sender.vip_tier] || MAX_FRIENDS_BY_VIP.silver;

	if (friendCount.count >= maxFriends) {
		throw new Error(
			`친구 수 제한에 도달했습니다. (최대 ${maxFriends === Infinity ? '무제한' : maxFriends}명)`
		);
	}

	// 친구 요청 생성
	const result = friendQueries.createRequest.run(senderId, receiverId);

	return {
		success: true,
		requestId: result.lastInsertRowid,
		message: '친구 요청을 보냈습니다.'
	};
}

/**
 * 친구 요청 수락
 */
export async function acceptFriendRequest(requestId, userId) {
	const request = friendQueries.findPending.get(userId);

	if (!request || request.id !== requestId) {
		throw new Error('친구 요청을 찾을 수 없습니다.');
	}

	// 친구 수 확인
	const user = userQueries.findById.get(userId);
	const friendCount = friendQueries.countFriends.get(userId, userId);
	const maxFriends = MAX_FRIENDS_BY_VIP[user.vip_tier] || MAX_FRIENDS_BY_VIP.silver;

	if (friendCount.count >= maxFriends) {
		throw new Error(
			`친구 수 제한에 도달했습니다. (최대 ${maxFriends === Infinity ? '무제한' : maxFriends}명)`
		);
	}

	// 요청 수락
	friendQueries.acceptRequest.run(requestId, userId);

	// 양방향 친구 관계 생성 (이미 요청이 있으므로 상대방도 accepted로 업데이트)
	friendQueries.acceptRequest.run(requestId, userId);

	return {
		success: true,
		message: '친구 요청을 수락했습니다.'
	};
}

/**
 * 친구 요청 거절
 */
export async function rejectFriendRequest(requestId, userId) {
	const request = friendQueries.findPending.get(userId);

	if (!request || request.id !== requestId) {
		throw new Error('친구 요청을 찾을 수 없습니다.');
	}

	friendQueries.rejectRequest.run(requestId, userId);

	return {
		success: true,
		message: '친구 요청을 거절했습니다.'
	};
}

/**
 * 친구 삭제
 */
export async function removeFriend(userId, friendId) {
	friendQueries.remove.run(userId, friendId, userId, friendId);

	return {
		success: true,
		message: '친구를 삭제했습니다.'
	};
}

/**
 * 친구 목록 조회
 */
export async function getFriendList(userId) {
	const friends = friendQueries.findByUserId.all(userId, userId);

	// 필터링 및 정리
	const acceptedFriends = friends.filter((f) => f.status === 'accepted');
	const pendingRequests = friends.filter(
		(f) => f.status === 'pending' && f.friend_id === userId
	);
	const sentRequests = friends.filter(
		(f) => f.status === 'pending' && f.user_id === userId
	);

	return {
		accepted: acceptedFriends.map((f) => {
			const isUserSender = f.user_id === userId;
			return {
				id: f.id,
				userId: isUserSender ? f.friend_id : f.user_id,
				username: isUserSender ? f.friend_name : f.sender_name,
				fullName: isUserSender ? f.friend_full_name : f.sender_full_name,
				vipTier: isUserSender ? f.friend_vip_tier : null,
				isOnline: f.friend_is_online || false,
				lastSeen: f.friend_last_seen,
				createdAt: f.created_at
			};
		}),
		pending: pendingRequests.map((f) => ({
			id: f.id,
			userId: f.user_id,
			username: f.sender_name,
			fullName: f.sender_full_name,
			vipTier: f.sender_vip_tier,
			createdAt: f.created_at
		})),
		sent: sentRequests.map((f) => ({
			id: f.id,
			userId: f.friend_id,
			username: f.friend_name,
			fullName: f.friend_full_name,
			vipTier: null,
			createdAt: f.created_at
		}))
	};
}

/**
 * 대기 중인 친구 요청 조회
 */
export async function getPendingRequests(userId) {
	const requests = friendQueries.findPending.all(userId);

	return requests.map((r) => ({
		id: r.id,
		userId: r.user_id,
		username: r.sender_name,
		fullName: r.sender_full_name,
		vipTier: r.sender_vip_tier,
		createdAt: r.created_at
	}));
}

/**
 * 사용자 검색
 */
export async function searchUsers(query, currentUserId) {
	const searchTerm = `%${query}%`;
	const users = friendQueries.searchByUsername.all(searchTerm, currentUserId);

	return users.map((u) => ({
		id: u.id,
		username: u.username,
		fullName: u.full_name,
		vipTier: u.vip_tier
	}));
}

/**
 * 사용자 차단
 */
export async function blockUser(blockerId, blockedId, reason = null) {
	if (blockerId === blockedId) {
		throw new Error('자기 자신을 차단할 수 없습니다.');
	}

	// 이미 차단되었는지 확인
	const existing = blockQueries.checkBlocked.get(blockerId, blockedId);
	if (existing) {
		throw new Error('이미 차단된 사용자입니다.');
	}

	// 차단 생성
	blockQueries.block.run(blockerId, blockedId, reason);

	// 친구 관계가 있다면 삭제
	friendQueries.remove.run(blockerId, blockedId, blockerId, blockedId);

	return {
		success: true,
		message: '사용자를 차단했습니다.'
	};
}

/**
 * 차단 해제
 */
export async function unblockUser(blockerId, blockedId) {
	const existing = blockQueries.checkBlocked.get(blockerId, blockedId);
	if (!existing) {
		throw new Error('차단되지 않은 사용자입니다.');
	}

	blockQueries.unblock.run(blockerId, blockedId);

	return {
		success: true,
		message: '차단을 해제했습니다.'
	};
}

/**
 * 차단 목록 조회
 */
export async function getBlockedList(userId) {
	const blocked = blockQueries.findByBlockerId.all(userId);

	return blocked.map((b) => ({
		id: b.id,
		userId: b.blocked_id,
		username: b.blocked_name,
		fullName: b.blocked_full_name,
		reason: b.reason,
		createdAt: b.created_at
	}));
}

/**
 * 친구 수 확인 (VIP 제한 체크용)
 */
export async function checkFriendLimit(userId) {
	const user = userQueries.findById.get(userId);
	const friendCount = friendQueries.countFriends.get(userId, userId);
	const maxFriends = MAX_FRIENDS_BY_VIP[user.vip_tier] || MAX_FRIENDS_BY_VIP.silver;

	return {
		current: friendCount.count,
		max: maxFriends === Infinity ? null : maxFriends,
		canAdd: maxFriends === Infinity || friendCount.count < maxFriends,
		vipTier: user.vip_tier
	};
}

/**
 * 칩 선물 보내기
 */
export async function sendChipGift(senderId, receiverId, amount, message = null) {
	// 칩 선물 한도 설정
	const MIN_GIFT_AMOUNT = 1000;
	const MAX_GIFT_AMOUNT = 100000;
	const MAX_DAILY_GIFTS = 5;

	if (senderId === receiverId) {
		throw new Error('자기 자신에게 선물할 수 없습니다.');
	}

	// 친구 관계 확인
	const friendship = friendQueries.checkExisting.get(senderId, receiverId, senderId, receiverId);
	if (!friendship || friendship.status !== 'accepted') {
		throw new Error('친구에게만 선물할 수 있습니다.');
	}

	// 차단 여부 확인
	const blocked = blockQueries.checkBidirectionalBlocked.get(
		senderId,
		receiverId,
		receiverId,
		senderId
	);
	if (blocked) {
		throw new Error('차단된 사용자입니다.');
	}

	// 금액 검증
	if (amount < MIN_GIFT_AMOUNT) {
		throw new Error(`최소 ${MIN_GIFT_AMOUNT.toLocaleString()}칩 이상 선물해야 합니다.`);
	}
	if (amount > MAX_GIFT_AMOUNT) {
		throw new Error(`최대 ${MAX_GIFT_AMOUNT.toLocaleString()}칩까지 선물할 수 있습니다.`);
	}

	// 발신자 잔액 확인
	const sender = userQueries.findById.get(senderId);
	if (sender.balance < amount) {
		throw new Error('잔액이 부족합니다.');
	}

	// 오늘 보낸 선물 수 확인
	const todayGiftCount = chipGiftQueries.countTodayGifts.get(senderId);
	if (todayGiftCount.count >= MAX_DAILY_GIFTS) {
		throw new Error(`하루 최대 ${MAX_DAILY_GIFTS}회까지 선물할 수 있습니다.`);
	}

	// 발신자 잔액 차감
	userQueries.updateBalance.run(sender.balance - amount, senderId);

	// 선물 생성
	const result = chipGiftQueries.create.run(senderId, receiverId, amount, message);

	return {
		success: true,
		giftId: result.lastInsertRowid,
		amount,
		message: '칩 선물을 보냈습니다.'
	};
}

/**
 * 대기 중인 칩 선물 조회
 */
export async function getPendingGifts(userId) {
	const gifts = chipGiftQueries.findPendingByReceiver.all(userId);

	return gifts.map((g) => ({
		id: g.id,
		senderId: g.sender_id,
		senderName: g.sender_name,
		senderFullName: g.sender_full_name,
		amount: g.amount,
		message: g.message,
		createdAt: g.created_at,
		expiresAt: g.expires_at
	}));
}

/**
 * 칩 선물 수락
 */
export async function acceptChipGift(giftId, userId) {
	const gift = chipGiftQueries.findById.get(giftId);

	if (!gift) {
		throw new Error('선물을 찾을 수 없습니다.');
	}

	if (gift.receiver_id !== userId) {
		throw new Error('접근 권한이 없습니다.');
	}

	if (gift.status !== 'pending') {
		throw new Error('이미 처리된 선물입니다.');
	}

	if (new Date(gift.expires_at) < new Date()) {
		throw new Error('만료된 선물입니다.');
	}

	// 선물 수락 처리
	chipGiftQueries.accept.run(giftId, userId);

	// 수신자 잔액 증가
	const receiver = userQueries.findById.get(userId);
	userQueries.updateBalance.run(receiver.balance + gift.amount, userId);

	return {
		success: true,
		amount: gift.amount,
		newBalance: receiver.balance + gift.amount,
		message: `${gift.amount.toLocaleString()}칩을 받았습니다.`
	};
}

/**
 * 칩 선물 거절
 */
export async function rejectChipGift(giftId, userId) {
	const gift = chipGiftQueries.findById.get(giftId);

	if (!gift) {
		throw new Error('선물을 찾을 수 없습니다.');
	}

	if (gift.receiver_id !== userId) {
		throw new Error('접근 권한이 없습니다.');
	}

	if (gift.status !== 'pending') {
		throw new Error('이미 처리된 선물입니다.');
	}

	// 선물 거절 처리
	chipGiftQueries.reject.run(giftId, userId);

	// 발신자에게 환불
	const sender = userQueries.findById.get(gift.sender_id);
	userQueries.updateBalance.run(sender.balance + gift.amount, gift.sender_id);

	return {
		success: true,
		amount: gift.amount,
		message: '선물을 거절했습니다.'
	};
}

/**
 * 칩 선물 내역 조회
 */
export async function getGiftHistory(userId) {
	const gifts = chipGiftQueries.findByUser.all(userId, userId);

	return gifts.map((g) => ({
		id: g.id,
		senderId: g.sender_id,
		senderName: g.sender_name,
		senderFullName: g.sender_full_name,
		receiverId: g.receiver_id,
		receiverName: g.receiver_name,
		receiverFullName: g.receiver_full_name,
		amount: g.amount,
		message: g.message,
		status: g.status,
		createdAt: g.created_at,
		respondedAt: g.responded_at,
		expiresAt: g.expires_at,
		isSent: g.sender_id === userId
	}));
}
