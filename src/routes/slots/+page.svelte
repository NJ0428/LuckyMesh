<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { slotStore, initialState } from '../../lib/stores/slot.js';
  import { fly, slide } from 'svelte/transition';
  import SlotMachine from '../../lib/components/SlotMachine.svelte';
  import PastelCard from '../../lib/components/PastelCard.svelte';
  import PastelButton from '../../lib/components/PastelButton.svelte';
  import GameSettings from '../../lib/components/GameSettings.svelte';
  import JackpotDisplay from '../../lib/components/JackpotDisplay.svelte';
  import JackpotWinEffect from '../../lib/components/JackpotWinEffect.svelte';
  import { jackpotStore, formatJackpotAmount } from '../../lib/stores/jackpot.js';

  let betAmount = 100;
  let showRules = false;
  let showStats = false;
  let showJackpotWin = false;
  let jackpotWinData = {
    name: '',
    amount: 0,
    username: ''
  };

  $: gameState = $slotStore;
  $: balance = gameState.balance;
  $: history = gameState.history;
  $: stats = gameState.stats;

  // 페이지 로드 시 초기화
  onMount(() => {
    const currentStore = get(slotStore);
    slotStore.set({
      ...initialState,
      balance: currentStore.balance,
      stats: currentStore.stats,
      history: currentStore.history
    });
  });

  function handleWin(amount, winningLines) {
    console.log(`승리! ${amount}원 획득, 페이라인: ${winningLines.length}`);

    // 잭팟 당첨 확인
    if (gameState.jackpot && gameState.jackpot.won) {
      showJackpotWinEffect();
    }
  }

  function handleLose() {
    console.log('패배... 다음 기회에!');
  }

  function showJackpotWinEffect() {
    const jackpotData = gameState.jackpot;
    let jackpotName = '';
    let totalAmount = 0;

    if (jackpotData.type === 'both') {
      jackpotName = 'MEGA JACKPOT + 슬롯 잭팟';
      totalAmount = jackpotData.amount * 2; // 대략적인 계산
    } else if (jackpotData.type === 'global') {
      jackpotName = 'MEGA JACKPOT';
      totalAmount = jackpotData.amount;
    } else {
      jackpotName = '슬롯 머신 잭팟';
      totalAmount = jackpotData.amount;
    }

    jackpotWinData = {
      name: jackpotName,
      amount: totalAmount,
      username: '나' // 실제로는 사용자 이름
    };
    showJackpotWin = true;
  }

  function closeJackpotEffect() {
    showJackpotWin = false;
    // 잭팟 상태 초기화
    slotStore.update(store => ({
      ...store,
      jackpot: {
        eligible: false,
        won: false,
        amount: 0,
        type: null
      }
    }));
  }

  function formatWinAmount(amount) {
    return new Intl.NumberFormat('ko-KR').format(amount);
  }

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // 게임 설정
  let settings = {
    soundEnabled: true,
    animationsEnabled: true,
    autoSpinDelay: 2000,
    maxBet: 5000
  };

  function saveSettings() {
    localStorage.setItem('slotSettings', JSON.stringify(settings));
  }

  function loadSettings() {
    const saved = localStorage.getItem('slotSettings');
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };
    }
  }

  loadSettings();
</script>

