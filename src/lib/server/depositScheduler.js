import { payDailyInterest, payWeeklyInterest, closeInactiveAccounts } from './deposits.js';

// 스케줄러 상태
let dailyInterval = null;
let weeklyInterval = null;
let cleanupInterval = null;

/**
 * 일일 이자 지급 스케줄러를 시작합니다.
 * 매일 자정에 실행됩니다.
 */
export function startDailyInterestScheduler() {
  if (dailyInterval) {
    console.log('일일 이자 스케줄러가 이미 실행 중입니다.');
    return;
  }

  // 다음 자정까지의 시간 계산
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msUntilMidnight = tomorrow - now;

  // 첫 실행을 자정으로 예약
  setTimeout(() => {
    console.log('일일 이자 지급 시작...');
    const result = payDailyInterest();
    console.log('일일 이자 지급 결과:', result.message);

    // 이후 매일 반복
    dailyInterval = setInterval(() => {
      console.log('일일 이자 지급 시작...');
      const result = payDailyInterest();
      console.log('일일 이자 지급 결과:', result.message);
    }, 24 * 60 * 60 * 1000); // 24시간
  }, msUntilMidnight);

  console.log(`일일 이자 스케줄러가 시작되었습니다. 다음 실행: ${tomorrow.toLocaleString('ko-KR')}`);
}

/**
 * 주간 이자 지급 스케줄러를 시작합니다.
 * 매주 월요일 자정에 실행됩니다.
 */
export function startWeeklyInterestScheduler() {
  if (weeklyInterval) {
    console.log('주간 이자 스케줄러가 이미 실행 중입니다.');
    return;
  }

  // 다음 월요일 자정까지의 시간 계산
  const now = new Date();
  const nextMonday = new Date(now);
  const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7; // 다음 월요일까지의 일수
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  const msUntilMonday = nextMonday - now;

  // 첫 실행을 월요일 자정으로 예약
  setTimeout(() => {
    console.log('주간 이자 지급 시작...');
    const result = payWeeklyInterest();
    console.log('주간 이자 지급 결과:', result.message);

    // 이후 매주 반복
    weeklyInterval = setInterval(() => {
      console.log('주간 이자 지급 시작...');
      const result = payWeeklyInterest();
      console.log('주간 이자 지급 결과:', result.message);
    }, 7 * 24 * 60 * 60 * 1000); // 7일
  }, msUntilMonday);

  console.log(`주간 이자 스케줄러가 시작되었습니다. 다음 실행: ${nextMonday.toLocaleString('ko-KR')}`);
}

/**
 * 비활성 계좌 해지 스케줄러를 시작합니다.
 * 매일 새벽 2시에 실행됩니다.
 */
export function startCleanupScheduler() {
  if (cleanupInterval) {
    console.log('비활성 계좌 해지 스케줄러가 이미 실행 중입니다.');
    return;
  }

  // 다음 새벽 2시까지의 시간 계산
  const now = new Date();
  const tomorrow2AM = new Date(now);
  tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
  tomorrow2AM.setHours(2, 0, 0, 0);
  const msUntil2AM = tomorrow2AM - now;

  // 첫 실행을 새벽 2시로 예약
  setTimeout(() => {
    console.log('비활성 계좌 해지 시작...');
    const result = closeInactiveAccounts();
    console.log('비활성 계좌 해지 결과:', result.message);

    // 이후 매일 반복
    cleanupInterval = setInterval(() => {
      console.log('비활성 계좌 해지 시작...');
      const result = closeInactiveAccounts();
      console.log('비활성 계좌 해지 결과:', result.message);
    }, 24 * 60 * 60 * 1000); // 24시간
  }, msUntil2AM);

  console.log(`비활성 계좌 해지 스케줄러가 시작되었습니다. 다음 실행: ${tomorrow2AM.toLocaleString('ko-KR')}`);
}

/**
 * 모든 스케줄러를 시작합니다.
 */
export function startAllSchedulers() {
  startDailyInterestScheduler();
  startWeeklyInterestScheduler();
  startCleanupScheduler();
}

/**
 * 모든 스케줄러를 중지합니다.
 */
export function stopAllSchedulers() {
  if (dailyInterval) {
    clearInterval(dailyInterval);
    dailyInterval = null;
    console.log('일일 이자 스케줄러가 중지되었습니다.');
  }

  if (weeklyInterval) {
    clearInterval(weeklyInterval);
    weeklyInterval = null;
    console.log('주간 이자 스케줄러가 중지되었습니다.');
  }

  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('비활성 계좌 해지 스케줄러가 중지되었습니다.');
  }
}

/**
 * 스케줄러 상태를 조회합니다.
 */
export function getSchedulerStatus() {
  return {
    daily: dailyInterval !== null,
    weekly: weeklyInterval !== null,
    cleanup: cleanupInterval !== null
  };
}
