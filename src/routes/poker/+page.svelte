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
