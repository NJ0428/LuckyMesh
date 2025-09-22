<script>
  import { onMount } from 'svelte';
  import { rouletteStore, rouletteActions, numberColors } from '$lib/stores/roulette.js';
  import RouletteWheel from '$lib/components/RouletteWheel.svelte';
  import RouletteBettingTable from '$lib/components/RouletteBettingTable.svelte';
  import RouletteStatsDashboard from '$lib/components/RouletteStatsDashboard.svelte';
  import BettingPatternAnalysis from '$lib/components/BettingPatternAnalysis.svelte';
  import GameHistoryVisualization from '$lib/components/GameHistoryVisualization.svelte';
  import StrategyGuide from '$lib/components/StrategyGuide.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';

  let showStatsDashboard = false;
  let showPatternAnalysis = false;
  let showHistoryViz = false;
  let showStrategyGuide = false;

  let gameState;
  let selectedBetAmount = 100;
  let showRules = false;

  $: gameState = $rouletteStore;

  const betOptions = [10, 25, 50, 100, 250, 500];

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function getTotalBets() {
    return Object.values(gameState.bets).reduce((sum, bet) => sum + bet.amount, 0);
  }

  function getColorName(color) {
    switch(color) {
      case 'red': return '빨강';
      case 'black': return '검정';
      case 'green': return '초록';
      default: return '';
    }
  }
</script>

