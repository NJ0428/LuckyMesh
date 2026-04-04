<script>
  import '../app.css';
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import DailyRewardNotification from '$lib/components/DailyRewardNotification.svelte';
  import SupportChatBot from '$lib/components/SupportChatBot.svelte';
  import { onMount } from 'svelte';
  import { isAuthenticated } from '$lib/stores/auth.js';
  import {
    createScrollObserver,
    registerScrollAnimation,
    addRippleEffect,
    enhanceCardHover
  } from '$lib/utils/animations.js';

  let showDailyRewardNotification = false;
  let dailyRewardData = null;
  let showChatBot = false;

  onMount(async () => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;

    // 일일 보상 알림 체크
    if ($isAuthenticated) {
      await checkDailyReward();
    }

    // 스크롤 애니메이션 관찰자 생성
    const observer = createScrollObserver();

    if (observer) {
      // 모든 카드와 섹션에 스크롤 애니메이션 적용
      const animatedElements = document.querySelectorAll('.glass-card, .card-hover, section');
      animatedElements.forEach(el => registerScrollAnimation(el, observer));
    }

    // 모든 버튼에 리플 효과 추가
    const buttons = document.querySelectorAll('button, .btn-primary, .btn-secondary');
    buttons.forEach(addRippleEffect);

    // 카드 호버 효과 강화
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach(enhanceCardHover);

    // 부드러운 스크롤 효과
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  });

  async function checkDailyReward() {
    try {
      const response = await fetch('/api/daily-reward');
      const data = await response.json();

      if (data.success && data.data && !data.data.is_claimed) {
        dailyRewardData = data.data;
        showDailyRewardNotification = true;
      }
    } catch (err) {
      console.error('Error checking daily reward:', err);
    }
  }
</script>

<div class="min-h-screen flex flex-col">
  <Navigation />

  <main class="flex-1">
    <slot />
  </main>

  <Footer />

  <DailyRewardNotification
    bind:show={showDailyRewardNotification}
    dailyRewardData={dailyRewardData}
  />

  <SupportChatBot bind:isOpen={showChatBot} />
</div>