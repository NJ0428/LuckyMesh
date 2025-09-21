import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { userQueries, sessionQueries } from './database.js';

const SALT_ROUNDS = 12;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

// 비밀번호 해시 생성
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// 비밀번호 검증
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 사용자 등록
export async function registerUser({ username, email, password, fullName, phone, dateOfBirth }) {
  // 입력 검증
  const validation = validateRegistrationData({ username, email, password, fullName, phone, dateOfBirth });
  if (!validation.success) {
    return { success: false, error: validation.error };
  }

  try {
    // 중복 사용자 확인
    const existingUserByEmail = userQueries.findByEmail.get(email);
    if (existingUserByEmail) {
      return { success: false, error: '이미 등록된 이메일입니다.' };
    }

    const existingUserByUsername = userQueries.findByUsername.get(username);
    if (existingUserByUsername) {
      return { success: false, error: '이미 사용 중인 사용자명입니다.' };
    }

    // 비밀번호 해시
    const passwordHash = await hashPassword(password);

    // 사용자 생성 (기본 잔액 10000원 포함)
    const result = userQueries.create.run(
      username,
      email,
      passwordHash,
      fullName,
      phone || null,
      dateOfBirth || null
    );

    if (result.lastInsertRowid) {
      const user = userQueries.findById.get(result.lastInsertRowid);
      return {
        success: true,
        user: sanitizeUser(user)
      };
    } else {
      return { success: false, error: '사용자 등록에 실패했습니다.' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: '시스템 오류가 발생했습니다.' };
  }
}

// 사용자 로그인
export async function loginUser(email, password) {
  // 입력 검증
  if (!email || !password) {
    return { success: false, error: '이메일과 비밀번호를 입력해주세요.' };
  }

  try {
    // 사용자 찾기
    const user = userQueries.findByEmail.get(email);
    if (!user) {
      return { success: false, error: '등록되지 않은 이메일입니다.' };
    }

    // 계정 상태 확인
    if (!user.is_active) {
      return { success: false, error: '비활성화된 계정입니다. 고객센터에 문의하세요.' };
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return { success: false, error: '비밀번호가 일치하지 않습니다.' };
    }

    // 세션 생성
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

    sessionQueries.create.run(sessionId, user.id, expiresAt);

    return {
      success: true,
      sessionId,
      user: sanitizeUser(user),
      expiresAt
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: '시스템 오류가 발생했습니다.' };
  }
}

// 세션 검증
export function validateSession(sessionId) {
  if (!sessionId) {
    return { success: false, error: '세션이 없습니다.' };
  }

  try {
    const session = sessionQueries.findById.get(sessionId);
    if (!session) {
      return { success: false, error: '유효하지 않은 세션입니다.' };
    }

    return {
      success: true,
      user: {
        id: session.user_id,
        username: session.username,
        email: session.email,
        fullName: session.full_name,
        balance: session.balance,
        isActive: session.is_active
      }
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { success: false, error: '세션 검증 오류가 발생했습니다.' };
  }
}

// 로그아웃
export function logoutUser(sessionId) {
  if (!sessionId) {
    return { success: false, error: '세션이 없습니다.' };
  }

  try {
    sessionQueries.delete.run(sessionId);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: '로그아웃 중 오류가 발생했습니다.' };
  }
}

// 사용자 데이터 정리 (민감한 정보 제거)
function sanitizeUser(user) {
  const { password_hash, ...sanitized } = user;
  return {
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
}

// 등록 데이터 검증
function validateRegistrationData({ username, email, password, fullName, phone, dateOfBirth }) {
  // 필수 필드 확인
  if (!username || !email || !password || !fullName) {
    return { success: false, error: '필수 정보를 모두 입력해주세요.' };
  }

  // 사용자명 검증
  if (username.length < 3 || username.length > 20) {
    return { success: false, error: '사용자명은 3-20자 사이여야 합니다.' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { success: false, error: '사용자명은 영문, 숫자, 밑줄(_)만 사용 가능합니다.' };
  }

  // 이메일 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: '유효한 이메일 형식이 아닙니다.' };
  }

  // 비밀번호 검증
  if (password.length < 8) {
    return { success: false, error: '비밀번호는 8자 이상이어야 합니다.' };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!passwordRegex.test(password)) {
    return { success: false, error: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.' };
  }

  // 이름 검증
  if (fullName.length < 2 || fullName.length > 50) {
    return { success: false, error: '이름은 2-50자 사이여야 합니다.' };
  }

  // 전화번호 검증 (선택사항)
  if (phone && !/^[0-9-+\s()]+$/.test(phone)) {
    return { success: false, error: '유효한 전화번호 형식이 아닙니다.' };
  }

  // 생년월일 검증 (선택사항)
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 18) {
      return { success: false, error: '18세 이상만 가입할 수 있습니다.' };
    }

    if (age > 100) {
      return { success: false, error: '유효한 생년월일을 입력해주세요.' };
    }
  }

  return { success: true };
}