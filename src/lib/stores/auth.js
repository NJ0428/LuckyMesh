import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// 사용자 상태 저장소
export const user = writable(null);
export const isAuthenticated = writable(false);
export const isLoading = writable(false);

// 로그인 함수
export async function login(email, password) {
  isLoading.set(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
      user.set(result.user);
      isAuthenticated.set(true);
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  } finally {
    isLoading.set(false);
  }
}

// 회원가입 함수
export async function register(userData) {
  isLoading.set(true);

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, message: result.message, user: result.user };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  } finally {
    isLoading.set(false);
  }
}

// 로그아웃 함수
export async function logout() {
  isLoading.set(true);

  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success) {
      user.set(null);
      isAuthenticated.set(false);
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: '네트워크 오류가 발생했습니다.' };
  } finally {
    isLoading.set(false);
  }
}

// 사용자 정보 확인 함수
export async function checkAuth() {
  if (!browser) return;

  isLoading.set(true);

  try {
    const response = await fetch('/api/auth/me');
    const result = await response.json();

    if (result.success) {
      user.set(result.user);
      isAuthenticated.set(true);
    } else {
      user.set(null);
      isAuthenticated.set(false);
    }
  } catch (error) {
    console.error('Auth check error:', error);
    user.set(null);
    isAuthenticated.set(false);
  } finally {
    isLoading.set(false);
  }
}

// 앱 로드 시 인증 상태 확인
if (browser) {
  checkAuth();
}