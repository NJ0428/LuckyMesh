<script>
  import { onMount, onDestroy } from 'svelte';
  import { jackpotStore, formatJackpotAmount, getContributionDisplay, globalJackpot, gameJackpots, recentWinners } from '../stores/jackpot.js';
  import { fly, fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let gameType = null; // 특정 게임만 표시하려면 gameId 전달 (null이면 전체 표시)
  export let compact = false; // 컴팩트 모드
  export let showContribution = true; // 적립률 표시
  export let autoRotate = true; // 자동 회전
  export let animationSpeed = 3000; // 회전 속도 (ms)

  let currentJackpot = null;
  let displayAmount = 0;
  let targetAmount = 0;
  let carouselIndex = 0;
  let rotationInterval = null;
  let isIncreasing = false;
  let pulseAmount = 0;

  $: if ($jackpotStore) {
    updateCurrentJackpot();
  }

  $: if (currentJackpot) {
    targetAmount = currentJackpot.amount;
    animateAmount();
  }

  function updateCurrentJackpot() {
    if (gameType && $jackpotStore.games[gameType]) {
      currentJackpot = $jackpotStore.games[gameType];
    } else if (carouselIndex === 0) {
      currentJackpot = $jackpotStore.global;
    } else {
      const gameIds = Object.keys($jackpotStore.games);
      currentJackpot = $jackpotStore.games[gameIds[(carouselIndex - 1) % gameIds.length]];
    }
  }

  function animateAmount() {
    const duration = 1000;
    const start = displayAmount;
    const diff = targetAmount - start;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      displayAmount = Math.floor(start + diff * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        displayAmount = targetAmount;
      }
    }

    requestAnimationFrame(step);
  }

  function rotateJackpot() {
    carouselIndex = (carouselIndex + 1) % (Object.keys($jackpotStore.games).length + 1);
    updateCurrentJackpot();
  }

  function startRotation() {
    if (autoRotate) {
      rotationInterval = setInterval(rotateJackpot, animationSpeed);
    }
  }

  function stopRotation() {
    if (rotationInterval) {
      clearInterval(rotationInterval);
      rotationInterval = null;
    }
  }

  // 다른 유저의 베팅으로 인한 잭팟 증가 시뮬레이션
  function simulateOtherPlayers() {
    jackpotStore.simulateIncrease();
    isIncreasing = true;
    pulseAmount = 1;

    setTimeout(() => {
      isIncreasing = false;
    }, 300);

    setTimeout(() => {
      pulseAmount = 0;
    }, 600);
  }

  onMount(() => {
    updateCurrentJackpot();
    displayAmount = currentJackpot?.amount || 0;
    startRotation();

    // 랜덤 간격으로 다른 유저의 베팅 시뮬레이션
    const simulationInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        simulateOtherPlayers();
      }
    }, 2000);

    onDestroy(() => {
      stopRotation();
      clearInterval(simulationInterval);
    });
  });

  function formatAmount(amount) {
    return formatJackpotAmount(amount);
  }

  function getGradient(jackpotType) {
    const gradients = {
      global: 'from-yellow-400 via-orange-400 to-red-500',
      slots: 'from-pink-400 via-purple-400 to-indigo-500',
      blackjack: 'from-green-400 via-emerald-400 to-teal-500',
      roulette: 'from-red-400 via-rose-400 to-pink-500',
      baccarat: 'from-blue-400 via-cyan-400 to-sky-500',
      poker: 'from-amber-400 via-yellow-400 to-orange-500',
      sicbo: 'from-violet-400 via-purple-400 to-fuchsia-500'
    };
    return gradients[jackpotType] || gradients.global;
  }
</script>

<div
  class="jackpot-display"
  class:compact
  on:mouseenter={stopRotation}
  on:mouseleave={startRotation}
