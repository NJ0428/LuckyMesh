<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // VIP 등급 데이터
  const vipTiers = [
    {
      name: 'PLATINUM',
      stars: '⭐⭐⭐⭐⭐',
      level: '최고 등급',
      icon: 'infinity',
      benefits: [
        { icon: 'infinity', label: '무제한 베팅 한도', color: 'text-yellow-400' },
        { icon: 'user-check', label: '전용 딜러 서비스', color: 'text-yellow-400' },
        { icon: 'headphones', label: '개인 매니저 배정', color: 'text-yellow-400' },
        { icon: 'calendar-star', label: '럭셔리 이벤트 초대', color: 'text-yellow-400' },
        { icon: 'zap', label: '즉시 출금 (수수료 면제)', color: 'text-yellow-400' }
      ]
    },
    {
      name: 'GOLD',
      stars: '⭐⭐⭐⭐',
      level: '프리미엄 등급',
      icon: 'trending-up',
      benefits: [
        { icon: 'trending-up', label: '높은 베팅 한도', color: 'text-yellow-400' },
        { icon: 'clock', label: '빠른 출금 (24시간)', color: 'text-yellow-400' },
        { icon: 'gift', label: '보너스 2배 적용', color: 'text-yellow-400' },
        { icon: 'star', label: 'VIP 이벤트 참여', color: 'text-yellow-400' },
        { icon: 'shield-check', label: '우선 고객 지원', color: 'text-yellow-400' }
      ]
    },
    {
      name: 'SILVER',
      stars: '⭐⭐⭐',
      level: '스탠다드 등급',
      icon: 'arrow-up',
      benefits: [
        { icon: 'arrow-up', label: '중간 베팅 한도', color: 'text-gray-400' },
        { icon: 'headphones', label: '우선 고객 지원', color: 'text-gray-400' },
        { icon: 'calendar', label: '월간 보너스', color: 'text-gray-400' },
        { icon: 'percent', label: '특별 혜택', color: 'text-gray-400' },
        { icon: 'clock-3', label: '빠른 출금 (48시간)', color: 'text-gray-400' }
      ]
    }
  ];

  // VIP 혜택 데이터
  const benefits = [
    {
      icon: 'coins',
      title: '💰 캐시백',
      description: '매주 최대',
      value: '10% 캐시백'
    },
    {
      icon: 'gift',
      title: '🎁 보너스',
      description: '매월 특별',
      value: '보너스 지급'
    },
    {
      icon: 'zap',
      title: '⚡ 빠른출금',
      description: '1시간 내',
      value: '즉시 출금'
    }
  ];

  // 사용자 통계 데이터
  let userStats = {
    currentTier: 'GOLD',
    currentStars: '⭐⭐⭐⭐',
    nextTierAmount: 2500000,
    progressPercentage: 75,
    monthlyBetting: 7500000,
    vipPoints: 15750,
    cashbackEarned: 750000
  };

  // 카운터 애니메이션
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      if (element.textContent.includes('₩')) {
        element.textContent = '₩' + Math.floor(current).toLocaleString();
      } else {
        element.textContent = Math.floor(current).toLocaleString();
      }
    }, 16);
  }

  onMount(() => {
    // Lucide 아이콘 초기화
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }

    // 카운터 애니메이션 실행
    setTimeout(() => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const text = counter.textContent;
        const number = parseInt(text.replace(/[^\d]/g, ''));
        if (number > 0) {
          animateCounter(counter, number);
        }
      });
    }, 1000);

    // 진행률 바 애니메이션
    setTimeout(() => {
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.style.width = '0%';
        setTimeout(() => {
          progressBar.style.transition = 'width 1.5s ease-out';
          progressBar.style.width = userStats.progressPercentage + '%';
        }, 100);
      }
    }, 1200);

    // 스크롤 애니메이션 옵저버
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // 애니메이션 요소들 관찰
    document.querySelectorAll('.animate-fade-in-up, .animate-fade-in-up-delay-1, .animate-fade-in-up-delay-2, .animate-fade-in-up-delay-3').forEach(el => {
      observer.observe(el);
    });
  });

  function handleJoinTier(tier) {
    // VIP 등급 가입 처리
    console.log(`${tier} 등급에 가입합니다.`);
  }

  function handleClaimBonus() {
    // 보너스 받기 처리
    console.log('보너스를 받습니다.');
  }
