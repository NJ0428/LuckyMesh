<script>
  import { onMount } from 'svelte';
  import { baccaratStore, baccaratActions } from '$lib/stores/baccarat.js';
  import PlayingCard from '$lib/components/PlayingCard.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';

  let gameState;
  let selectedBetAmount = 100;
  let showRules = false;

  $: gameState = $baccaratStore;

  const betOptions = [10, 25, 50, 100, 250, 500];
  const betTypes = [
    { key: 'player', label: '플레이어', payout: '1:1', color: 'from-blue-500 to-blue-600' },
    { key: 'banker', label: '뱅커', payout: '1:1 (-5%)', color: 'from-red-500 to-red-600' },
    { key: 'tie', label: '타이', payout: '8:1', color: 'from-green-500 to-green-600' },
    { key: 'playerPair', label: 'P 페어', payout: '11:1', color: 'from-purple-500 to-purple-600' },
    { key: 'bankerPair', label: 'B 페어', payout: '11:1', color: 'from-orange-500 to-orange-600' }
  ];

  function placeBet(betType) {
    if (gameState.balance >= selectedBetAmount) {
      baccaratActions.placeBet(betType, selectedBetAmount);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<svelte:head>
  <title>바카라 게임 - LuckyMesh Casino</title>
  <meta name="description" content="실시간 바카라 게임을 플레이하세요. 플레이어, 뱅커, 타이 베팅과 사이드 베팅으로 더 큰 재미를 경험해보세요." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pastel-mint via-pastel-cream to-pastel-sky">
  <!-- 게임 헤더 -->
  <div class="bg-gradient-to-r from-primary-soft-mint to-primary-soft-peach py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center text-black">
        <div class="flex items-center space-x-4">
          <div class="text-4xl">🎴</div>
          <div>
            <h1 class="text-3xl font-bold font-playfair">바카라</h1>
            <p class="text-sm opacity-90">Baccarat Game</p>
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
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <!-- 게임 테이블 -->
      <div class="lg:col-span-3">
        <PastelCard gradient={true} gradientFrom="pastel-cream" gradientTo="pastel-mint" padding="p-6">
          <!-- 게임 상태 메시지 -->
          <div class="text-center mb-6">
            <div class="bg-gradient-to-r from-primary-soft-purple to-primary-soft-pink text-black px-6 py-3 rounded-full inline-block">
              <span class="font-bold">{gameState.message}</span>
            </div>
          </div>

          <!-- 카드 영역 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <!-- 플레이어 영역 -->
            <div class="text-center">
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-black py-3 px-6 rounded-lg mb-4 font-bold">
                플레이어 {gameState.sideBets.playerPair ? '(페어!)' : ''}
              </div>

              <div class="flex justify-center space-x-2 mb-4 min-h-[120px] items-end">
                {#each gameState.playerHand as card, index}
                  <div class="animate-in" style="animation-delay: {index * 200}ms;">
                    <PlayingCard suit={card.suit} value={card.value} size="normal" />
                  </div>
                {/each}
              </div>

              <div class="text-3xl font-bold text-blue-600 mb-2">{gameState.playerScore}</div>
              {#if gameState.winner === 'player'}
                <div class="text-green-600 font-bold text-lg">🏆 승리!</div>
              {/if}
            </div>

            <!-- 뱅커 영역 -->
            <div class="text-center">
              <div class="bg-gradient-to-r from-red-500 to-red-600 text-black py-3 px-6 rounded-lg mb-4 font-bold">
                뱅커 {gameState.sideBets.bankerPair ? '(페어!)' : ''}
              </div>

              <div class="flex justify-center space-x-2 mb-4 min-h-[120px] items-end">
                {#each gameState.bankerHand as card, index}
                  <div class="animate-in" style="animation-delay: {(index + 2) * 200}ms;">
                    <PlayingCard suit={card.suit} value={card.value} size="normal" />
                  </div>
                {/each}
              </div>

              <div class="text-3xl font-bold text-red-600 mb-2">{gameState.bankerScore}</div>
              {#if gameState.winner === 'banker'}
                <div class="text-green-600 font-bold text-lg">🏆 승리!</div>
              {/if}
            </div>
          </div>

          <!-- 타이 결과 -->
          {#if gameState.winner === 'tie'}
            <div class="text-center mb-6">
              <div class="bg-gradient-to-r from-green-500 to-green-600 text-black py-3 px-6 rounded-lg inline-block font-bold text-lg">
                🤝 무승부!
              </div>
            </div>
          {/if}

          <!-- 베팅 영역 -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {#each betTypes as betType}
              <button
                on:click={() => placeBet(betType.key)}
                disabled={gameState.gameState !== 'betting' || gameState.balance < selectedBetAmount}
                class="bg-gradient-to-r {betType.color} text-black p-4 rounded-lg font-bold transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                <div class="text-sm mb-1">{betType.label}</div>
                <div class="text-xs opacity-90">{betType.payout}</div>

                {#if gameState.bets[betType.key] > 0}
                  <div class="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold">
                    {formatCurrency(gameState.bets[betType.key])}
                  </div>
                {/if}
              </button>
            {/each}
          </div>

          <!-- 게임 컨트롤 -->
          <div class="flex flex-wrap justify-center gap-4">
            {#if gameState.gameState === 'betting'}
              <PastelButton
                variant="primary"
                on:click={baccaratActions.deal}
                disabled={Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0) === 0}
              >
                딜 시작
              </PastelButton>

              <PastelButton
                variant="secondary"
                on:click={baccaratActions.clearBets}
                disabled={Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0) === 0}
              >
                베팅 취소
              </PastelButton>
            {:else if gameState.gameState === 'finished'}
              <PastelButton
                variant="primary"
                on:click={baccaratActions.newGame}
              >
                새 게임
              </PastelButton>
            {/if}
          </div>
        </PastelCard>
      </div>

      <!-- 사이드바 -->
      <div class="space-y-6">
        <!-- 베팅 금액 선택 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">베팅 금액</h3>
          <div class="grid grid-cols-2 gap-2">
            {#each betOptions as amount}
              <button
                on:click={() => selectedBetAmount = amount}
                class="p-2 rounded-lg border-2 transition-all font-bold {selectedBetAmount === amount ? 'border-primary-soft-pink bg-primary-soft-pink text-white' : 'border-gray-300 hover:border-primary-soft-pink text-black'}"
              >
                {formatCurrency(amount)}
              </button>
            {/each}
          </div>
        </PastelCard>

        <!-- 게임 통계 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">게임 기록</h3>
          <div class="space-y-2 text-black">
            {#each gameState.history.slice(0, 10) as game, index}
              <div class="flex justify-between items-center text-sm py-1 border-b border-gray-200">
                <span class="text-gray-600">#{gameState.history.length - index}</span>
                <div class="flex space-x-1">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold {
                    game.winner === 'player' ? 'bg-blue-500 text-white' :
                    game.winner === 'banker' ? 'bg-red-500 text-white' :
                    'bg-green-500 text-white'
                  }">
                    {game.winner === 'player' ? 'P' : game.winner === 'banker' ? 'B' : 'T'}
                  </span>
                  {#if game.sideBets.playerPair}<span class="text-blue-500">🎯</span>{/if}
                  {#if game.sideBets.bankerPair}<span class="text-red-500">🎯</span>{/if}
                </div>
              </div>
            {/each}
          </div>
        </PastelCard>

        <!-- 베팅 요약 -->
        {#if Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0) > 0}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center text-black">현재 베팅</h3>
            <div class="space-y-2 text-black">
              {#each betTypes as betType}
                {#if gameState.bets[betType.key] > 0}
                  <div class="flex justify-between">
                    <span>{betType.label}</span>
                    <span class="font-bold">{formatCurrency(gameState.bets[betType.key])}</span>
                  </div>
                {/if}
              {/each}
              <hr>
              <div class="flex justify-between font-bold">
                <span>총 베팅</span>
                <span>{formatCurrency(Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0))}</span>
              </div>
            </div>
          </PastelCard>
        {/if}
      </div>
    </div>
  </div>

  <!-- 게임 규칙 모달 -->
  {#if showRules}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showRules = false}>
      <div class="bg-white rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto text-black" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">바카라 게임 규칙</h2>
          <button on:click={() => showRules = false} class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <h3 class="font-bold mb-2">게임 목표</h3>
            <p>플레이어와 뱅커 중 어느 쪽이 9에 더 가까운 점수를 얻을지 예측하는 게임입니다.</p>
          </div>

          <div>
            <h3 class="font-bold mb-2">카드 값</h3>
            <ul class="list-disc list-inside space-y-1">
              <li>A = 1점</li>
              <li>2~9 = 숫자 그대로</li>
              <li>10, J, Q, K = 0점</li>
            </ul>
            <p class="mt-2 text-gray-600">두 카드의 합에서 일의 자리만 계산합니다. (예: 7+6=13 → 3점)</p>
          </div>

          <div>
            <h3 class="font-bold mb-2">베팅 종류</h3>
            <ul class="space-y-1">
              <li><strong>플레이어:</strong> 1:1 배당</li>
              <li><strong>뱅커:</strong> 1:1 배당 (5% 수수료)</li>
              <li><strong>타이:</strong> 8:1 배당</li>
              <li><strong>페어 베팅:</strong> 11:1 배당</li>
            </ul>
          </div>

          <div>
            <h3 class="font-bold mb-2">3번째 카드 규칙</h3>
            <p>처음 2장의 합이 8 또는 9면 즉시 게임 종료 (내추럴). 그 외의 경우 자동으로 3번째 카드 규칙이 적용됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>