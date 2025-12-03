<script>
  import { onMount } from 'svelte';
  import { pokerStore, pokerActions } from '$lib/stores/poker.js';
  import PastelButton from '$lib/components/PastelButton.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import EnhancedPlayingCard from '$lib/components/EnhancedPlayingCard.svelte';
  import PokerTable from '$lib/components/PokerTable.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let showRules = false;
  let showStrategy = false;
  let showHandRanking = false;
  let betAmount = 50;
  let currentPot = 150;
  
  // 애니메이션을 위한 tweened 값들
  const animatedPlayers = tweened(1234, { duration: 800, easing: cubicOut });
  const animatedGames = tweened(5678, { duration: 800, easing: cubicOut });
  const animatedPot = tweened(45000, { duration: 800, easing: cubicOut });
  const animatedMaxWin = tweened(2500000, { duration: 800, easing: cubicOut });

  let currentStats = {
    activePlayers: 1234,
    todayGames: 5678,
    averagePot: 45000,
    maxWin: 2500000
  };

  // 핸드 랭킹 데이터
  const handRankings = [
    { rank: 1, name: '로얄 플러시', description: 'A-K-Q-J-10 같은 무늬', icon: '👑', color: 'from-yellow-400 to-orange-500' },
    { rank: 2, name: '스트레이트 플러시', description: '같은 무늬의 연속된 5장', icon: '💎', color: 'from-purple-400 to-pink-500' },
    { rank: 3, name: '포카드', description: '같은 숫자 4장', icon: '🎯', color: 'from-blue-400 to-cyan-500' },
    { rank: 4, name: '풀하우스', description: '트리플 + 원페어', icon: '🏠', color: 'from-green-400 to-emerald-500' },
    { rank: 5, name: '플러시', description: '같은 무늬 5장', icon: '✨', color: 'from-pink-400 to-rose-500' },
    { rank: 6, name: '스트레이트', description: '연속된 숫자 5장', icon: '📊', color: 'from-indigo-400 to-purple-500' },
    { rank: 7, name: '트리플', description: '같은 숫자 3장', icon: '🎲', color: 'from-teal-400 to-cyan-500' },
    { rank: 8, name: '투페어', description: '페어 2개', icon: '👥', color: 'from-orange-400 to-amber-500' },
    { rank: 9, name: '원페어', description: '같은 숫자 2장', icon: '🎴', color: 'from-gray-400 to-slate-500' },
    { rank: 10, name: '하이카드', description: '가장 높은 카드', icon: '🃏', color: 'from-stone-400 to-neutral-500' }
  ];

  onMount(() => {
    // 실시간 통계 업데이트 시뮬레이션
    const interval = setInterval(() => {
      const newPlayers = currentStats.activePlayers + Math.floor(Math.random() * 10) - 5;
      const newGames = currentStats.todayGames + Math.floor(Math.random() * 5);
      const newPot = currentStats.averagePot + Math.floor(Math.random() * 1000) - 500;
      
      currentStats.activePlayers = Math.max(1000, newPlayers);
      currentStats.todayGames = newGames;
      currentStats.averagePot = Math.max(30000, newPot);
      
      // 애니메이션 적용
      animatedPlayers.set(currentStats.activePlayers);
      animatedGames.set(currentStats.todayGames);
      animatedPot.set(currentStats.averagePot);
    }, 3000);

    return () => clearInterval(interval);
  });

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(Math.floor(amount));
  }

  function toggleRules() {
    showRules = !showRules;
    showStrategy = false;
    showHandRanking = false;
  }

  function toggleStrategy() {
    showStrategy = !showStrategy;
    showRules = false;
    showHandRanking = false;
  }

  function toggleHandRanking() {
    showHandRanking = !showHandRanking;
    showRules = false;
    showStrategy = false;
  }

  function updateBetAmount(value) {
    betAmount = parseInt(value);
  }

  function quickBet(amount) {
    betAmount = amount;
  }

  function handleAction(action) {
    console.log(`Action: ${action}, Amount: ${betAmount}`);
    // 실제 게임 로직은 여기에 구현
  }

</script>

<svelte:head>
  <title>텍사스 홀덤 포커 - 럭키메시 카지노</title>
  <meta name="description" content="흥미진진한 텍사스 홀덤 포커 게임을 즐겨보세요." />