</script>

<svelte:head>
  <title>VIP 라운지 - LuckyMesh Casino</title>
  <meta name="description" content="최고의 특권과 혜택을 누리는 프리미엄 멤버십" />
</svelte:head>

<div class="min-h-screen" style="background: oklch(0.0500 0 0); color: oklch(0.9800 0.0200 45); font-family: 'Playfair Display', serif;">
  <!-- VIP 헤더 -->
  <header class="py-16 text-center relative animate-fade-in-up" style="background: linear-gradient(135deg, oklch(0.1000 0.0200 45) 0%, oklch(0.0500 0 0) 50%, oklch(0.1000 0.0200 45) 100%); overflow: hidden;">
    <div class="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-50"></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="flex items-center justify-center mb-6">
        <div class="w-16 h-16 mr-4 text-yellow-400 filter drop-shadow-lg" style="animation: float 3s ease-in-out infinite;">👑</div>
        <h1 class="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          VIP LOUNGE
        </h1>
        <div class="w-16 h-16 ml-4 text-yellow-400 filter drop-shadow-lg" style="animation: float 3s ease-in-out infinite 0.5s;">👑</div>
      </div>
      <p class="text-xl opacity-80 max-w-2xl mx-auto">
        최고의 특권과 혜택을 누리는 프리미엄 멤버십
      </p>
    </div>
  </header>

  <!-- VIP 등급 카드 섹션 -->
  <section class="py-20 px-4 animate-fade-in-up-delay-1" style="opacity: 0; transform: translateY(30px);">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {#each vipTiers as tier}
          <div class="rounded-2xl p-8 text-center backdrop-filter backdrop-blur-lg border transition-all duration-300 hover:transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden"
               style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);"
               class:opacity-75={tier.name === 'SILVER'}>

            <div class="mb-6">
              <h3 class="text-2xl font-bold mb-2">{tier.name}</h3>
              <div class="text-3xl mb-4 text-yellow-400" style="filter: drop-shadow(0 0 10px oklch(0.7500 0.2500 45 / 0.8));">{tier.stars}</div>
              <div class="text-sm opacity-80">{tier.level}</div>
            </div>

            <div class="space-y-4 mb-8 text-left">
              {#each tier.benefits as benefit}
                <div class="flex items-center">
                  <div class="w-5 h-5 mr-3 {benefit.color}" style="display: flex; align-items: center; justify-content: center;">
                    {#if benefit.icon === 'infinity'}∞{:else if benefit.icon === 'user-check'}✓{:else if benefit.icon === 'headphones'}🎧{:else if benefit.icon === 'calendar-star'}📅{:else if benefit.icon === 'zap'}⚡{:else if benefit.icon === 'trending-up'}📈{:else if benefit.icon === 'clock'}🕐{:else if benefit.icon === 'gift'}🎁{:else if benefit.icon === 'star'}⭐{:else if benefit.icon === 'shield-check'}🛡️{:else if benefit.icon === 'arrow-up'}↑{:else if benefit.icon === 'calendar'}📅{:else if benefit.icon === 'percent'}%{:else if benefit.icon === 'clock-3'}🕐{/if}
                  </div>
                  <span>{benefit.label}</span>
                </div>
              {/each}
            </div>

            <button
              on:click={() => handleJoinTier(tier.name)}
              class="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 relative overflow-hidden"
              style="background: linear-gradient(135deg, oklch(0.8500 0.3000 45) 0%, oklch(0.6500 0.2000 35) 100%); border: none; color: oklch(0.0500 0 0); text-transform: uppercase; letter-spacing: 0.1em;">
              가입하기
            </button>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- VIP 전용 혜택 섹션 -->
  <section class="py-20 px-4 animate-fade-in-up-delay-2" style="opacity: 0; transform: translateY(30px);">
    <div class="container mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold mb-4 flex items-center justify-center">
          <span class="w-10 h-10 mr-4 text-yellow-400">🎯</span>
          VIP 전용 혜택
        </h2>
        <p class="text-xl opacity-80">프리미엄 멤버만을 위한 특별한 서비스</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {#each benefits as benefit}
          <div class="rounded-2xl p-8 text-center backdrop-filter backdrop-blur-lg border transition-all duration-300 hover:transform hover:-translate-y-1"
               style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.2);">
            <div class="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
              {#if benefit.icon === 'coins'}💰{:else if benefit.icon === 'gift'}🎁{:else if benefit.icon === 'zap'}⚡{/if}
            </div>
            <h3 class="text-2xl font-bold mb-4">{benefit.title}</h3>
            <p class="opacity-80 mb-4">{benefit.description}</p>
            <p class="text-3xl font-bold text-yellow-400">{benefit.value}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- VIP 통계 대시보드 -->
  <section class="py-20 px-4 animate-fade-in-up-delay-3" style="opacity: 0; transform: translateY(30px);">
    <div class="container mx-auto max-w-4xl">
      <div class="rounded-3xl p-8 backdrop-filter backdrop-blur-lg border"
           style="background: linear-gradient(135deg, oklch(0.0800 0.0150 45 / 0.9) 0%, oklch(0.0600 0.0100 45 / 0.9) 100%); border-color: oklch(0.2000 0.0200 45 / 0.3);">

        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4 flex items-center justify-center">
            <span class="w-10 h-10 mr-4 text-yellow-400">📊</span>
            VIP 통계 대시보드
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div class="text-center">
            <div class="flex items-center justify-center mb-4">
              <span class="text-2xl font-bold mr-4">현재 등급:</span>
              <span class="text-3xl font-bold text-yellow-400">{userStats.currentTier} {userStats.currentStars}</span>
            </div>
          </div>
          <div class="text-center">
            <div class="flex items-center justify-center mb-4">
              <span class="text-2xl font-bold mr-4">다음 등급까지:</span>
              <span class="text-3xl font-bold text-yellow-400 counter">₩{userStats.nextTierAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <!-- 진행률 바 -->
        <div class="mb-12">
          <div class="flex justify-between items-center mb-4">
            <span class="text-lg font-semibold">플래티넘 등급까지</span>
            <span class="text-lg font-bold text-yellow-400">{userStats.progressPercentage}%</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              class="h-full rounded-full progress-bar"
              style="width: {userStats.progressPercentage}%; background: linear-gradient(90deg, oklch(0.7500 0.2500 45) 0%, oklch(0.8500 0.3000 45) 50%, oklch(0.7500 0.2500 45) 100%); background-size: 200% 100%; animation: shimmer 2s infinite;">
            </div>
          </div>
        </div>

        <!-- 통계 그리드 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-sm opacity-80 mb-2">이번 달 베팅</div>
            <div class="text-2xl font-bold text-yellow-400 counter">₩{userStats.monthlyBetting.toLocaleString()}</div>
          </div>
          <div class="text-center">
            <div class="text-sm opacity-80 mb-2">VIP 포인트</div>
            <div class="text-2xl font-bold text-yellow-400 counter">{userStats.vipPoints.toLocaleString()}</div>
          </div>
          <div class="text-center">
            <div class="text-sm opacity-80 mb-2">캐시백 적립</div>
            <div class="text-2xl font-bold text-green-400 counter">₩{userStats.cashbackEarned.toLocaleString()}</div>
          </div>
          <div class="text-center">
            <button
              on:click={handleClaimBonus}
              class="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:transform hover:-translate-y-1 relative overflow-hidden"
              style="background: linear-gradient(135deg, oklch(0.8500 0.3000 45) 0%, oklch(0.6500 0.2000 35) 100%); border: none; color: oklch(0.0500 0 0); text-transform: uppercase; letter-spacing: 0.1em;">
              보너스 받기
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .progress-bar {
    animation: shimmer 2s infinite;
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-fade-in-up-delay-1 {
    animation: fadeInUp 0.8s ease-out 0.2s forwards;
  }

  .animate-fade-in-up-delay-2 {
    animation: fadeInUp 0.8s ease-out 0.4s forwards;
  }

  .animate-fade-in-up-delay-3 {
    animation: fadeInUp 0.8s ease-out 0.6s forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .counter {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }
</style>