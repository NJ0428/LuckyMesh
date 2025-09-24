import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { userQueries } from '$lib/server/database.js';

export async function POST({ request, cookies }) {
  try {
    const sessionId = cookies.get('session');
    const session = validateSession(sessionId);

    if (!session.success) {
      return json({ success: false, error: session.error }, { status: 401 });
    }

    const payload = await request.json();
    const { fullName, phone } = payload;

    if (!fullName || fullName.length < 2) {
      return json({ success: false, error: '이름은 2자 이상이어야 합니다.' }, { status: 400 });
    }

    // DB 업데이트
    userQueries.update.run(fullName, phone || null, session.user.id);

    const updated = userQueries.findById.get(session.user.id);

    // sanitize
    const { password_hash, ...sanitized } = updated;

    const user = {
      id: sanitized.id,
      username: sanitized.username,
      email: sanitized.email,
      fullName: sanitized.full_name,
      phone: sanitized.phone,
      dateOfBirth: sanitized.date_of_birth,
      balance: sanitized.balance,
      isVerified: sanitized.is_verified,
      isActive: sanitized.is_active,
      createdAt: sanitized.created_at,
      updatedAt: sanitized.updated_at
    };

    return json({ success: true, user });
  } catch (error) {
    console.error('Profile update API error:', error);
    return json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