>
  <!-- 컴팩트 모드 -->
  {#if compact}
    <div class="jackpot-compact">
      <div class="jackpot-icon">🎰</div>
      <div class="jackpot-info">
        <div class="jackpot-label">{currentJackpot?.name || '잭팟'}</div>
        <div class="jackpot-amount" class:pulsing={isIncreasing}>
          {formatAmount(displayAmount)}
        </div>
      </div>
      {#if showContribution && currentJackpot}
        <div class="contribution-badge">
          +{getContributionDisplay(currentJackpot.contributionRate)}
        </div>
      {/if}
    </div>

  <!-- 전체 모드 */}
  {:else}
    <div class="jackpot-full">
      <!-- 헤더 -->
      <div class="jackpot-header">
        <div class="jackpot-title">
          <span class="title-icon">💎</span>
          <span class="title-text">{currentJackpot?.name || '잭팟'}</span>
          <span class="title-glow"></span>
        </div>
        {#if showContribution && currentJackpot}
          <div class="contribution-info">
            <span class="contribution-label">적립률</span>
            <span class="contribution-value">+{getContributionDisplay(currentJackpot.contributionRate)}</span>
          </div>
        {/if}
      </div>

      <!-- 잭팟 금액 -->
      <div class="jackpot-amount-container">
        <div class="amount-display" class:pulsing={isIncreasing} class:pulse-extra={pulseAmount > 0}>
          <span class="amount-value">{formatAmount(displayAmount)}</span>
          <span class="amount-increase" class:show={isIncreasing}>
            +{formatAmount(targetAmount - displayAmount)}
          </span>
        </div>
        <div class="amount-glow"></div>
      </div>

      <!-- 프로그레스 바 (임박 표시) -->
      <div class="jackpot-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {Math.min((currentJackpot?.amount || 0) / 100000000 * 100, 100)}%"></div>
        </div>
        <div class="progress-label">
          {currentJackpot?.amount && currentJackpot.amount >= 100000000 ? '🔥 파열 임박!' : '적립 중...'}
        </div>
      </div>

      <!-- 최근 당첨자 -->
      {#if $recentWinners && $recentWinners.length > 0}
        <div class="recent-winner" transition:slide={{ duration: 300 }}>
          <span class="winner-icon">🏆</span>
          <span class="winner-name">{$recentWinners[0].username}</span>
          <span class="winner-amount">{formatAmount($recentWinners[0].amount)}</span>
        </div>
      {/if}

      <!-- 캐러셀 인디케이터 -->
      {#if !gameType}
        <div class="carousel-indicators">
          <div class="indicator" class:active={carouselIndex === 0}></div>
          {#each Object.keys($jackpotStore.games) as gameId, idx}
            <div class="indicator" class:active={carouselIndex === idx + 1}></div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- 잭팟 당첨 확률 툴팁 -->
    {#if currentJackpot && currentJackpot.winChance}
      <div class="jackpot-tooltip">
        <span class="tooltip-label">당첨 확률</span>
        <span class="tooltip-value">{(currentJackpot.winChance * 100).toFixed(4)}%</span>
      </div>
    {/if}
  {/if}
</div>

<style>
  .jackpot-display {
    position: relative;
    width: 100%;
  }

  /* 컴팩트 모드 */
  .jackpot-compact {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 9999px;
    backdrop-filter: blur(10px);
  }

  .jackpot-icon {
    font-size: 1.5rem;
    animation: bounce 2s ease-in-out infinite;
  }

  .jackpot-info {
    flex: 1;
    min-width: 0;
  }

  .jackpot-label {
    font-size: 0.75rem;
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .jackpot-amount {
    font-size: 1.125rem;
    font-weight: 700;
    background: linear-gradient(90deg, #ffd700, #ff8c00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .jackpot-amount.pulsing {
    animation: pulse-gold 0.3s ease-out;
  }

  .contribution-badge {
    padding: 0.25rem 0.5rem;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #22c55e;
    white-space: nowrap;
  }

  /* 전체 모드 */
  .jackpot-full {
    padding: 1.5rem;
    background: linear-gradient(135deg,
      rgba(255, 215, 0, 0.15),
      rgba(255, 165, 0, 0.1),
      rgba(255, 69, 0, 0.15));
    border: 3px solid rgba(255, 215, 0, 0.4);
    border-radius: 1.5rem;
    backdrop-filter: blur(20px);
    box-shadow:
      0 0 30px rgba(255, 215, 0, 0.3),
      inset 0 0 30px rgba(255, 255, 255, 0.1);
    overflow: hidden;
    position: relative;
  }

  .jackpot-full::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgba(255, 215, 0, 0.1) 60deg,
      transparent 120deg
    );
    animation: rotate 10s linear infinite;
    pointer-events: none;
  }

  .jackpot-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }

  .jackpot-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .title-icon {
    font-size: 1.5rem;
    animation: sparkle 1.5s ease-in-out infinite;
  }

  .title-text {
    font-size: 1.25rem;
    font-weight: 700;
    background: linear-gradient(90deg, #ffd700, #ff8c00, #ffd700);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .title-glow {
    position: absolute;
    inset: -0.5rem;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent 70%);
    filter: blur(10px);
    z-index: -1;
  }

  .contribution-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.125rem;
  }

  .contribution-label {
    font-size: 0.625rem;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .contribution-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: #22c55e;
  }

  .jackpot-amount-container {
    position: relative;
    text-align: center;
    margin: 1.5rem 0;
    z-index: 1;
  }

  .amount-display {
    position: relative;
    display: inline-block;
  }

  .amount-display.pulsing {
    animation: jackpot-pulse 0.3s ease-out;
  }

  .amount-display.pulse-extra {
    animation: jackpot-pulse-big 0.6s ease-out;
  }

  .amount-value {
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(180deg, #ffd700 0%, #ff8c00 50%, #ff4500 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.5));
    display: block;
  }

  .amount-increase {
    position: absolute;
    top: -1rem;
    right: -2rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: #22c55e;
    opacity: 0;
    transform: translateY(0.5rem);
    transition: all 0.3s ease-out;
  }

  .amount-increase.show {
    opacity: 1;
    transform: translateY(0);
  }

  .amount-glow {
    position: absolute;
    inset: -1rem;
    background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.4), transparent 70%);
    filter: blur(20px);
    z-index: -1;
    animation: glow-pulse 2s ease-in-out infinite;
  }

  .jackpot-progress {
    margin-top: 1rem;
    position: relative;
    z-index: 1;
  }

  .progress-bar {
    height: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 9999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffd700, #ff8c00, #ff4500);
    border-radius: 9999px;
    transition: width 0.5s ease-out;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .progress-label {
    text-align: center;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    opacity: 0.8;
  }

  .recent-winner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    position: relative;
    z-index: 1;
  }

  .winner-icon {
    animation: bounce 1s ease-in-out infinite;
  }

  .winner-name {
    font-weight: 600;
    color: #ffd700;
  }

  .winner-amount {
    font-weight: 700;
    color: #22c55e;
  }

  .carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
    position: relative;
    z-index: 1;
  }

  .indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .indicator.active {
    background: #ffd700;
    width: 1.5rem;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .jackpot-tooltip {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
    font-size: 0.75rem;
    position: relative;
    z-index: 1;
  }

  .tooltip-label {
    opacity: 0.7;
  }

  .tooltip-value {
    font-weight: 700;
    color: #ffd700;
  }

  /* 애니메이션 */
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-0.25rem); }
  }

  @keyframes pulse-gold {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes jackpot-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  @keyframes jackpot-pulse-big {
    0% { transform: scale(1); }
    25% { transform: scale(1.05); }
    50% { transform: scale(0.98); }
    75% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
    25% { opacity: 0.8; transform: scale(1.1) rotate(5deg); }
    50% { opacity: 1; transform: scale(1) rotate(0deg); }
    75% { opacity: 0.8; transform: scale(1.1) rotate(-5deg); }
  }

  @keyframes glow-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.05); }
  }

  /* 반응형 */
  @media (max-width: 640px) {
    .amount-value {
      font-size: 2rem;
    }

    .jackpot-full {
      padding: 1rem;
    }
  }

  /* 접근성 */
  @media (prefers-reduced-motion: reduce) {
    .jackpot-icon,
    .title-icon,
    .winner-icon,
    .jackpot-full::before {
      animation: none;
    }

    .jackpot-amount.pulsing,
    .amount-display.pulsing,
    .amount-display.pulse-extra {
      animation: none;
    }
  }
</style>
