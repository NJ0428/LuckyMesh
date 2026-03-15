import { sessionQueries } from './database.js';

/**
 * 쿠키에서 세션을 통해 사용자 정보 가져오기
 */
export async function getSessionUser(cookies) {
	const sessionId = cookies.get('session');

	if (!sessionId) {
		return null;
	}

	const session = sessionQueries.findById.get(sessionId);

	if (!session) {
		return null;
	}

	return {
		id: session.user_id,
		username: session.username,
		email: session.email,
		fullName: session.full_name,
		balance: session.balance,
		isActive: session.is_active
	};
}

/**
 * 세션 생성
 */
export async function createSession(userId, cookies) {
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

	sessionQueries.create.run(sessionId, userId, expiresAt.toISOString());

	cookies.set('session', sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt
	});

	return sessionId;
}

/**
 * 세션 삭제 (로그아웃)
 */
export async function destroySession(cookies) {
	const sessionId = cookies.get('session');

	if (sessionId) {
		sessionQueries.delete.run(sessionId);
		cookies.delete('session', { path: '/' });
	}

	return true;
}