<svelte:head>
  <title>슬롯머신 - 럭키메시 카지노</title>
  <meta name="description" content="럭키메시 카지노의 슬롯머신 게임 - 행운의 심볼을 맞춰 대박을 터뜨리세요!" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pastel-mint via-pastel-cream to-pastel-sky">
  <!-- 헤더 섹션 -->
  <div class="bg-gradient-to-r from-primary-soft-mint to-primary-soft-peach py-6">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <div class="text-4xl">🎰</div>
          <div>
            <h1 class="text-3xl font-bold font-playfair text-black">슬롯머신</h1>
            <p class="text-sm opacity-90 text-black">Lucky Slots - 행운의 릴을 돌려보세요</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- 잔고 표시 -->
          <div class="bg-white/80 backdrop-blur px-6 py-3 rounded-full shadow-lg text-black">
            <div class="flex items-center space-x-2">
              <span class="text-2xl">💰</span>
              <div>
                <div class="text-xs opacity-70">잔고</div>
                <div class="font-bold text-lg">{formatWinAmount(balance)}원</div>
              </div>
            </div>
          </div>

          <!-- 기능 버튼들 -->
          <PastelButton variant="secondary" size="sm" on:click={() => showRules = !showRules}>
            📖 규칙
          </PastelButton>

          <PastelButton variant="secondary" size="sm" on:click={() => showStats = !showStats}>
            📊 통계
          </PastelButton>

          <PastelButton variant="accent" size="sm" href="/">
            🏠 홈
          </PastelButton>
        </div>
      </div>
    </div>
  </div>

  <!-- 메인 게임 영역 -->
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- 잭팟 디스플레이 -->
    <div class="mb-6">
      <JackpotDisplay gameType="slots" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 게임 테이블 (주요 영역) -->
      <div class="lg:col-span-3">
        <PastelCard gradient={true} gradientFrom="pastel-cream" gradientTo="pastel-mint" padding="p-6">
          <!-- 게임 상태 메시지 -->
          <div class="text-center mb-6" transition:fly={{ y: -20, duration: 300 }}>
            <div class="bg-gradient-to-r from-primary-soft-purple to-primary-soft-pink text-black px-6 py-3 rounded-full inline-block">
              <span class="font-bold">{gameState.message}</span>
            </div>
          </div>

          <!-- 슬롯 머신 -->
          <SlotMachine
            {betAmount}
            onWin={handleWin}
            onLose={handleLose}
          />

          <!-- 게임 정보 -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <PastelCard padding="p-4">
              <div class="text-center">
                <div class="text-sm opacity-70 mb-1">총 스핀</div>
                <div class="text-2xl font-bold">{stats.totalSpins}</div>
              </div>
            </PastelCard>

            <PastelCard padding="p-4">
              <div class="text-center">
                <div class="text-sm opacity-70 mb-1">승리 횟수</div>
                <div class="text-2xl font-bold">{stats.totalWins}</div>
              </div>
            </PastelCard>

            <PastelCard padding="p-4">
              <div class="text-center">
                <div class="text-sm opacity-70 mb-1">최대 당첨</div>
                <div class="text-2xl font-bold">{formatWinAmount(stats.biggestWin)}원</div>
              </div>
            </PastelCard>
          </div>
        </PastelCard>
      </div>

      <!-- 사이드바 -->
      <div class="space-y-6">
        <!-- 베팅 정보 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">현재 베팅</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm opacity-70">베팅 금액:</span>
              <span class="font-bold">{formatWinAmount(betAmount)}원</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm opacity-70">총 당첨:</span>
              <span class="font-bold text-green-600">{formatWinAmount(gameState.totalWin)}원</span>
            </div>
            {#if gameState.autoPlay.enabled}
              <div class="flex justify-between">
                <span class="text-sm opacity-70">자동 플레이:</span>
                <span class="font-bold text-blue-600">{gameState.autoPlay.spinsRemaining}회 남음</span>
              </div>
            {/if}
          </div>
        </PastelCard>

        <!-- 게임 기록 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">최근 기록</h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            {#if history.length === 0}
              <div class="text-center text-sm opacity-70 py-4 text-black">
                아직 게임 기록이 없습니다
              </div>
            {:else}
              {#each history.slice(0, 10) as game}
                <div class="border-b border-gray-200 pb-2 last:border-0">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <div class="text-lg">
                        {game.result.join(' ')}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xs opacity-70">{formatTime(game.timestamp)}</div>
                      <div class="font-bold {game.win > 0 ? 'text-green-600' : 'text-gray-600'}">
                        {game.win > 0 ? '+' : ''}{formatWinAmount(game.win)}원
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </PastelCard>

        <!-- 심볼 정보 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">심볼 정보</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-2xl">🍒</span>
              <span class="font-semibold">체리</span>
              <span>x2</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl">🍋</span>
              <span class="font-semibold">레몬</span>
              <span>x3</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl">🍊</span>
              <span class="font-semibold">오렌지</span>
              <span>x4</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl">🍇</span>
              <span class="font-semibold">포도</span>
              <span>x5</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl">🔔</span>
              <span class="font-semibold">벨</span>
              <span>x10</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl">💎</span>
              <span class="font-semibold">다이아몬드</span>
              <span>x20</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-2xl">7️⃣</span>
              <span class="font-semibold">세븐</span>
              <span>x50</span>
            </div>
          </div>
        </PastelCard>
      </div>
    </div>
  </div>

  <!-- 잭팟 당첨 이펙트 -->
  <JackpotWinEffect
    show={showJackpotWin}
    jackpotName={jackpotWinData.name}
    amount={jackpotWinData.amount}
    username={jackpotWinData.username}
    onClose={closeJackpotEffect}
  />

  <!-- 규칙 모달 -->
  {#if showRules}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showRules = false}>
      <div class="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto text-black" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold font-playfair">🎰 게임 규칙</h3>
          <PastelButton variant="secondary" size="sm" on:click={() => showRules = false}>
            ✕
          </PastelButton>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <h4 class="font-bold mb-2">🎯 게임 목표</h4>
            <p>릴을 스핀하여 동일한 심볼을 3개 맞추세요!</p>
          </div>

          <div>
            <h4 class="font-bold mb-2">📏 페이라인</h4>
            <ul class="list-disc list-inside space-y-1">
              <li>가로 3줄 (상단, 중앙, 하단)</li>
              <li>대각선 2줄</li>
              <li>총 5개의 페이라인</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2">💰 당첨 계산</h4>
            <p>당첨금 = (심볼 배율) × (베팅 금액)</p>
            <p class="text-xs opacity-70 mt-1">예: 세븐 3개 맞추기 = 50 × 베팅 금액</p>
          </div>

          <div>
            <h4 class="font-bold mb-2">⌨️ 단축키</h4>
            <ul class="list-disc list-inside space-y-1">
              <li><kbd class="px-2 py-1 bg-gray-200 rounded">스페이스바</kbd> - 스핀</li>
              <li><kbd class="px-2 py-1 bg-gray-200 rounded">A</kbd> - 자동 플레이</li>
              <li><kbd class="px-2 py-1 bg-gray-200 rounded">R</kbd> - 초기화</li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold mb-2">🎮 자동 플레이</h4>
            <p>최대 100회까지 자동으로 게임을 진행할 수 있습니다.</p>
          </div>
        </div>

        <div class="mt-6 text-center">
          <PastelButton variant="primary" on:click={() => showRules = false}>
            확인
          </PastelButton>
        </div>
      </div>
    </div>
  {/if}

  <!-- 통계 모달 -->
  {#if showStats}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showStats = false}>
      <div class="bg-white rounded-2xl p-6 max-w-md w-full text-black" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold font-playfair">📊 게임 통계</h3>
          <PastelButton variant="secondary" size="sm" on:click={() => showStats = false}>
            ✕
          </PastelButton>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold">{stats.totalSpins}</div>
              <div class="text-xs opacity-70">총 스핀 횟수</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold">{stats.totalWins}</div>
              <div class="text-xs opacity-70">총 승리 횟수</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold">
                {stats.totalSpins > 0 ? Math.round((stats.totalWins / stats.totalSpins) * 100) : 0}%
              </div>
              <div class="text-xs opacity-70">승리 확률</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <div class="text-2xl font-bold">{formatWinAmount(stats.biggestWin)}원</div>
              <div class="text-xs opacity-70">최대 당첨금</div>
            </div>
          </div>

          <div class="text-center p-3 bg-yellow-50 rounded-lg">
            <div class="text-lg font-bold">{stats.bestStreak}</div>
            <div class="text-xs opacity-70">최장 연승 기록</div>
          </div>

          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-lg font-bold">{formatWinAmount(gameState.totalWin)}원</div>
            <div class="text-xs opacity-70">총 획득 금액</div>
          </div>
        </div>

        <div class="mt-6 text-center">
          <PastelButton variant="primary" on:click={() => showStats = false}>
            닫기
          </PastelButton>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* 커스텀 스타일 */
  .modal-enter {
    animation: modalFadeIn 0.3s ease-out;
  }

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* 반응형 디자인 */
  @media (max-width: 1024px) {
    .grid-cols-1 {
      grid-template-columns: 1fr;
    }

    .lg\:col-span-3 {
      grid-column: span 1;
    }
  }

  @media (max-width: 640px) {
    .max-w-7xl {
      max-width: 100%;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .text-3xl {
      font-size: 1.875rem;
    }

    .flex.justify-between.items-center {
      flex-direction: column;
      gap: 1rem;
    }
  }
</style>