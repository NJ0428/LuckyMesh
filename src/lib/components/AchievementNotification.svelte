<script>
  import { onMount, onDestroy } from 'svelte';
  import { soundActions } from '$lib/stores/soundSystem.js';

  let notifications = [];
  let achievementListener;

  onMount(() => {
    // 업적 언락 이벤트 리스너
    achievementListener = (event) => {
      showAchievementNotification(event.detail);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('achievementUnlocked', achievementListener);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined' && achievementListener) {
      window.removeEventListener('achievementUnlocked', achievementListener);
    }
  });

  function showAchievementNotification(achievement) {
    const notification = {
      id: Date.now(),
      achievement,
      show: false
    };

    notifications = [...notifications, notification];

    // 약간의 지연 후 애니메이션 시작
    setTimeout(() => {
      notifications = notifications.map(n =>
        n.id === notification.id ? { ...n, show: true } : n
      );
    }, 100);

    // 사운드 재생
    soundActions.playWin();

    // 5초 후 자동 제거
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  }

  function removeNotification(id) {
    // 먼저 애니메이션으로 숨기기
    notifications = notifications.map(n =>
      n.id === id ? { ...n, show: false } : n
    );

    // 애니메이션 완료 후 실제 제거
    setTimeout(() => {
      notifications = notifications.filter(n => n.id !== id);
    }, 300);
  }

  function getRewardText(achievement) {
    if (achievement.reward.type === 'badge') {
      return '새로운 뱃지를 획득했습니다!';
    }
    return '보상을 획득했습니다!';
  }
</script>

<div class="achievement-container">
  {#each notifications as notification (notification.id)}
    <div
      class="achievement-notification {notification.show ? 'show' : ''}"
      on:click={() => removeNotification(notification.id)}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && removeNotification(notification.id)}
    >
      <div class="achievement-content">
        <!-- 아이콘 영역 -->
        <div class="achievement-icon">
          <div class="icon-background">
            <span class="icon-emoji">{notification.achievement.icon}</span>
          </div>
          <div class="achievement-glow"></div>
        </div>

        <!-- 텍스트 영역 -->
        <div class="achievement-text">
          <div class="achievement-title">🏆 업적 달성!</div>
          <div class="achievement-name">{notification.achievement.title}</div>
          <div class="achievement-description">{notification.achievement.description}</div>
          <div class="achievement-reward">{getRewardText(notification.achievement)}</div>
        </div>

        <!-- 닫기 버튼 -->
        <button
          class="achievement-close"
          on:click|stopPropagation={() => removeNotification(notification.id)}
          aria-label="알림 닫기"
        >
          ×
        </button>
      </div>

      <!-- 진행 바 (시간 표시) -->
      <div class="achievement-progress">
        <div class="progress-bar"></div>
      </div>
    </div>
  {/each}
</div>

<style>
  .achievement-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    pointer-events: none;
  }

  .achievement-notification {
    width: 350px;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    border: 2px solid #b8860b;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    pointer-events: auto;
    cursor: pointer;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    position: relative;
  }

  .achievement-notification.show {
    transform: translateX(0);
    opacity: 1;
  }

  .achievement-notification:hover {
    transform: translateX(0) scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  .achievement-content {
    display: flex;
    align-items: center;
    padding: 16px;
    position: relative;
  }

  .achievement-icon {
    position: relative;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .icon-background {
    width: 60px;
    height: 60px;
    background: radial-gradient(circle, #fff, #f0f0f0);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #b8860b;
    box-shadow: 0 4px 16px rgba(184, 134, 11, 0.3);
    animation: iconPulse 2s infinite;
  }

  .icon-emoji {
    font-size: 32px;
    animation: iconBounce 0.6s ease-out;
  }

  .achievement-glow {
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.4), transparent);
    border-radius: 50%;
    animation: glowPulse 2s infinite;
    z-index: -1;
  }

  .achievement-text {
    flex: 1;
    min-width: 0;
  }

  .achievement-title {
    font-size: 14px;
    font-weight: bold;
    color: #8b4513;
    margin-bottom: 4px;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  }

  .achievement-name {
    font-size: 18px;
    font-weight: bold;
    color: #2c1810;
    margin-bottom: 4px;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  }

  .achievement-description {
    font-size: 13px;
    color: #4a3728;
    margin-bottom: 4px;
    line-height: 1.3;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.6);
  }

  .achievement-reward {
    font-size: 12px;
    color: #8b4513;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.6);
  }

  .achievement-close {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    border: none;
    background: rgba(139, 69, 19, 0.1);
    color: #8b4513;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .achievement-close:hover {
    background: rgba(139, 69, 19, 0.2);
    transform: scale(1.1);
  }

  .achievement-progress {
    height: 4px;
    background: rgba(184, 134, 11, 0.3);
    position: relative;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #b8860b, #8b4513);
    width: 100%;
    animation: progressBar 5s linear;
    transform-origin: left;
  }

  /* 애니메이션 키프레임 */
  @keyframes iconPulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes iconBounce {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes glowPulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }

  @keyframes progressBar {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }

  /* 모바일 반응형 */
  @media (max-width: 768px) {
    .achievement-container {
      top: 10px;
      right: 10px;
      left: 10px;
    }

    .achievement-notification {
      width: auto;
      max-width: none;
    }

    .achievement-content {
      padding: 12px;
    }

    .icon-background {
      width: 50px;
      height: 50px;
    }

    .icon-emoji {
      font-size: 26px;
    }

    .achievement-name {
      font-size: 16px;
    }

    .achievement-description {
      font-size: 12px;
    }
  }

  /* 다크 모드 지원 */
  @media (prefers-color-scheme: dark) {
    .achievement-notification {
      background: linear-gradient(135deg, #4a4a4a, #3a3a3a);
      border-color: #666;
    }

    .achievement-title,
    .achievement-name,
    .achievement-description,
    .achievement-reward {
      color: #fff;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .icon-background {
      background: radial-gradient(circle, #666, #444);
      border-color: #888;
    }

    .achievement-close {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .achievement-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  /* 접근성 향상 */
  .achievement-notification:focus {
    outline: 2px solid #b8860b;
    outline-offset: 2px;
  }

  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    .achievement-notification {
      border-width: 3px;
    }

    .achievement-title,
    .achievement-name,
    .achievement-description,
    .achievement-reward {
      text-shadow: none;
      font-weight: bold;
    }
  }

  /* 모션 감소 설정 지원 */
  @media (prefers-reduced-motion: reduce) {
    .achievement-notification,
    .icon-background,
    .icon-emoji,
    .achievement-glow,
    .progress-bar {
      animation: none;
      transition: none;
    }

    .achievement-notification.show {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>