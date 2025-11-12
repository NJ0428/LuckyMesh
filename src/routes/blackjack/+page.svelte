<script>
  import { onMount, onDestroy } from 'svelte';
  import { blackjackStore, blackjackActions } from '$lib/stores/blackjack.js';
  import { blackjackStats, blackjackStatsActions } from '$lib/stores/blackjackStats.js';
  import { soundActions, soundSettings } from '$lib/stores/soundSystem.js';
  import { strategyStore, strategyActions } from '$lib/stores/strategy.js';
  import { achievementsStore, achievementsActions } from '$lib/stores/achievements.js';
  import { multiplayerStore } from '$lib/stores/multiplayer.js';

  // 컴포넌트들
  import EnhancedPlayingCard from '$lib/components/EnhancedPlayingCard.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';
  import ChipAnimation from '$lib/components/ChipAnimation.svelte';
  import CoinFountain from '$lib/components/CoinFountain.svelte';
  import ShuffleAnimation from '$lib/components/ShuffleAnimation.svelte';
  import GameSettings from '$lib/components/GameSettings.svelte';
  import MultiplayerLobby from '$lib/components/MultiplayerLobby.svelte';
  import StrategyHelper from '$lib/components/StrategyHelper.svelte';
  import AchievementPanel from '$lib/components/AchievementPanel.svelte';
  import AchievementNotification from '$lib/components/AchievementNotification.svelte';

  let dealingInProgress = false;
  let selectedBetAmount = 100;
  let selectedSideBets = { perfectPairs: 0, twentyOnePlusThree: 0 };

  // UI 상태
  let showRules = false;
  let showSettings = false;
  let showMultiplayer = false;
  let showStrategy = false;
  let showAchievements = false;
  let showStats = false;
  let showCoinFountain = false;
  let showShuffle = false;
  let winAmount = 0;

  // 키보드 단축키 설정
  let keyboardShortcuts = true;

  // 컴포넌트 마운트 시 초기화
  onMount(() => {
    if (!$blackjackStore || typeof $blackjackStore !== 'object') {
      blackjackActions.resetGame();
    }

    // 세션 시작
    blackjackStatsActions.startSession($blackjackStore.balance);
    achievementsActions.startSession();

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  $: gameState = $blackjackStore || {
    balance: 10000,
    gameState: 'betting',
    message: '베팅을 시작하세요!',
    playerHands: [[]],
    dealerHand: [],
    bets: [0],
    results: [],
    currentHandIndex: 0,
    canDouble: false,
    canSplit: false,
    canSurrender: false,
    insuranceBet: 0,
    sideBets: { perfectPairs: 0, twentyOnePlusThree: 0 },
    sideBetResults: { perfectPairs: null, twentyOnePlusThree: null }
  };

  // 전략 힌트 업데이트
  $: if (gameState.gameState === 'playing' && gameState.playerHands[gameState.currentHandIndex]?.length > 0 && gameState.dealerHand.length > 0 && $strategyStore.showHints) {
    const hint = strategyActions.generateHint(
      gameState.playerHands[gameState.currentHandIndex],
      gameState.dealerHand[0],
      gameState.canDouble,
      gameState.canSplit,
      gameState.canSurrender
    );
    strategyActions.setHint(hint);
  } else {
    strategyActions.clearHint();
  }

  const betOptions = [10, 25, 50, 100, 250, 500];
  const sideBetOptions = [5, 10, 25, 50];

  function placeBet() {
    if ((gameState?.balance || 0) >= selectedBetAmount) {
      blackjackActions.placeBet(selectedBetAmount);
      soundActions.playChipBet();
    }
  }

  function placeSideBet(type, amount) {
    if ((gameState?.balance || 0) >= amount) {
      if (type === 'perfectPairs') {
        blackjackActions.placePerfectPairsBet(amount);
        selectedSideBets.perfectPairs = amount;
      } else if (type === 'twentyOnePlusThree') {
        blackjackActions.placeTwentyOnePlusThreeBet(amount);
        selectedSideBets.twentyOnePlusThree = amount;
      }
      soundActions.playChipBet();
    }
  }

  function dealCards() {
    showShuffle = true;
    setTimeout(() => {
      showShuffle = false;
      blackjackActions.deal();
      dealingInProgress = true;

      setTimeout(() => {
        dealingInProgress = false;
      }, 1500);
    }, 2000);
  }

  function handlePlayerAction(action) {
    const currentHand = gameState.playerHands[gameState.currentHandIndex];
    const dealerUpCard = gameState.dealerHand[0];

    if ($strategyStore.showHints && currentHand && dealerUpCard) {
      const recommendedAction = strategyActions.getBasicStrategyAction(
        currentHand,
        dealerUpCard,
        gameState.canDouble,
        gameState.canSplit,
        gameState.canSurrender
      );
      strategyActions.recordPlay(action, recommendedAction);
    }

    // 액션 실행
    switch (action) {
      case 'hit':
        blackjackActions.hit();
        soundActions.playCardDeal();
        break;
      case 'stand':
        blackjackActions.stand();
        soundActions.playButtonClick();
        break;
      case 'double':
        blackjackActions.double();
        soundActions.playCardDeal();
        break;
      case 'split':
        blackjackActions.split();
        soundActions.playCardDeal();
        break;
      case 'surrender':
        blackjackActions.surrender();
        soundActions.playButtonClick();
        break;
    }
  }

  // 게임 결과 처리
  $: if (gameState.gameState === 'finished' && gameState.results.length > 0) {
    setTimeout(() => {
      handleGameFinished();
    }, 1000);
  }

  function handleGameFinished() {
    const totalBet = gameState.bets.reduce((sum, bet) => sum + bet, 0);
    const totalSideBets = gameState.sideBets.perfectPairs + gameState.sideBets.twentyOnePlusThree;
    let winnings = 0;

    // 메인 베팅 상금 계산
    gameState.results.forEach((result, index) => {
      const bet = gameState.bets[index];
      switch (result) {
        case 'blackjack':
          winnings += Math.floor(bet * 2.5);
          break;
        case 'win':
          winnings += bet * 2;
          break;
        case 'push':
          winnings += bet;
          break;
        case 'surrender':
          winnings += Math.floor(bet / 2);
          break;
      }
    });

    // 사이드 베팅 상금 계산
    if (gameState.sideBetResults.perfectPairs) {
      winnings += gameState.sideBets.perfectPairs * (gameState.sideBetResults.perfectPairs.multiplier + 1);
    }
    if (gameState.sideBetResults.twentyOnePlusThree) {
      winnings += gameState.sideBets.twentyOnePlusThree * (gameState.sideBetResults.twentyOnePlusThree.multiplier + 1);
    }

    const netResult = winnings - totalBet - totalSideBets;

    // 통계 업데이트
    blackjackStatsActions.recordGameResult({
      results: gameState.results,
      bets: gameState.bets,
      winnings,
      balance: gameState.balance,
      playerHands: gameState.playerHands,
      dealerHand: gameState.dealerHand
    });

    // 업적 업데이트
    achievementsActions.updateProgress({
      totalGames: $blackjackStats.totalGames,
      wins: $blackjackStats.wins,
      winStreak: $blackjackStats.winStreak,
      blackjacks: $blackjackStats.blackjacks,
      netProfit: $blackjackStats.netProfit,
      biggestWin: netResult > 0 ? netResult : 0,
      perfectPairWin: gameState.sideBetResults.perfectPairs !== null,
      twentyOnePlusThreeWin: gameState.sideBetResults.twentyOnePlusThree !== null,
      strategyAccuracy: $strategyStore.strategyStats.accuracy,
      perfectStrategy: $strategyStore.strategyStats.accuracy === 100
    });

    // 카드 카운팅 업데이트
    if ($strategyStore.cardCountingMode) {
      const dealtCards = [...gameState.playerHands.flat(), ...gameState.dealerHand];
      strategyActions.updateCardCount(dealtCards);
    }

    // 승리 시 애니메이션
    if (netResult > 0) {
      winAmount = winnings;
      showCoinFountain = true;
      soundActions.playWin();

      setTimeout(() => {
        showCoinFountain = false;
      }, 3000);
    } else if (netResult < 0) {
      soundActions.playLose();
    }

    // 블랙잭 시 특별 사운드
    if (gameState.results.includes('blackjack')) {
      soundActions.playBlackjack();
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function getHandValue(hand) {
    let sum = 0;
    let aces = 0;

    for (let card of hand) {
      if (card.value === 'A') {
        aces++;
        sum += 11;
      } else if (['J', 'Q', 'K'].includes(card.value)) {
        sum += 10;
      } else {
        sum += parseInt(card.value);
      }
    }

    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces--;
    }

    return sum;
  }

  function getResultText(result) {
    switch (result) {
      case 'blackjack': return '블랙잭!';
      case 'win': return '승리!';
      case 'lose': return '패배';
      case 'push': return '무승부';
      case 'bust': return '버스트';
      case 'surrender': return '항복';
      default: return '';
    }
  }

  function getSideBetResultText(result) {
    return result ? result.name : '';
  }

  // 키보드 단축키 처리
  function handleKeydown(event) {
    if (!keyboardShortcuts) return;

    // 모달이 열려있으면 단축키 비활성화
    if (showSettings || showRules || showMultiplayer || showStrategy || showAchievements) return;

    switch (event.key.toLowerCase()) {
      case 'h':
        if (gameState.gameState === 'playing') {
          event.preventDefault();
          handlePlayerAction('hit');
        }
        break;
      case 's':
        if (gameState.gameState === 'playing') {
          event.preventDefault();
          handlePlayerAction('stand');
        }
        break;
      case 'd':
        if (gameState.gameState === 'playing' && gameState.canDouble) {
          event.preventDefault();
          handlePlayerAction('double');
        }
        break;
      case 'p':
        if (gameState.gameState === 'playing' && gameState.canSplit) {
          event.preventDefault();
          handlePlayerAction('split');
        }
        break;
      case 'r':
        if (gameState.gameState === 'playing' && gameState.canSurrender) {
          event.preventDefault();
          handlePlayerAction('surrender');
        }
        break;
      case ' ':
        event.preventDefault();
        if (gameState.gameState === 'betting') {
          if (gameState.bets[0] > 0) {
            dealCards();
          } else {
            placeBet();
          }
        }
        break;
      case 'enter':
        if (gameState.gameState === 'finished') {
          event.preventDefault();
          blackjackActions.newGame();
        }
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        if (gameState.gameState === 'betting') {
          event.preventDefault();
          const index = parseInt(event.key) - 1;
          if (index < betOptions.length) {
            selectedBetAmount = betOptions[index];
          }
        }
        break;
    }
  }

  // 새 게임 시작
  function startNewGame() {
    selectedSideBets = { perfectPairs: 0, twentyOnePlusThree: 0 };
    blackjackActions.newGame();
    soundActions.playButtonClick();
  }
</script>

<svelte:head>
  <title>고급 블랙잭 게임 - 럭키메시 카지노</title>
  <meta name="description" content="전략 도우미, 멀티플레이어, 업적 시스템이 포함된 완전한 블랙잭 게임을 플레이하세요!" />
</svelte:head>

<!-- 애니메이션 컴포넌트들 -->
<CoinFountain bind:show={showCoinFountain} {winAmount} />
<ShuffleAnimation bind:show={showShuffle} />
<AchievementNotification />

<!-- 모달들 -->
<GameSettings bind:show={showSettings} />
<MultiplayerLobby bind:show={showMultiplayer} />
<StrategyHelper bind:show={showStrategy}
  playerHand={gameState.playerHands[gameState.currentHandIndex] || []}
  dealerUpCard={gameState.dealerHand[0]}
  canDouble={gameState.canDouble}
  canSplit={gameState.canSplit}
  canSurrender={gameState.canSurrender} />
<AchievementPanel bind:show={showAchievements} />

<div class="min-h-screen bg-gradient-to-br from-pastel-mint via-pastel-cream to-pastel-sky">
  <!-- 게임 헤더 -->
  <div class="bg-gradient-to-r from-primary-soft-mint to-primary-soft-peach py-6">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center text-black">
        <div class="flex items-center space-x-4">
          <div class="text-4xl">🃏</div>
          <div>
            <h1 class="text-3xl font-bold font-playfair">고급 블랙잭</h1>
            <p class="text-sm opacity-90">Advanced Blackjack Game</p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- 잔고 및 세션 정보 -->
          <div class="text-center">
            <div class="text-2xl font-bold">{formatCurrency(gameState?.balance || 0)}</div>
            <div class="text-sm opacity-90">잔고</div>
          </div>

          <!-- 업적 알림 -->
          {#if $achievementsStore.recentUnlocks.length > 0}
            <button
              on:click={() => showAchievements = true}
              class="relative bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded-lg transition-all text-black"
            >
              🏆
              <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {$achievementsStore.recentUnlocks.length}
              </span>
            </button>
          {/if}

          <!-- 메뉴 버튼들 -->
          <div class="flex gap-2">
            <button
              on:click={() => showStrategy = true}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="전략 도우미"
            >
              🧠
            </button>

            <button
              on:click={() => showMultiplayer = true}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="멀티플레이어"
            >
              👥
            </button>

            <button
              on:click={() => showAchievements = true}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="업적"
            >
              🏆
            </button>

            <button
              on:click={() => showStats = !showStats}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="통계"
            >
              📊
            </button>

            <button
              on:click={() => showSettings = true}
              class="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-black"
              title="설정"
            >
              ⚙️
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
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">

      <!-- 게임 테이블 -->
      <div class="lg:col-span-3">
        <PastelCard gradient={true} gradientFrom="pastel-cream" gradientTo="pastel-mint" padding="p-6">

          <!-- 전략 힌트 표시 -->
          {#if $strategyStore.showHints && $strategyStore.currentHint}
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-blue-600">💡</span>
                <span class="font-bold text-blue-800">전략 힌트:</span>
                <span class="text-blue-600 font-medium">{strategyActions.translateAction($strategyStore.currentHint.action)}</span>
              </div>
              <div class="text-sm text-blue-700">{$strategyStore.currentHint.explanation}</div>
            </div>
          {/if}

          <!-- 카드 카운팅 정보 -->
          {#if $strategyStore.cardCountingMode}
            <div class="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div class="flex justify-between items-center text-sm">
                <span>러닝 카운트: <span class="font-bold">{$strategyStore.runningCount}</span></span>
                <span>트루 카운트: <span class="font-bold">{$strategyStore.trueCount}</span></span>
                <span>남은 덱: <span class="font-bold">{$strategyStore.decksRemaining.toFixed(1)}</span></span>
              </div>
            </div>
          {/if}

          <!-- 게임 상태 메시지 -->
          <div class="text-center mb-6">
            <div class="bg-gradient-to-r from-primary-soft-purple to-primary-soft-pink text-black px-6 py-3 rounded-full inline-block">
              <span class="font-bold">{gameState?.message || '로딩 중...'}</span>
            </div>
          </div>

          <!-- 딜러 영역 -->
          <div class="text-center mb-8">
            <div class="bg-gradient-to-r from-red-500 to-red-600 text-black py-3 px-6 rounded-lg mb-4 font-bold inline-block">
              딜러 {gameState?.gameState !== 'betting' && gameState?.gameState !== 'insurance' ? `(${getHandValue(gameState?.dealerHand || [])})` : ''}
            </div>

            <div class="flex justify-center space-x-2 mb-4 min-h-[120px] items-end">
              {#each (gameState?.dealerHand || []) as card, index}
                {#if index === 0 && gameState?.gameState !== 'finished' && gameState?.gameState !== 'dealer-turn'}
                  <EnhancedPlayingCard
                    isHidden={true}
                    size="large"
                    isDealing={dealingInProgress}
                    dealDelay={index * 300}
                    flipAnimation={true}
                  />
                {:else}
                  <EnhancedPlayingCard
                    suit={card.suit}
                    rank={card.value}
                    size="large"
                    isDealing={dealingInProgress}
                    dealDelay={index * 300}
                    flipAnimation={index === 0 && (gameState?.gameState === 'finished' || gameState?.gameState === 'dealer-turn')}
                    glowEffect={gameState?.gameState === 'finished' && index === 0}
                  />
                {/if}
              {/each}
            </div>
          </div>

          <!-- 플레이어 영역들 -->
          <div class="space-y-6">
            {#each (gameState?.playerHands || [[]]) as hand, handIndex}
              <div class="text-center {handIndex === gameState?.currentHandIndex && gameState?.gameState === 'playing' ? 'ring-2 ring-blue-500 rounded-lg p-4' : ''}">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-black py-3 px-6 rounded-lg mb-4 font-bold inline-block">
                  플레이어 {(gameState?.playerHands || []).length > 1 ? `핸드 ${handIndex + 1}` : ''}
                  {hand.length > 0 ? `(${getHandValue(hand)})` : ''}
                  {#if gameState?.bets?.[handIndex]}• 베팅: {formatCurrency(gameState.bets[handIndex])}{/if}
                </div>

                <div class="flex justify-center space-x-2 mb-4 min-h-[120px] items-end">
                  {#each hand as card, cardIndex}
                    <EnhancedPlayingCard
                      suit={card.suit}
                      rank={card.value}
                      size="large"
                      isDealing={dealingInProgress}
                      dealDelay={(cardIndex + (gameState?.dealerHand?.length || 0)) * 300}
                      isSelected={handIndex === gameState?.currentHandIndex && gameState?.gameState === 'playing'}
                      isWinning={gameState?.results?.[handIndex] === 'win' || gameState?.results?.[handIndex] === 'blackjack'}
                      glowEffect={getHandValue(hand) === 21}
                    />
                  {/each}
                </div>

                <!-- 결과 표시 -->
                {#if gameState?.results?.[handIndex]}
                  <div class="text-2xl font-bold mb-2 {gameState.results[handIndex] === 'win' || gameState.results[handIndex] === 'blackjack' ? 'text-green-600' : gameState.results[handIndex] === 'push' ? 'text-yellow-600' : 'text-red-600'}">
                    {getResultText(gameState.results[handIndex])}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <!-- 사이드 베팅 결과 -->
          {#if gameState?.sideBetResults?.perfectPairs || gameState?.sideBetResults?.twentyOnePlusThree}
            <div class="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 class="font-bold text-purple-800 mb-2">사이드 베팅 결과</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                {#if gameState.sideBetResults.perfectPairs}
                  <div class="text-green-600 font-bold">
                    Perfect Pairs: {getSideBetResultText(gameState.sideBetResults.perfectPairs)}
                    ({gameState.sideBetResults.perfectPairs.multiplier}:1)
                  </div>
                {/if}
                {#if gameState.sideBetResults.twentyOnePlusThree}
                  <div class="text-green-600 font-bold">
                    21+3: {getSideBetResultText(gameState.sideBetResults.twentyOnePlusThree)}
                    ({gameState.sideBetResults.twentyOnePlusThree.multiplier}:1)
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- 인슈어런스 옵션 -->
          {#if gameState?.gameState === 'insurance'}
            <div class="flex justify-center gap-4 mb-6">
              <PastelButton variant="primary" on:click={blackjackActions.insurance}>
                인슈어런스 ({formatCurrency(Math.floor((gameState?.bets?.[0] || 0) / 2))})
              </PastelButton>
              <PastelButton variant="secondary" on:click={blackjackActions.noInsurance}>
                거절
              </PastelButton>
            </div>
          {/if}

          <!-- 게임 컨트롤 -->
          <div class="flex flex-wrap justify-center gap-4">
            {#if gameState?.gameState === 'betting'}
              <PastelButton
                variant="primary"
                on:click={placeBet}
                disabled={(gameState?.balance || 0) < selectedBetAmount}
              >
                베팅 ({formatCurrency(selectedBetAmount)})
              </PastelButton>

              {#if (gameState?.bets?.[0] || 0) > 0}
                <PastelButton
                  variant="primary"
                  on:click={dealCards}
                >
                  딜 시작
                </PastelButton>

                <PastelButton
                  variant="secondary"
                  on:click={blackjackActions.clearBets}
                >
                  베팅 취소
                </PastelButton>
              {/if}

            {:else if gameState?.gameState === 'playing'}
              <PastelButton variant="primary" on:click={() => handlePlayerAction('hit')}>
                히트 (H)
              </PastelButton>

              <PastelButton variant="secondary" on:click={() => handlePlayerAction('stand')}>
                스탠드 (S)
              </PastelButton>

              {#if gameState?.canDouble}
                <PastelButton variant="accent" on:click={() => handlePlayerAction('double')} disabled={(gameState?.balance || 0) < (gameState?.bets?.[gameState?.currentHandIndex || 0] || 0)}>
                  더블다운 (D)
                </PastelButton>
              {/if}

              {#if gameState?.canSplit}
                <PastelButton variant="accent" on:click={() => handlePlayerAction('split')} disabled={(gameState?.balance || 0) < (gameState?.bets?.[gameState?.currentHandIndex || 0] || 0)}>
                  스플릿 (P)
                </PastelButton>
              {/if}

              {#if gameState?.canSurrender}
                <PastelButton variant="danger" on:click={() => handlePlayerAction('surrender')}>
                  항복 (R)
                </PastelButton>
              {/if}

            {:else if gameState?.gameState === 'finished'}
              <PastelButton
                variant="primary"
                on:click={startNewGame}
              >
                새 게임 (Enter)
              </PastelButton>
            {/if}
          </div>
        </PastelCard>
      </div>

      <!-- 사이드바 -->
      <div class="space-y-6">
        <!-- 베팅 금액 선택 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center">베팅 금액</h3>
          <div class="grid grid-cols-2 gap-2">
            {#each betOptions as amount, index}
              <button
                on:click={() => selectedBetAmount = amount}
                class="p-2 rounded-lg border-2 transition-all font-bold {selectedBetAmount === amount ? 'border-primary-soft-pink bg-primary-soft-pink text-white' : 'border-gray-300 hover:border-primary-soft-pink text-black'}"
                title="단축키: {index + 1}"
              >
                {formatCurrency(amount)}
              </button>
            {/each}
          </div>
        </PastelCard>

        <!-- 사이드 베팅 -->
        {#if gameState?.gameState === 'betting'}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center text-black">사이드 베팅</h3>

            <!-- Perfect Pairs -->
            <div class="mb-4">
              <h4 class="font-medium text-black mb-2">Perfect Pairs</h4>
              <div class="grid grid-cols-2 gap-1">
                {#each sideBetOptions as amount}
                  <button
                    on:click={() => placeSideBet('perfectPairs', amount)}
                    class="p-1 text-xs rounded border transition-all {gameState.sideBets.perfectPairs === amount ? 'bg-purple-500 text-white' : 'border-gray-300 hover:border-purple-400 text-black'}"
                    disabled={(gameState?.balance || 0) < amount}
                  >
                    ${amount}
                  </button>
                {/each}
              </div>
              {#if gameState.sideBets.perfectPairs > 0}
                <div class="text-xs text-purple-600 mt-1">베팅: ${gameState.sideBets.perfectPairs}</div>
              {/if}
            </div>

            <!-- 21+3 -->
            <div>
              <h4 class="font-medium text-black mb-2">21+3</h4>
              <div class="grid grid-cols-2 gap-1">
                {#each sideBetOptions as amount}
                  <button
                    on:click={() => placeSideBet('twentyOnePlusThree', amount)}
                    class="p-1 text-xs rounded border transition-all {gameState.sideBets.twentyOnePlusThree === amount ? 'bg-purple-500 text-white' : 'border-gray-300 hover:border-purple-400 text-black'}"
                    disabled={(gameState?.balance || 0) < amount}
                  >
                    ${amount}
                  </button>
                {/each}
              </div>
              {#if gameState.sideBets.twentyOnePlusThree > 0}
                <div class="text-xs text-purple-600 mt-1">베팅: ${gameState.sideBets.twentyOnePlusThree}</div>
              {/if}
            </div>
          </PastelCard>
        {/if}

        <!-- 베팅 정보 -->
        {#if (gameState?.bets || []).reduce((sum, bet) => sum + bet, 0) > 0 || gameState?.sideBets?.perfectPairs > 0 || gameState?.sideBets?.twentyOnePlusThree > 0}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center text-black">현재 베팅</h3>
            <div class="space-y-2 text-black">
              {#each (gameState?.bets || []) as bet, index}
                {#if bet > 0}
                  <div class="flex justify-between">
                    <span>핸드 {index + 1}</span>
                    <span class="font-bold">{formatCurrency(bet)}</span>
                  </div>
                {/if}
              {/each}
              {#if (gameState?.insuranceBet || 0) > 0}
                <div class="flex justify-between">
                  <span>인슈어런스</span>
                  <span class="font-bold">{formatCurrency(gameState.insuranceBet)}</span>
                </div>
              {/if}
              {#if (gameState?.sideBets?.perfectPairs || 0) > 0}
                <div class="flex justify-between">
                  <span>Perfect Pairs</span>
                  <span class="font-bold">{formatCurrency(gameState.sideBets.perfectPairs)}</span>
                </div>
              {/if}
              {#if (gameState?.sideBets?.twentyOnePlusThree || 0) > 0}
                <div class="flex justify-between">
                  <span>21+3</span>
                  <span class="font-bold">{formatCurrency(gameState.sideBets.twentyOnePlusThree)}</span>
                </div>
              {/if}
              <hr>
              <div class="flex justify-between font-bold">
                <span>총 베팅</span>
                <span>{formatCurrency(
                  (gameState?.bets || []).reduce((sum, bet) => sum + bet, 0) +
                  (gameState?.insuranceBet || 0) +
                  (gameState?.sideBets?.perfectPairs || 0) +
                  (gameState?.sideBets?.twentyOnePlusThree || 0)
                )}</span>
              </div>
            </div>
          </PastelCard>
        {/if}

        <!-- 세션 통계 -->
        {#if showStats}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center text-black">세션 통계</h3>
            <div class="space-y-2 text-sm text-black">
              <div class="flex justify-between">
                <span>게임 수:</span>
                <span class="font-bold">{$blackjackStats.sessionStats.gamesPlayed}</span>
              </div>
              <div class="flex justify-between">
                <span>순수익:</span>
                <span class="font-bold {$blackjackStats.sessionStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}">
                  {formatCurrency($blackjackStats.sessionStats.netProfit)}
                </span>
              </div>
              <div class="flex justify-between">
                <span>연승:</span>
                <span class="font-bold">{$blackjackStats.winStreak}</span>
              </div>
              <div class="flex justify-between">
                <span>최대 연승:</span>
                <span class="font-bold">{$blackjackStats.maxWinStreak}</span>
              </div>
              {#if $strategyStore.strategyStats.totalPlays > 0}
                <div class="flex justify-between">
                  <span>전략 정확도:</span>
                  <span class="font-bold">{$strategyStore.strategyStats.accuracy.toFixed(1)}%</span>
                </div>
              {/if}
            </div>
          </PastelCard>
        {/if}

        <!-- 게임 정보 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4 text-center text-black">게임 정보</h3>
          <div class="space-y-2 text-sm text-black">
            <div class="flex justify-between">
              <span>덱 수:</span>
              <span class="font-bold">6덱</span>
            </div>
            <div class="flex justify-between">
              <span>블랙잭 배당:</span>
              <span class="font-bold">3:2</span>
            </div>
            <div class="flex justify-between">
              <span>일반 승리:</span>
              <span class="font-bold">1:1</span>
            </div>
            <div class="flex justify-between">
              <span>인슈어런스:</span>
              <span class="font-bold">2:1</span>
            </div>
            <div class="flex justify-between">
              <span>Perfect Pairs:</span>
              <span class="font-bold">최대 25:1</span>
            </div>
            <div class="flex justify-between">
              <span>21+3:</span>
              <span class="font-bold">최대 100:1</span>
            </div>
          </div>
        </PastelCard>
      </div>
    </div>
  </div>

  <!-- 게임 규칙 모달 -->
  {#if showRules}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showRules = false}>
      <div class="bg-white rounded-xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto text-black" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">블랙잭 게임 규칙</h2>
          <button on:click={() => showRules = false} class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div class="space-y-4">
            <div>
              <h3 class="font-bold mb-2">게임 목표</h3>
              <p>21을 넘지 않으면서 딜러보다 높은 점수를 만드는 것입니다.</p>
            </div>

            <div>
              <h3 class="font-bold mb-2">카드 값</h3>
              <ul class="list-disc list-inside space-y-1">
                <li>A = 1 또는 11 (유리한 쪽으로)</li>
                <li>2~10 = 숫자 그대로</li>
                <li>J, Q, K = 10</li>
              </ul>
            </div>

            <div>
              <h3 class="font-bold mb-2">플레이어 행동</h3>
              <ul class="space-y-1">
                <li><strong>히트 (H):</strong> 카드를 한 장 더 받기</li>
                <li><strong>스탠드 (S):</strong> 카드를 그만 받기</li>
                <li><strong>더블다운 (D):</strong> 베팅 2배, 카드 1장만 더 받기</li>
                <li><strong>스플릿 (P):</strong> 같은 카드 2장을 분할하여 플레이</li>
                <li><strong>항복 (R):</strong> 베팅의 절반을 잃고 게임 포기</li>
                <li><strong>인슈어런스:</strong> 딜러 A에 대한 보험</li>
              </ul>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="font-bold mb-2">사이드 베팅</h3>
              <ul class="space-y-2">
                <li><strong>Perfect Pairs:</strong> 첫 2장이 페어일 때 승리
                  <ul class="ml-4 mt-1 text-xs">
                    <li>퍼펙트 페어 (같은 카드): 25:1</li>
                    <li>컬러드 페어 (같은 색): 12:1</li>
                    <li>믹스드 페어 (다른 색): 6:1</li>
                  </ul>
                </li>
                <li><strong>21+3:</strong> 첫 2장 + 딜러 오픈카드로 포커 핸드
                  <ul class="ml-4 mt-1 text-xs">
                    <li>수티드 스리 오브 어 카인드: 100:1</li>
                    <li>스트레이트 플러시: 40:1</li>
                    <li>스리 오브 어 카인드: 30:1</li>
                    <li>스트레이트: 10:1</li>
                    <li>플러시: 5:1</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="font-bold mb-2">배당률</h3>
              <ul class="space-y-1">
                <li><strong>블랙잭:</strong> 3:2 (1.5배)</li>
                <li><strong>일반 승리:</strong> 1:1</li>
                <li><strong>인슈어런스:</strong> 2:1</li>
              </ul>
            </div>

            <div>
              <h3 class="font-bold mb-2">키보드 단축키</h3>
              <ul class="space-y-1 text-xs">
                <li><strong>H:</strong> 히트</li>
                <li><strong>S:</strong> 스탠드</li>
                <li><strong>D:</strong> 더블다운</li>
                <li><strong>P:</strong> 스플릿</li>
                <li><strong>R:</strong> 항복</li>
                <li><strong>Space:</strong> 베팅/딜</li>
                <li><strong>Enter:</strong> 새 게임</li>
                <li><strong>1-6:</strong> 베팅 금액 선택</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>