<svelte:head>
  <title>룰렛 게임 - LuckyMesh Casino</title>
  <meta name="description" content="실시간 룰렛 게임을 플레이하세요. 다양한 베팅 옵션과 높은 배당률로 카지노의 여왕을 경험해보세요!" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pastel-mint via-pastel-cream to-pastel-sky">
  <!-- 게임 헤더 -->
  <div class="bg-gradient-to-r from-primary-soft-mint to-primary-soft-peach py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center text-black">
        <div class="flex items-center space-x-4">
          <div class="text-4xl">🎡</div>
          <div>
            <h1 class="text-3xl font-bold font-playfair">룰렛</h1>
            <p class="text-sm opacity-90">Roulette Game</p>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold">{formatCurrency(gameState.balance)}</div>
            <div class="text-sm opacity-90">잔고</div>
          </div>

          <button
            on:click={() => showRules = !showRules}
            class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all text-black"
          >
            게임 규칙
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 게임 메인 영역 -->
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- 룰렛 휠 -->
      <div>
        <PastelCard gradient={true} gradientFrom="pastel-cream" gradientTo="pastel-mint" padding="p-6">
          <!-- 게임 상태 메시지 -->
          <div class="text-center mb-6">
            <div class="bg-gradient-to-r from-primary-soft-purple to-primary-soft-pink text-black px-6 py-3 rounded-full inline-block">
              <span class="font-bold">{gameState.message}</span>
            </div>
          </div>

          <!-- 룰렛 휠 -->
          <div class="mb-6">
            <RouletteWheel
              rotation={gameState.wheelRotation}
              isSpinning={gameState.isSpinning}
              spinDuration={gameState.spinDuration}
              winningNumber={gameState.winningNumber}
            />
          </div>

          <!-- 당첨 번호 표시 -->
          {#if gameState.winningNumber !== null}
            <div class="text-center mb-6">
              <div class="inline-flex items-center space-x-3 bg-white/20 rounded-lg px-4 py-2">
                <span class="text-lg font-semibold">당첨 번호:</span>
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black
                  {numberColors[gameState.winningNumber] === 'red' ? 'bg-red-500' :
                   numberColors[gameState.winningNumber] === 'black' ? 'bg-gray-800' : 'bg-green-500'}">
                  {gameState.winningNumber}
                </div>
                <span class="font-semibold">{getColorName(numberColors[gameState.winningNumber])}</span>
              </div>
            </div>
          {/if}

          <!-- 게임 컨트롤 -->
          <div class="flex flex-wrap justify-center gap-4">
            {#if gameState.gameState === 'betting'}
              <PastelButton
                variant="primary"
                on:click={rouletteActions.spin}
                disabled={getTotalBets() === 0}
              >
                스핀!
              </PastelButton>

              {#if getTotalBets() > 0}
                <PastelButton
                  variant="secondary"
                  on:click={rouletteActions.clearBets}
                >
                  베팅 취소
                </PastelButton>
              {/if}

            {:else if gameState.gameState === 'finished'}
              <PastelButton
                variant="primary"
                on:click={rouletteActions.newGame}
              >
                새 게임
              </PastelButton>
            {/if}
          </div>
        </PastelCard>
      </div>

      <!-- 베팅 테이블 -->
      <div>
        <PastelCard padding="p-6">
          <h3 class="text-xl font-bold mb-4 text-center text-black">베팅 테이블</h3>
          <RouletteBettingTable
            gameState={gameState.gameState}
            bets={gameState.bets}
            {selectedBetAmount}
          />
        </PastelCard>
      </div>
    </div>

    <!-- 기능 버튼들 -->
    <div class="flex flex-wrap justify-center gap-4 mt-6 mb-6">
      <PastelButton
        size="sm"
        variant={showStatsDashboard ? 'primary' : 'secondary'}
        on:click={() => showStatsDashboard = !showStatsDashboard}
      >
        통계 대시보드
      </PastelButton>

      <PastelButton
        size="sm"
        variant={showPatternAnalysis ? 'primary' : 'secondary'}
        on:click={() => showPatternAnalysis = !showPatternAnalysis}
      >
        베팅 패턴 분석
      </PastelButton>

      <PastelButton
        size="sm"
        variant={showHistoryViz ? 'primary' : 'secondary'}
        on:click={() => showHistoryViz = !showHistoryViz}
      >
        게임 히스토리
      </PastelButton>

      <PastelButton
        size="sm"
        variant={showStrategyGuide ? 'primary' : 'secondary'}
        on:click={() => showStrategyGuide = !showStrategyGuide}
      >
        전략 가이드
      </PastelButton>
    </div>

    <!-- 실시간 통계 대시보드 -->
    {#if showStatsDashboard}
      <div class="mb-6">
        <RouletteStatsDashboard
          gameHistory={gameState.history}
          currentBets={gameState.bets}
          isVisible={showStatsDashboard}
        />
      </div>
    {/if}

    <!-- 베팅 패턴 분석 -->
    {#if showPatternAnalysis}
      <div class="mb-6">
        <BettingPatternAnalysis
          gameHistory={gameState.history}
          currentBets={gameState.bets}
          onSuggestionApply={(suggestion) => {
            console.log('받은 제안:', suggestion);
            // 여기에 제안 적용 로직 추가
          }}
        />
      </div>
    {/if}

    <!-- 게임 히스토리 시각화 -->
    {#if showHistoryViz}
      <div class="mb-6">
        <GameHistoryVisualization
          gameHistory={gameState.history}
          gameType="roulette"
        />
      </div>
    {/if}

    <!-- 전략 가이드 -->
    {#if showStrategyGuide}
      <div class="mb-6">
        <StrategyGuide
          gameType="roulette"
          currentGameState={gameState}
          userLevel="beginner"
          isVisible={showStrategyGuide}
          on:applyStrategy={(event) => {
            console.log('전략 적용:', event.detail);
            // 여기에 전략 적용 로직 추가
          }}
        />
      </div>
    {/if}

    <!-- 사이드바 정보 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

      <!-- 베팅 금액 선택 -->
      <PastelCard>
        <h3 class="font-bold text-lg mb-4 text-center text-black">베팅 금액</h3>
        <div class="grid grid-cols-2 gap-2">
          {#each betOptions as amount}
            <button
              on:click={() => selectedBetAmount = amount}
              class="p-2 rounded-lg border-2 transition-all font-bold {selectedBetAmount === amount ? 'border-primary-soft-pink bg-primary-soft-pink text-black' : 'border-gray-300 hover:border-primary-soft-pink text-black'}"
            >
              {formatCurrency(amount)}
            </button>
          {/each}
        </div>
      </PastelCard>

      <!-- 현재 베팅 요약 -->
      {#if getTotalBets() > 0}
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">현재 베팅</h3>
          <div class="space-y-2 max-h-32 overflow-y-auto text-black">
            {#each Object.entries(gameState.bets) as [betKey, bet]}
              <div class="flex justify-between items-center text-sm">
                <span class="flex-1 truncate">
                  {bet.value ? `${bet.value} (직접)` :
                   bet.type === 'red' ? '빨강' :
                   bet.type === 'black' ? '검정' :
                   bet.type === 'even' ? '짝수' :
                   bet.type === 'odd' ? '홀수' :
                   bet.type === 'low' ? '1-18' :
                   bet.type === 'high' ? '19-36' :
                   bet.type === 'dozen1' ? '1-12' :
                   bet.type === 'dozen2' ? '13-24' :
                   bet.type === 'dozen3' ? '25-36' :
                   bet.type === 'column1' ? '세로줄1' :
                   bet.type === 'column2' ? '세로줄2' :
                   bet.type === 'column3' ? '세로줄3' :
                   bet.type}
                </span>
                <span class="font-bold">{formatCurrency(bet.amount)}</span>
              </div>
            {/each}
            <hr class="my-2">
            <div class="flex justify-between font-bold">
              <span>총 베팅</span>
              <span>{formatCurrency(getTotalBets())}</span>
            </div>
          </div>
        </PastelCard>
      {/if}

      <!-- 게임 기록 -->
      <PastelCard>
        <h3 class="font-bold text-lg mb-4 text-center text-black">최근 결과</h3>
        <div class="space-y-2 text-black">
          {#each gameState.history.slice(0, 10) as game, index}
            <div class="flex justify-between items-center text-sm py-1 border-b border-gray-200">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black
                  {game.winningColor === 'red' ? 'bg-red-500' :
                   game.winningColor === 'black' ? 'bg-gray-800' : 'bg-green-500'}">
                  {game.winningNumber}
                </div>
                <span class="text-xs">{getColorName(game.winningColor)}</span>
              </div>
              <span class="{game.netResult > 0 ? 'text-green-600' : game.netResult < 0 ? 'text-red-600' : 'text-gray-600'} text-xs font-semibold">
                {game.netResult > 0 ? '+' : ''}{formatCurrency(game.netResult)}
              </span>
            </div>
          {/each}
        </div>
      </PastelCard>
    </div>
  </div>

  <!-- 게임 규칙 모달 -->
  {#if showRules}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showRules = false}>
      <div class="bg-white rounded-xl p-6 max-w-3xl max-h-[80vh] overflow-y-auto text-black" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">룰렛 게임 규칙</h2>
          <button on:click={() => showRules = false} class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <h3 class="font-bold mb-2">게임 목표</h3>
            <p>룰렛 휠이 돌아가서 공이 멈출 번호나 색상을 예측하는 게임입니다.</p>
          </div>

          <div>
            <h3 class="font-bold mb-2">베팅 종류</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold">인사이드 베팅</h4>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li>스트레이트 업 (단일 번호): 35:1</li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold">아웃사이드 베팅</h4>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li>빨강/검정, 홀수/짝수, 1-18/19-36: 1:1</li>
                  <li>더즌 (1-12, 13-24, 25-36): 2:1</li>
                  <li>컬럼 (세로줄): 2:1</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 class="font-bold mb-2">하우스 엣지</h3>
            <p>유럽식 룰렛 (0 하나만 존재): 2.7%</p>
          </div>

          <div>
            <h3 class="font-bold mb-2">게임 방법</h3>
            <ol class="list-decimal list-inside space-y-1">
              <li>베팅 금액을 선택합니다</li>
              <li>베팅하고 싶은 번호나 영역을 클릭합니다</li>
              <li>'스핀!' 버튼을 클릭하여 룰렛을 돌립니다</li>
              <li>공이 멈춘 위치에 따라 당첨이 결정됩니다</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