</svelte:head>

<style>
  /* 커스텀 슬라이더 스타일 */
  input[type="range"].slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }

  input[type="range"].slider::-webkit-slider-track {
    background: linear-gradient(to right, #f9a8d4, #c084fc);
    height: 12px;
    border-radius: 6px;
  }

  input[type="range"].slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f9a8d4, #c084fc);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(192, 132, 252, 0.4);
    transition: all 0.2s ease;
  }

  input[type="range"].slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 16px rgba(192, 132, 252, 0.6);
  }

  input[type="range"].slider::-moz-range-track {
    background: linear-gradient(to right, #f9a8d4, #c084fc);
    height: 12px;
    border-radius: 6px;
  }

  input[type="range"].slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f9a8d4, #c084fc);
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 12px rgba(192, 132, 252, 0.4);
    transition: all 0.2s ease;
  }

  input[type="range"].slider::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 16px rgba(192, 132, 252, 0.6);
  }

  /* 애니메이션 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  .animate-slide-in {
    animation: slideIn 0.5s ease-out;
  }

  /* 숫자 애니메이션을 위한 tabular-nums */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }

  /* 호버 효과 */
  .hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
</style>

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
          <div class="flex flex-wrap gap-2">
            <button
              on:click={toggleHandRanking}
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all text-black font-medium hover:scale-105 transform"
            >
              🏆 핸드 랭킹
            </button>
            <button
              on:click={toggleRules}
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all text-black font-medium hover:scale-105 transform"
            >
              � 게임  규칙
            </button>
            <button
              on:click={toggleStrategy}
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all text-black font-medium hover:scale-105 transform"
            >
              💡 전략 가이드
            </button>
            <button
              on:click={() => {}}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black hover:scale-105 transform"
              title="설정"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 실시간 통계 바 (애니메이션 적용) -->
  <div class="bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm py-4 border-b border-white/30">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-wrap justify-center md:justify-between items-center gap-6 text-sm">
        <div class="flex items-center space-x-2 transition-all hover:scale-105">
          <span class="text-green-500 animate-pulse">🟢</span>
          <span class="text-gray-700">현재 플레이어: <strong class="text-primary-soft-purple font-bold tabular-nums">{Math.floor($animatedPlayers).toLocaleString()}명</strong></span>
        </div>
        <div class="flex items-center space-x-2 transition-all hover:scale-105">
          <span class="text-blue-500">📊</span>
          <span class="text-gray-700">오늘 게임 수: <strong class="text-primary-soft-blue font-bold tabular-nums">{Math.floor($animatedGames).toLocaleString()}게임</strong></span>
        </div>
        <div class="flex items-center space-x-2 transition-all hover:scale-105">
          <span class="text-yellow-500">💰</span>
          <span class="text-gray-700">평균 팟: <strong class="text-primary-soft-peach font-bold tabular-nums">{formatCurrency($animatedPot)}</strong></span>
        </div>
        <div class="flex items-center space-x-2 transition-all hover:scale-105">
          <span class="text-orange-500">🏆</span>
          <span class="text-gray-700">최고 상금: <strong class="text-accent-coral font-bold tabular-nums">{formatCurrency($animatedMaxWin)}</strong></span>
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
        <!-- 게임 정보 카드 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center pastel-gradient-text">🎮 게임 정보</h3>
           <div class="space-y-3 text-sm text-black">
              <div class="flex justify-between items-center p-2 bg-gradient-to-r from-primary-soft-mint/20 to-primary-soft-sky/20 rounded-lg">
                <span class="text-gray-700">게임 상태:</span>
                <span class="font-bold text-primary-soft-mint">베팅 중</span>
              </div>
              <div class="flex justify-between items-center p-2 bg-gradient-to-r from-primary-soft-peach/20 to-primary-soft-pink/20 rounded-lg">
                <span class="text-gray-700">현재 팟:</span>
                <span class="font-bold text-primary-soft-peach tabular-nums">{formatCurrency(currentPot)}</span>
              </div>
              <div class="flex justify-between items-center p-2 bg-gradient-to-r from-primary-soft-purple/20 to-primary-soft-blue/20 rounded-lg">
                <span class="text-gray-700">내 칩:</span>
                <span class="font-bold text-primary-soft-purple tabular-nums">{formatCurrency(10000)}</span>
              </div>
            </div>
        </PastelCard>
        
        <!-- 내 핸드 카드 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center pastel-gradient-text">🃏 내 핸드</h3>
          <div class="flex justify-center space-x-2 mb-3">
            <div class="transform hover:scale-110 transition-transform duration-200">
              <EnhancedPlayingCard suit="spades" rank="A" size="medium" />
            </div>
            <div class="transform hover:scale-110 transition-transform duration-200">
              <EnhancedPlayingCard suit="hearts" rank="K" size="medium" />
            </div>
          </div>
          <div class="text-center">
            <button 
              on:click={toggleHandRanking}
              class="text-xs text-primary-soft-purple hover:text-primary-soft-pink transition-colors underline"
            >
              핸드 랭킹 보기
            </button>
          </div>
        </PastelCard>

        <!-- 베팅 컨트롤 카드 -->
        <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center pastel-gradient-text">💰 베팅</h3>
            
            <!-- 베팅 금액 슬라이더 -->
            <div class="mb-4">
                <label for="bet-amount" class="block text-sm font-medium text-gray-700 mb-2">베팅 금액</label>
                <input 
                  type="range" 
                  id="bet-amount" 
                  min="1000" 
                  max="200000" 
                  step="1000"
                  bind:value={betAmount}
                  on:input={(e) => updateBetAmount(e.target.value)}
                  class="w-full h-3 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple rounded-lg appearance-none cursor-pointer slider"
                >
                <div class="text-center mt-3">
                  <span class="text-2xl font-bold pastel-gradient-text tabular-nums">{formatCurrency(betAmount)}</span>
                </div>
            </div>

            <!-- 빠른 베팅 버튼 -->
            <div class="grid grid-cols-4 gap-2 mb-4">
              <button 
                on:click={() => quickBet(1000)}
                class="px-2 py-1 text-xs bg-gradient-to-r from-primary-soft-mint/30 to-primary-soft-sky/30 hover:from-primary-soft-mint/50 hover:to-primary-soft-sky/50 rounded-lg transition-all font-semibold"
              >
                1천
              </button>
              <button 
                on:click={() => quickBet(10000)}
                class="px-2 py-1 text-xs bg-gradient-to-r from-primary-soft-blue/30 to-primary-soft-purple/30 hover:from-primary-soft-blue/50 hover:to-primary-soft-purple/50 rounded-lg transition-all font-semibold"
              >
                1만
              </button>
              <button 
                on:click={() => quickBet(50000)}
                class="px-2 py-1 text-xs bg-gradient-to-r from-primary-soft-peach/30 to-primary-soft-pink/30 hover:from-primary-soft-peach/50 hover:to-primary-soft-pink/50 rounded-lg transition-all font-semibold"
              >
                5만
              </button>
              <button 
                on:click={() => quickBet(200000)}
                class="px-2 py-1 text-xs bg-gradient-to-r from-accent-coral/30 to-primary-soft-pink/30 hover:from-accent-coral/50 hover:to-primary-soft-pink/50 rounded-lg transition-all font-semibold"
              >
                MAX
              </button>
            </div>
            
            <!-- 액션 버튼 -->
            <div class="grid grid-cols-2 gap-2">
                <PastelButton variant="secondary" on:click={() => handleAction('fold')}>
                  🚫 폴드
                </PastelButton>
                <PastelButton variant="primary" on:click={() => handleAction('check')}>
                  ✅ 체크
                </PastelButton>
                <PastelButton variant="accent" on:click={() => handleAction('raise')}>
                  ⬆️ 레이즈
                </PastelButton>
                <PastelButton variant="primary" on:click={() => handleAction('call')}>
                  📞 콜
                </PastelButton>
            </div>
        </PastelCard>

      </div>
    </div>
  </div>

  <!-- 핸드 랭킹 섹션 -->
  {#if showHandRanking}
    <div class="max-w-7xl mx-auto px-4 py-8">
      <PastelCard padding="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold font-playfair pastel-gradient-text">🏆 포커 핸드 랭킹</h2>
          <button 
            on:click={toggleHandRanking}
            class="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {#each handRankings as hand}
            <div class="group relative overflow-hidden rounded-xl bg-gradient-to-br {hand.color} p-4 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div class="absolute top-0 right-0 text-6xl opacity-10 transform translate-x-2 -translate-y-2">
                {hand.icon}
              </div>
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-3xl">{hand.icon}</span>
                  <span class="text-sm font-bold bg-white/20 px-2 py-1 rounded-full">#{hand.rank}</span>
                </div>
                <h3 class="font-bold text-lg mb-1">{hand.name}</h3>
                <p class="text-xs opacity-90">{hand.description}</p>
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-8 p-6 bg-gradient-to-r from-primary-soft-sky/20 to-primary-soft-mint/20 rounded-lg">
          <h4 class="font-bold text-lg mb-3 text-primary-soft-purple">💡 핸드 랭킹 팁</h4>
          <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p class="mb-2"><strong>높은 핸드일수록 강력:</strong> 로얄 플러시가 가장 강하고 하이카드가 가장 약합니다.</p>
              <p><strong>확률 고려:</strong> 높은 핸드일수록 나올 확률이 낮습니다.</p>
            </div>
            <div>
              <p class="mb-2"><strong>같은 핸드 비교:</strong> 같은 종류의 핸드면 카드 숫자로 비교합니다.</p>
              <p><strong>키커 중요:</strong> 같은 페어나 트리플이면 키커(나머지 카드)로 승부가 결정됩니다.</p>
            </div>
          </div>
        </div>
      </PastelCard>
    </div>
  {/if}

  <!-- 게임 규칙 섹션 -->
  {#if showRules}
    <div class="max-w-7xl mx-auto px-4 py-8">
      <PastelCard padding="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold font-playfair pastel-gradient-text">📖 포커 게임 규칙</h2>
          <button 
            on:click={toggleRules}
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="text-4xl mb-3">1️⃣</div>
            <h3 class="text-xl font-bold text-primary-soft-purple mb-3">기본 규칙</h3>
            <ul class="text-left space-y-2 text-gray-700 text-sm">
              <li>• 각 플레이어는 2장의 홀 카드를 받습니다</li>
              <li>• 5장의 커뮤니티 카드가 테이블에 공개됩니다</li>
              <li>• 7장 중 최고의 5장으로 핸드를 만듭니다</li>
              <li>• 최고 핸드를 가진 플레이어가 팟을 가져갑니다</li>
            </ul>
          </div>
          
          <div class="text-center">
            <div class="text-4xl mb-3">2️⃣</div>
            <h3 class="text-xl font-bold text-primary-soft-peach mb-3">베팅 라운드</h3>
            <ul class="text-left space-y-2 text-gray-700 text-sm">
              <li>• <strong>프리플롭:</strong> 홀 카드 받은 후</li>
              <li>• <strong>플롭:</strong> 첫 3장 공개 후</li>
              <li>• <strong>턴:</strong> 4번째 카드 공개 후</li>
              <li>• <strong>리버:</strong> 마지막 카드 공개 후</li>
            </ul>
          </div>
          
          <div class="text-center">
            <div class="text-4xl mb-3">3️⃣</div>
            <h3 class="text-xl font-bold text-primary-soft-mint mb-3">핸드 랭킹</h3>
            <ul class="text-left space-y-1 text-gray-700 text-xs">
              <li>1. 로얄 플러시</li>
              <li>2. 스트레이트 플러시</li>
              <li>3. 포카드</li>
              <li>4. 풀하우스</li>
              <li>5. 플러시</li>
              <li>6. 스트레이트</li>
              <li>7. 트리플</li>
              <li>8. 투페어</li>
              <li>9. 원페어</li>
              <li>10. 하이카드</li>
            </ul>
          </div>
        </div>

        <div class="mt-8 p-6 bg-gradient-to-r from-primary-soft-sky/20 to-primary-soft-mint/20 rounded-lg">
          <h4 class="font-bold text-lg mb-3 text-primary-soft-purple">💡 중요한 팁</h4>
          <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p class="mb-2"><strong>포지션의 중요성:</strong> 늦은 포지션일수록 더 많은 정보를 가지고 결정할 수 있습니다.</p>
              <p><strong>팟 오즈:</strong> 베팅 금액 대비 팟 크기를 계산하여 콜/폴드를 결정하세요.</p>
            </div>
            <div>
              <p class="mb-2"><strong>블러핑:</strong> 적절한 타이밍에 블러핑을 사용하되 과도하게 사용하지 마세요.</p>
              <p><strong>뱅크롤 관리:</strong> 자신의 자금 한도 내에서 플레이하는 것이 중요합니다.</p>
            </div>
          </div>
        </div>
      </PastelCard>
    </div>
  {/if}

  <!-- 전략 가이드 섹션 -->
  {#if showStrategy}
    <div class="max-w-7xl mx-auto px-4 py-8">
      <PastelCard padding="p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-3xl font-bold font-playfair pastel-gradient-text">💡 포커 전략 가이드</h2>
          <button 
            on:click={toggleStrategy}
            class="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-bold text-primary-soft-purple mb-4">🌱 초보자 전략</h3>
            <div class="space-y-4">
              <div class="p-4 bg-gradient-to-r from-primary-soft-pink/20 to-primary-soft-peach/20 rounded-lg">
                <h4 class="font-semibold mb-2 text-primary-soft-purple">타이트-어그레시브 플레이</h4>
                <p class="text-sm text-gray-700">좋은 핸드만 플레이하되, 플레이할 때는 적극적으로 베팅하세요.</p>
              </div>
              
              <div class="p-4 bg-gradient-to-r from-primary-soft-mint/20 to-primary-soft-cream/20 rounded-lg">
                <h4 class="font-semibold mb-2 text-primary-soft-mint">포지션 활용</h4>
                <p class="text-sm text-gray-700">늦은 포지션에서는 더 넓은 범위의 핸드를 플레이할 수 있습니다.</p>
              </div>
              
              <div class="p-4 bg-gradient-to-r from-primary-soft-sky/20 to-primary-soft-blue/20 rounded-lg">
                <h4 class="font-semibold mb-2 text-primary-soft-blue">상대방 관찰</h4>
                <p class="text-sm text-gray-700">상대방의 베팅 패턴과 행동을 주의 깊게 관찰하세요.</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 class="text-xl font-bold text-primary-soft-peach mb-4">🎯 고급 전략</h3>
            <div class="space-y-4">
              <div class="p-4 bg-gradient-to-r from-primary-soft-purple/20 to-primary-soft-pink/20 rounded-lg">
                <h4 class="font-semibold mb-2 text-primary-soft-purple">블러핑 기술</h4>
                <p class="text-sm text-gray-700">상황에 맞는 블러핑으로 상대방을 혼란시키세요. 하지만 과도한 블러핑은 금물입니다.</p>
              </div>
              
              <div class="p-4 bg-gradient-to-r from-accent-coral/20 to-primary-soft-peach/20 rounded-lg">
                <h4 class="font-semibold mb-2 text-accent-coral">팟 오즈 계산</h4>
                <p class="text-sm text-gray-700">베팅 금액 대비 팟 크기를 계산하여 수학적으로 올바른 결정을 내리세요.</p>
              </div>
              
              <div class="p-4 bg-gradient-to-r from-primary-soft-mint/20 to-primary-soft-sky/20 rounded-lg">
                <h4 class="font-semibold mb-2 text-primary-soft-mint">이미지 관리</h4>
                <p class="text-sm text-gray-700">자신의 플레이 스타일을 상황에 맞게 조절하여 상대방을 혼란시키세요.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 p-6 bg-gradient-to-r from-accent-coral/10 to-primary-soft-pink/10 rounded-lg border border-accent-coral/20">
          <h4 class="font-bold text-lg mb-3 text-accent-coral">⚠️ 주의사항</h4>
          <div class="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <p class="font-semibold mb-1">감정 조절</p>
              <p>틸트(감정적 플레이)를 피하고 항상 냉정함을 유지하세요.</p>
            </div>
            <div>
              <p class="font-semibold mb-1">자금 관리</p>
              <p>전체 자금의 5% 이상을 한 게임에 투자하지 마세요.</p>
            </div>
            <div>
              <p class="font-semibold mb-1">시간 관리</p>
              <p>장시간 플레이는 판단력을 흐릴 수 있으니 적절한 휴식을 취하세요.</p>
            </div>
          </div>
        </div>
      </PastelCard>
    </div>
  {/if}
</div>
