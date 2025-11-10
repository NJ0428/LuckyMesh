<script>
  import { onMount } from 'svelte';
  import { baccaratStore, baccaratActions } from '$lib/stores/baccarat.js';
  import { soundActions } from '$lib/stores/soundSystem.js';
  import EnhancedPlayingCard from '$lib/components/EnhancedPlayingCard.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';
  import BaccaratRoadmap from '$lib/components/BaccaratRoadmap.svelte';
  import BaccaratStats from '$lib/components/BaccaratStats.svelte';
  import BettingTimer from '$lib/components/BettingTimer.svelte';
  import ShuffleAnimation from '$lib/components/ShuffleAnimation.svelte';
  import CoinFountain from '$lib/components/CoinFountain.svelte';

  let gameState;
  let selectedBetAmount = 100;
  let showRules = false;
  let showRoadmap = true;
  let showStats = true;
  let showShuffle = false;
  let showCoinFountain = false;
  let winAmount = 0;
  let dealingInProgress = false;
  let showFavoritesModal = false;
  let newFavoriteName = '';
  let useBettingTimer = false;

  $: gameState = $baccaratStore;

  const betOptions = [10, 25, 50, 100, 250, 500];
  const betTypes = [
    { key: 'player', label: '플레이어', payout: '1:1', color: 'from-blue-500 to-blue-600' },
    { key: 'banker', label: '뱅커', payout: '1:1 (-5%)', color: 'from-red-500 to-red-600' },
    { key: 'tie', label: '타이', payout: '8:1', color: 'from-green-500 to-green-600' }
  ];

  const sideBetTypes = [
    { key: 'playerPair', label: 'P 페어', payout: '11:1', color: 'from-purple-500 to-purple-600' },
    { key: 'bankerPair', label: 'B 페어', payout: '11:1', color: 'from-orange-500 to-orange-600' },
    { key: 'bigSmall', label: 'Big/Small', payout: '0.54:1 / 1.5:1', color: 'from-yellow-500 to-yellow-600' },
    { key: 'lucky6', label: 'Lucky 6', payout: '최대 20:1', color: 'from-pink-500 to-pink-600' },
    { key: 'dragonBonus', label: 'Dragon Bonus', payout: '최대 30:1', color: 'from-indigo-500 to-indigo-600' }
  ];

  function placeBet(betType) {
    if (gameState.balance >= selectedBetAmount) {
      baccaratActions.placeBet(betType, selectedBetAmount);
      soundActions?.playChipBet();
    }
  }

  function dealCards() {
    showShuffle = true;
    setTimeout(() => {
      showShuffle = false;
      baccaratActions.deal();
      dealingInProgress = true;
      soundActions?.playCardDeal();

      setTimeout(() => {
        dealingInProgress = false;
      }, 2000);
    }, 1500);
  }

  // 게임 결과 처리
  let processedGameId = null;
  $: if (gameState.gameState === 'finished' && gameState.history.length > 0) {
    const currentGameId = gameState.history[0]?.timestamp;
    if (currentGameId && currentGameId !== processedGameId) {
      processedGameId = currentGameId;
      setTimeout(() => {
        handleGameFinished();
      }, 1000);
    }
  }

  function handleGameFinished() {
    const totalBets = Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0);
    const winnings = gameState.history[0]?.winnings || 0;

    if (winnings > totalBets) {
      winAmount = winnings;
      showCoinFountain = true;
      soundActions?.playWin();

      setTimeout(() => {
        showCoinFountain = false;
      }, 3000);
    } else if (winnings < totalBets) {
      soundActions?.playLose();
    }
  }

  function saveFavorite() {
    if (newFavoriteName.trim()) {
      baccaratActions.saveFavoriteBet(newFavoriteName.trim());
      newFavoriteName = '';
      showFavoritesModal = false;
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
  <title>바카라 게임 - 럭키메시 카지노</title>
  <meta name="description" content="실시간 바카라 게임을 플레이하세요. 플레이어, 뱅커, 타이 베팅과 사이드 베팅으로 더 큰 재미를 경험해보세요." />
</svelte:head>

<!-- 애니메이션 컴포넌트 -->
<CoinFountain bind:show={showCoinFountain} {winAmount} />
<ShuffleAnimation bind:show={showShuffle} />

<div class="min-h-screen bg-gradient-to-br from-pastel-mint via-pastel-cream to-pastel-sky">
  <!-- 게임 헤더 -->
  <div class="bg-gradient-to-r from-primary-soft-mint to-primary-soft-peach py-6">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center text-black">
        <div class="flex items-center space-x-4">
          <div class="text-4xl">🎴</div>
          <div>
            <h1 class="text-3xl font-bold font-playfair">바카라</h1>
            <p class="text-sm opacity-90">Professional Baccarat</p>
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <div class="text-center">
            <div class="text-2xl font-bold">{formatCurrency(gameState.balance)}</div>
            <div class="text-sm opacity-90">잔고</div>
          </div>

          <div class="flex gap-2">
            <button
              on:click={() => showRoadmap = !showRoadmap}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="로드맵"
            >
              📊
            </button>

            <button
              on:click={() => showStats = !showStats}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="통계"
            >
              📈
            </button>

            <button
              on:click={() => useBettingTimer = !useBettingTimer}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black {useBettingTimer ? 'ring-2 ring-blue-500' : ''}"
              title="베팅 타이머"
            >
              ⏱️
            </button>

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
  </div>

  <!-- 메인 게임 영역 -->
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">

      <!-- 왼쪽 사이드바 (로드맵 & 통계) -->
      <div class="xl:col-span-1 space-y-4">
        {#if showRoadmap}
          <BaccaratRoadmap roadmaps={gameState.roadmaps} />
        {/if}

        {#if showStats}
          <BaccaratStats stats={gameState.stats} />
        {/if}
      </div>

      <!-- 게임 테이블 -->
      <div class="xl:col-span-2 space-y-4">
        <!-- 베팅 타이머 -->
        {#if useBettingTimer}
          <BettingTimer
            duration={gameState.bettingSystem.betTimer}
            active={gameState.gameState === 'betting'}
            onTimeUp={() => {
              if (Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0) > 0) {
                dealCards();
              }
            }}
          />
        {/if}

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
              <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg mb-4 font-bold">
                플레이어 {gameState.sideBets.playerPair ? '🎯 페어!' : ''}
              </div>

              <div class="flex justify-center space-x-2 mb-4 min-h-[140px] items-end">
                {#each gameState.playerHand as card, index}
                  <div style="animation-delay: {index * 300}ms;">
                    <EnhancedPlayingCard
                      suit={card.suit}
                      rank={card.value}
                      size="large"
                      isDealing={dealingInProgress}
                      dealDelay={index * 300}
                      isWinning={gameState.winner === 'player'}
                    />
                  </div>
                {/each}
              </div>

              <div class="text-4xl font-bold text-blue-600 mb-2">{gameState.playerScore}</div>
              {#if gameState.winner === 'player'}
                <div class="text-green-600 font-bold text-2xl animate-bounce">🏆 승리!</div>
              {/if}
            </div>

            <!-- 뱅커 영역 -->
            <div class="text-center">
              <div class="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg mb-4 font-bold">
                뱅커 {gameState.sideBets.bankerPair ? '🎯 페어!' : ''}
              </div>

              <div class="flex justify-center space-x-2 mb-4 min-h-[140px] items-end">
                {#each gameState.bankerHand as card, index}
                  <div style="animation-delay: {(index + 2) * 300}ms;">
                    <EnhancedPlayingCard
                      suit={card.suit}
                      rank={card.value}
                      size="large"
                      isDealing={dealingInProgress}
                      dealDelay={(index + 2) * 300}
                      isWinning={gameState.winner === 'banker'}
                    />
                  </div>
                {/each}
              </div>

              <div class="text-4xl font-bold text-red-600 mb-2">{gameState.bankerScore}</div>
              {#if gameState.winner === 'banker'}
                <div class="text-green-600 font-bold text-2xl animate-bounce">🏆 승리!</div>
              {/if}
            </div>
          </div>

          <!-- 타이 결과 -->
          {#if gameState.winner === 'tie'}
            <div class="text-center mb-6">
              <div class="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg inline-block font-bold text-xl animate-pulse">
                🤝 무승부!
              </div>
            </div>
          {/if}

          <!-- 사이드 베팅 결과 -->
          {#if gameState.gameState === 'finished'}
            <div class="mb-6 space-y-2">
              {#if gameState.sideBets.lucky6}
                <div class="bg-pink-100 border-2 border-pink-500 rounded-lg p-3 text-center">
                  <span class="font-bold text-pink-700">
                    🍀 Lucky 6! 뱅커가 {gameState.sideBets.lucky6.twoCard ? '2장' : '3장'}으로 6점 승리!
                  </span>
                </div>
              {/if}
              {#if gameState.sideBets.dragonBonus}
                <div class="bg-indigo-100 border-2 border-indigo-500 rounded-lg p-3 text-center">
                  <span class="font-bold text-indigo-700">
                    🐉 Dragon Bonus! {gameState.sideBets.dragonBonus.winner === 'player' ? '플레이어' : '뱅커'}
                    {gameState.sideBets.dragonBonus.margin}점 차 승리 ({gameState.sideBets.dragonBonus.payout}:1)
                  </span>
                </div>
              {/if}
              {#if gameState.sideBets.bigSmall}
                <div class="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 text-center">
                  <span class="font-bold text-yellow-700">
                    📏 {gameState.sideBets.bigSmall === 'big' ? 'Big (5-6장)' : 'Small (4장)'}
                  </span>
                </div>
              {/if}
            </div>
          {/if}

          <!-- 메인 베팅 영역 -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            {#each betTypes as betType}
              <button
                on:click={() => placeBet(betType.key)}
                disabled={gameState.gameState !== 'betting' || gameState.balance < selectedBetAmount}
                class="bg-gradient-to-r {betType.color} text-white p-4 rounded-lg font-bold transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                <div class="text-lg mb-1">{betType.label}</div>
                <div class="text-sm opacity-90">{betType.payout}</div>

                {#if gameState.bets[betType.key] > 0}
                  <div class="absolute -top-2 -right-2 bg-yellow-400 text-black rounded-full px-2 py-1 text-xs font-bold shadow-lg">
                    {formatCurrency(gameState.bets[betType.key])}
                  </div>
                {/if}
              </button>
            {/each}
          </div>

          <!-- 사이드 베팅 영역 -->
          <div class="mb-6">
            <h4 class="font-bold text-center mb-3 text-black">사이드 베팅</h4>
            <div class="grid grid-cols-5 gap-2">
              {#each sideBetTypes as betType}
                <button
                  on:click={() => placeBet(betType.key)}
                  disabled={gameState.gameState !== 'betting' || gameState.balance < selectedBetAmount}
                  class="bg-gradient-to-r {betType.color} text-white p-3 rounded-lg font-bold text-xs transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  <div class="mb-1">{betType.label}</div>
                  <div class="text-xs opacity-90">{betType.payout}</div>

                  {#if gameState.bets[betType.key] > 0}
                    <div class="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                      ✓
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <!-- 게임 컨트롤 -->
          <div class="flex flex-wrap justify-center gap-4">
            {#if gameState.gameState === 'betting'}
              <PastelButton
                variant="primary"
                on:click={dealCards}
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

              {#if gameState.bettingSystem.lastBets}
                <PastelButton
                  variant="accent"
                  on:click={baccaratActions.repeatLastBet}
                >
                  이전 베팅 반복
                </PastelButton>
              {/if}

              <PastelButton
                variant="accent"
                on:click={() => showFavoritesModal = true}
                disabled={Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0) === 0}
              >
                즐겨찾기 저장
              </PastelButton>

            {:else if gameState.gameState === 'finished'}
              <PastelButton
                variant="primary"
                on:click={baccaratActions.newGame}
              >
                새 게임
              </PastelButton>
            {/if}

            <PastelButton
              variant="danger"
              on:click={baccaratActions.newShoe}
            >
              새 슈 시작
            </PastelButton>
          </div>
        </PastelCard>
      </div>

      <!-- 오른쪽 사이드바 -->
      <div class="space-y-4">
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

        <!-- 즐겨찾기 베팅 -->
        {#if gameState.bettingSystem.favoriteBets.length > 0}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center text-black">즐겨찾기 베팅</h3>
            <div class="space-y-2">
              {#each gameState.bettingSystem.favoriteBets as favorite}
                <div class="flex justify-between items-center">
                  <button
                    on:click={() => baccaratActions.loadFavoriteBet(favorite.name)}
                    class="flex-1 bg-blue-100 hover:bg-blue-200 p-2 rounded text-sm font-bold text-black transition-all"
                    disabled={gameState.gameState !== 'betting'}
                  >
                    {favorite.name}
                  </button>
                  <button
                    on:click={() => baccaratActions.deleteFavoriteBet(favorite.name)}
                    class="ml-2 bg-red-100 hover:bg-red-200 p-2 rounded text-xs text-black"
                  >
                    ✕
                  </button>
                </div>
              {/each}
            </div>
          </PastelCard>
        {/if}

        <!-- 베팅 요약 -->
        {#if Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0) > 0}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center text-black">현재 베팅</h3>
            <div class="space-y-2 text-black text-sm">
              {#each [...betTypes, ...sideBetTypes] as betType}
                {#if gameState.bets[betType.key] > 0}
                  <div class="flex justify-between">
                    <span>{betType.label}</span>
                    <span class="font-bold">{formatCurrency(gameState.bets[betType.key])}</span>
                  </div>
                {/if}
              {/each}
              <hr class="my-2">
              <div class="flex justify-between font-bold text-base">
                <span>총 베팅</span>
                <span>{formatCurrency(Object.values(gameState.bets).reduce((sum, bet) => sum + bet, 0))}</span>
              </div>
            </div>
          </PastelCard>
        {/if}

        <!-- 최근 게임 기록 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">최근 결과</h3>
          <div class="flex flex-wrap gap-1 justify-center">
            {#each gameState.history.slice(0, 30) as game}
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold {
                  game.winner === 'player' ? 'bg-blue-500 text-white' :
                  game.winner === 'banker' ? 'bg-red-500 text-white' :
                  'bg-green-500 text-white'
                }"
                title="{game.winner === 'player' ? '플레이어' : game.winner === 'banker' ? '뱅커' : '타이'} - {game.playerScore}:{game.bankerScore}"
              >
                {game.winner === 'player' ? 'P' : game.winner === 'banker' ? 'B' : 'T'}
              </div>
            {/each}
          </div>
        </PastelCard>
      </div>
    </div>
  </div>

  <!-- 즐겨찾기 저장 모달 -->
  {#if showFavoritesModal}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showFavoritesModal = false}>
      <div class="bg-white rounded-xl p-6 max-w-md w-full text-black" on:click|stopPropagation>
        <h2 class="text-2xl font-bold mb-4">베팅 패턴 저장</h2>
        <input
          type="text"
          bind:value={newFavoriteName}
          placeholder="베팅 이름 입력..."
          class="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
          on:keydown={(e) => e.key === 'Enter' && saveFavorite()}
        />
        <div class="flex gap-2">
          <button
            on:click={saveFavorite}
            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-bold transition-all"
          >
            저장
          </button>
          <button
            on:click={() => showFavoritesModal = false}
            class="flex-1 bg-gray-300 hover:bg-gray-400 text-black p-3 rounded-lg font-bold transition-all"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- 게임 규칙 모달 -->
  {#if showRules}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showRules = false}>
      <div class="bg-white rounded-xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto text-black" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">바카라 게임 규칙</h2>
          <button on:click={() => showRules = false} class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div class="space-y-4">
            <div>
              <h3 class="font-bold mb-2 text-lg">게임 목표</h3>
              <p>플레이어와 뱅커 중 어느 쪽이 9에 더 가까운 점수를 얻을지 예측하는 게임입니다.</p>
            </div>

            <div>
              <h3 class="font-bold mb-2 text-lg">카드 값</h3>
              <ul class="list-disc list-inside space-y-1">
                <li>A = 1점</li>
                <li>2~9 = 숫자 그대로</li>
                <li>10, J, Q, K = 0점</li>
              </ul>
              <p class="mt-2 text-gray-600">두 카드의 합에서 일의 자리만 계산합니다. (예: 7+6=13 → 3점)</p>
            </div>

            <div>
              <h3 class="font-bold mb-2 text-lg">메인 베팅</h3>
              <ul class="space-y-1">
                <li><strong>플레이어:</strong> 1:1 배당</li>
                <li><strong>뱅커:</strong> 1:1 배당 (5% 수수료)</li>
                <li><strong>타이:</strong> 8:1 배당</li>
              </ul>
            </div>

            <div>
              <h3 class="font-bold mb-2 text-lg">3번째 카드 규칙</h3>
              <p>처음 2장의 합이 8 또는 9면 즉시 게임 종료 (내추럴). 그 외의 경우 자동으로 3번째 카드 규칙이 적용됩니다.</p>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="font-bold mb-2 text-lg">사이드 베팅</h3>
              <ul class="space-y-2">
                <li><strong>페어 베팅:</strong> 11:1 배당
                  <p class="text-xs ml-4 mt-1">플레이어/뱅커의 첫 2장이 같은 숫자일 때</p>
                </li>
                <li><strong>Big/Small:</strong> 0.54:1 / 1.5:1
                  <p class="text-xs ml-4 mt-1">총 카드 수가 5-6장(Big) 또는 4장(Small)</p>
                </li>
                <li><strong>Lucky 6:</strong> 최대 20:1
                  <p class="text-xs ml-4 mt-1">뱅커가 6점으로 승리 (2장: 20:1, 3장: 12:1)</p>
                </li>
                <li><strong>Dragon Bonus:</strong> 최대 30:1
                  <p class="text-xs ml-4 mt-1">승리 마진에 따른 보너스 (4점차 이상)</p>
                  <ul class="text-xs ml-8 mt-1">
                    <li>내추럴 9: 30:1</li>
                    <li>내추럴 8: 10:1</li>
                    <li>9점차: 30:1</li>
                    <li>8점차: 10:1</li>
                    <li>7점차: 6:1</li>
                    <li>6점차: 4:1</li>
                    <li>5점차: 2:1</li>
                    <li>4점차: 1:1</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="font-bold mb-2 text-lg">로드맵</h3>
              <p class="mb-2">바카라의 패턴을 시각화한 도구입니다:</p>
              <ul class="space-y-1 text-xs">
                <li><strong>Bead Road:</strong> 가장 기본적인 게임 결과 기록</li>
                <li><strong>Big Road:</strong> 연속 승리 패턴 표시</li>
                <li><strong>Big Eye Road:</strong> Big Road 패턴 분석</li>
                <li><strong>Small Road:</strong> 더 깊은 패턴 분석</li>
                <li><strong>Cockroach Road:</strong> 가장 복잡한 패턴 분석</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
