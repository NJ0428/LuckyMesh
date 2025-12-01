<script>
  import { onMount } from 'svelte';
  import { pokerStore, pokerActions } from '$lib/stores/poker.js';
  import PastelButton from '$lib/components/PastelButton.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import EnhancedPlayingCard from '$lib/components/EnhancedPlayingCard.svelte';
  import PokerTable from '$lib/components/PokerTable.svelte';

  let showRules = false;
  let showStrategy = false;
  let currentStats = {
    activePlayers: 1234,
    todayGames: 5678,
    averagePot: 45000,
    maxWin: 2500000
  };

  onMount(() => {
    // 실시간 통계 업데이트 시뮬레이션
    const interval = setInterval(() => {
      currentStats.activePlayers += Math.floor(Math.random() * 10) - 5;
      currentStats.todayGames += Math.floor(Math.random() * 5);
      currentStats.averagePot += Math.floor(Math.random() * 1000) - 500;
    }, 3000);

    return () => clearInterval(interval);
  });

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  function toggleRules() {
    showRules = !showRules;
    showStrategy = false;
  }

  function toggleStrategy() {
    showStrategy = !showStrategy;
    showRules = false;
  }

</script>

<svelte:head>
  <title>텍사스 홀덤 포커 - 럭키메시 카지노</title>
  <meta name="description" content="흥미진진한 텍사스 홀덤 포커 게임을 즐겨보세요." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pastel-sky via-pastel-cream to-pastel-mint">
  <!-- 게임 헤더 -->
  <div class="bg-gradient-to-r from-primary-soft-purple to-primary-soft-peach py-6">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center text-black gap-4">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <span class="text-3xl">♠️</span>
            <span class="text-3xl">♥️</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold font-playfair">텍사스 홀덤 포커</h1>
            <p class="text-sm opacity-90">RTP: 97.8% | 베팅 범위: ₩1,000 - ₩200,000</p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div class="text-center">
            <div class="text-2xl font-bold">{formatCurrency(10000)}</div>
            <div class="text-sm opacity-90">잔고</div>
          </div>
          <div class="flex gap-2">
            <button
              on:click={toggleRules}
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all text-black font-medium"
            >
              📖 게임 규칙
            </button>
            <button
              on:click={toggleStrategy}
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all text-black font-medium"
            >
              💡 전략 가이드
            </button>
            <button
              on:click={() => {}}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="설정"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 실시간 통계 바 -->
  <div class="bg-black/10 backdrop-blur-sm py-3">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-wrap justify-center md:justify-between items-center gap-4 text-sm text-gray-800">
        <div class="flex items-center space-x-2">
          <span class="text-green-600">🟢</span>
          <span class="text-gray-800">현재 플레이어: <strong class="text-black">{currentStats.activePlayers.toLocaleString()}명</strong></span>
        </div>
        <div class="flex items-center space-x-2">
          <span>📊</span>
          <span class="text-gray-800">오늘 게임 수: <strong class="text-black">{currentStats.todayGames.toLocaleString()}게임</strong></span>
        </div>
        <div class="flex items-center space-x-2">
          <span>💰</span>
          <span class="text-gray-800">평균 팟: <strong class="text-black">{formatCurrency(currentStats.averagePot)}</strong></span>
        </div>
        <div class="flex items-center space-x-2">
          <span>🏆</span>
          <span class="text-gray-800">최고 상금: <strong class="text-black">{formatCurrency(currentStats.maxWin)}</strong></span>
        </div>
      </div>
    </div>
  </div>

  <!-- 메인 게임 영역 -->
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <!-- 게임 테이블 -->
      <div class="lg:col-span-3">
        <PokerTable />
      </div>

      <!-- 사이드바 -->
      <div class="space-y-6">
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center">게임 정보</h3>
           <div class="space-y-2 text-sm text-black">
              <div class="flex justify-between">
                <span>게임 상태:</span>
                <span class="font-bold">베팅 중</span>
              </div>
              <div class="flex justify-between">
                <span>현재 팟:</span>
                <span class="font-bold">{formatCurrency(150)}</span>
              </div>
            </div>
        </PastelCard>
        
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center">내 핸드</h3>
          <div class="flex justify-center space-x-2">
            <EnhancedPlayingCard suit="spades" rank="A" size="medium" />
            <EnhancedPlayingCard suit="hearts" rank="K" size="medium" />
          </div>
        </PastelCard>

        <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center">액션</h3>
            <div class="grid grid-cols-2 gap-2">
                <PastelButton variant="secondary" on:click={() => {}}>폴드</PastelButton>
                <PastelButton variant="primary" on:click={() => {}}>체크</PastelButton>
                <PastelButton variant="accent" on:click={() => {}}>레이즈</PastelButton>
                <PastelButton variant="primary" on:click={() => {}}>콜</PastelButton>
            </div>
            <div class="mt-4">
                <label for="bet-amount" class="block text-sm font-medium text-gray-700">베팅 금액</label>
                <input type="range" id="bet-amount" min="10" max="1000" value="50" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="text-center mt-2 font-bold">{formatCurrency(50)}</div>
            </div>
        </PastelCard>

      </div>
    </div>
  </div>
</div>
