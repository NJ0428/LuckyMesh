<script>
  import { onMount } from 'svelte';
  import { slotStore, SYMBOLS, getRandomSymbol, checkWin, calculateTotalWin } from '../stores/slot.js';
  import { fly, slide } from 'svelte/transition';
  import PastelCard from './PastelCard.svelte';
  import PastelButton from './PastelButton.svelte';
  import CoinFountain from './CoinFountain.svelte';

  export let betAmount = 100;
  export let onWin = () => {};
  export let onLose = () => {};

  $: gameState = $slotStore;
  $: currentReels = $slotStore.reels;
  $: canSpin = gameState.gameState === 'ready' && gameState.balance >= betAmount;
  $: isAutoPlay = gameState.autoPlay.enabled;

  let spinningReels = [false, false, false];
  let showWinAnimation = false;
  let winAmount = 0;

  // 스핀 애니메이션
  async function spinReel(reelIndex, delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        spinningReels[reelIndex] = true;

        // 릴 스피닝 애니메이션
        let spins = 0;
        const maxSpins = 20 + Math.random() * 10;
        const spinInterval = setInterval(() => {
          const reel = currentReels[reelIndex];
          reel.currentIndex = (reel.currentIndex + 1) % reel.symbols.length;

          spins++;
          if (spins >= maxSpins) {
            clearInterval(spinInterval);
            spinningReels[reelIndex] = false;
            resolve();
          }
        }, 50);
      }, delay);
    });
  }

  // 슬롯 머신 스핀
  async function spin() {
    if (!canSpin) return;

    // 베팅 금액 차감
    slotStore.update(store => ({
      ...store,
      balance: store.balance - betAmount,
      currentBet: betAmount,
      gameState: 'spinning',
      message: '스핀 중...',
      result: []
    }));

    showWinAnimation = false;

    // 각 릴 순차적으로 스핀
    await spinReel(0, 0);
    await spinReel(1, 200);
    await spinReel(2, 400);

    // 최종 결과 설정
    const finalResult = currentReels.map(reel => {
      const symbolIndex = reel.currentIndex;
      return reel.symbols[symbolIndex];
    });

    // 결과 확인
    const { winAmount: baseWinAmount, winningLines } = checkWin(finalResult);
    const totalWin = calculateTotalWin(baseWinAmount, betAmount);

    // 스토어 업데이트
    slotStore.update(store => {
      const newBalance = store.balance + totalWin;
      const newStats = {
        ...store.stats,
        totalSpins: store.stats.totalSpins + 1,
        totalWins: totalWin > 0 ? store.stats.totalWins + 1 : store.stats.totalWins,
        biggestWin: Math.max(store.stats.biggestWin, totalWin),
        currentStreak: totalWin > 0 ? store.stats.currentStreak + 1 : 0,
        bestStreak: Math.max(store.stats.bestStreak,
          totalWin > 0 ? store.stats.currentStreak + 1 : store.stats.bestStreak)
      };

      const newHistory = [
        {
          id: Date.now(),
          bet: betAmount,
          result: finalResult,
          win: totalWin,
          timestamp: new Date().toISOString(),
          winningLines
        },
        ...store.history.slice(0, 49) // 최근 50개 기록 유지
      ];

      return {
        ...store,
        balance: newBalance,
        result: finalResult,
        winAmount: totalWin,
        totalWin: store.totalWin + totalWin,
        gameState: 'finished',
        message: totalWin > 0
          ? `🎉 축하합니다! ${formatWinAmount(totalWin)}원 획득!`
          : '다음 기회에 도전하세요!',
        history: newHistory,
        stats: newStats
      };
    });

    if (totalWin > 0) {
      winAmount = totalWin;
      showWinAnimation = true;
      onWin(totalWin, winningLines);
    } else {
      onLose();
    }

    // 자동 플레이 처리
    if (isAutoPlay && gameState.autoPlay.spinsRemaining > 1) {
      setTimeout(() => {
        slotStore.update(store => ({
          ...store,
          autoPlay: {
            ...store.autoPlay,
            spinsRemaining: store.autoPlay.spinsRemaining - 1
          },
          gameState: 'ready'
        }));

        setTimeout(() => spin(), 1000);
      }, 2000);
    } else if (isAutoPlay) {
      // 자동 플레이 종료
      slotStore.update(store => ({
        ...store,
        autoPlay: { enabled: false, spinsRemaining: 0 },
        gameState: 'ready'
      }));
    } else {
      // 일반 플레이 계속
      setTimeout(() => {
        slotStore.update(store => ({
          ...store,
          gameState: 'ready'
        }));
      }, 2000);
    }
  }

  // 자동 플레이 시작/중지
  function toggleAutoPlay() {
    if (isAutoPlay) {
      slotStore.update(store => ({
        ...store,
        autoPlay: { enabled: false, spinsRemaining: 0 }
      }));
    } else {
      const spins = prompt('자동 플레이 횟수를 입력하세요 (1-100):', '10');
      const spinCount = parseInt(spins);

      if (spinCount && spinCount > 0 && spinCount <= 100) {
        slotStore.update(store => ({
          ...store,
          autoPlay: { enabled: true, spinsRemaining: spinCount }
        }));

        if (gameState.gameState === 'ready') {
          spin();
        }
      }
    }
  }

  // 베팅 금액 변경
  function changeBetAmount(amount) {
    betAmount = amount;
    slotStore.update(store => ({ ...store, betAmount: amount }));
  }

  // 초기화
  function reset() {
    slotStore.update(store => ({
      ...store,
      gameState: 'ready',
      message: '베팅 금액을 선택하고 스핀 버튼을 누르세요!',
      result: [],
      winAmount: 0
    }));
    showWinAnimation = false;
  }

  function formatWinAmount(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount);
  }

  // 키보드 단축키
  function handleKeydown(e) {
    if (e.code === 'Space' && canSpin) {
      e.preventDefault();
      spin();
    } else if (e.code === 'KeyR') {
      reset();
    } else if (e.code === 'KeyA') {
      toggleAutoPlay();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="slot-machine">
  <!-- 슬롯 머신 헤더 -->
  <div class="text-center mb-6">
    <h2 class="text-2xl font-bold font-playfair mb-2">🎰 럭키 슬롯</h2>
    <p class="text-sm opacity-90">행운의 심볼을 맞춰 대박을 터뜨리세요!</p>
  </div>

  <!-- 릴 영역 -->
  <div class="reels-container mb-8">
    <PastelCard
      gradient={true}
      gradientFrom="pastel-purple"
      gradientTo="pastel-pink"
      padding="p-8"
      glow={showWinAnimation}
    >
      <div class="flex justify-center items-center space-x-4">
        {#each currentReels as reel, reelIndex}
          <div class="reel-wrapper">
            <div class="reel" class:spinning={spinningReels[reelIndex]}>
              <div class="reel-symbols" style="transform: translateY(-{reel.currentIndex * 80}px)">
                {#each reel.symbols as symbol, symbolIndex}
                  <div
                    class="reel-symbol"
                    class:active={symbolIndex === reel.currentIndex}
                  >
                    {symbol}
                  </div>
                {/each}
              </div>
            </div>
            <div class="reel-label">릴 {reelIndex + 1}</div>
          </div>
        {/each}
      </div>

      <!-- 페이라인 표시 -->
      <div class="paylines-indicator mt-4 text-center">
        <div class="text-xs opacity-70">5개의 페이라인</div>
      </div>
    </PastelCard>
  </div>

  <!-- 결과 표시 -->
  {#if showWinAnimation}
    <div
      class="win-message text-center mb-6"
      transition:fly={{ y: -20, duration: 500 }}
    >
      <div class="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-8 py-4 rounded-full inline-block">
        <div class="text-2xl font-bold">🎉 {formatWinAmount(winAmount)}원 획득! 🎉</div>
      </div>
    </div>
  {:else if gameState.gameState === 'finished' && gameState.winAmount === 0}
    <div class="lose-message text-center mb-6">
      <div class="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-full inline-block">
        <div class="text-lg">다음 기회에 도전하세요!</div>
      </div>
    </div>
  {/if}

  <!-- 컨트롤 버튼 -->
  <div class="controls space-y-6">
    <!-- 메인 버튼 -->
    <div class="flex justify-center">
      <PastelButton
        variant="primary"
        size="lg"
        glow={canSpin}
        disabled={!canSpin}
        on:click={spin}
        loading={gameState.gameState === 'spinning'}
      >
        {#if gameState.gameState === 'spinning'}
          <span class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            스픈 중...
          </span>
        {:else}
          <span class="flex items-center">
            🎰 스핀 (스페이스바)
          </span>
        {/if}
      </PastelButton>
    </div>

    <!-- 보조 버튼 -->
    <div class="flex justify-center space-x-4">
      <PastelButton
        variant="secondary"
        size="sm"
        on:click={toggleAutoPlay}
        class={isAutoPlay ? 'ring-2 ring-green-400' : ''}
      >
        {isAutoPlay ? `자동 중지 (${gameState.autoPlay.spinsRemaining})` : '자동 플레이 (A)'}
      </PastelButton>

      <PastelButton
        variant="accent"
        size="sm"
        on:click={reset}
      >
        초기화 (R)
      </PastelButton>
    </div>

    <!-- 베팅 금액 선택 -->
    <div class="betting-options">
      <div class="text-center mb-3">
        <span class="text-sm font-semibold">베팅 금액:</span>
        <span class="text-lg font-bold ml-2">{formatWinAmount(betAmount)}원</span>
      </div>

      <div class="flex justify-center flex-wrap gap-2">
        {#each [10, 50, 100, 500, 1000, 5000] as amount}
          <PastelButton
            variant={betAmount === amount ? 'primary' : 'secondary'}
            size="sm"
            on:click={() => changeBetAmount(amount)}
            disabled={gameState.gameState === 'spinning'}
          >
            {formatWinAmount(amount)}
          </PastelButton>
        {/each}
      </div>
    </div>
  </div>

  <!-- 승리 애니메이션 -->
  {#if showWinAnimation}
    <CoinFountain />
  {/if}
</div>

<style>
  .slot-machine {
    max-width: 600px;
    margin: 0 auto;
  }

  .reels-container {
    position: relative;
  }

  .reel-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .reel {
    width: 100px;
    height: 240px;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    position: relative;
  }

  .reel.spinning {
    animation: pulse 0.5s ease-in-out infinite;
  }

  .reel-symbols {
    transition: transform 0.1s ease-out;
    will-change: transform;
  }

  .reel-symbol {
    width: 100px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.1) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .reel-symbol.active {
    background: linear-gradient(180deg,
      rgba(255, 215, 0, 0.3) 0%,
      rgba(255, 215, 0, 0.2) 50%,
      rgba(255, 215, 0, 0.3) 100%);
    border: 2px solid rgba(255, 215, 0, 0.5);
    font-weight: bold;
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
  }

  .reel-label {
    margin-top: 8px;
    font-size: 0.75rem;
    opacity: 0.7;
    font-weight: 600;
  }

  .win-message {
    animation: bounce 1s ease-in-out infinite;
  }

  @keyframes spin {
    0% { transform: translateY(0); }
    100% { transform: translateY(-100%); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  /* 반응형 디자인 */
  @media (max-width: 640px) {
    .reel {
      width: 80px;
      height: 200px;
    }

    .reel-symbol {
      width: 80px;
      height: 66px;
      font-size: 2.5rem;
    }

    .betting-options .flex {
      gap: 0.5rem;
    }
  }

  /* 접근성: 애니메이션 줄이기 지원 */
  @media (prefers-reduced-motion: reduce) {
    .reel-symbols {
      transition: none;
    }

    .reel.spinning {
      animation: none;
    }

    .win-message {
      animation: none;
    }
  }
</style>