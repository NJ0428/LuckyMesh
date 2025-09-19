<script>
  import { onMount } from 'svelte';
  import { blackjackStore, blackjackActions } from '$lib/stores/blackjack.js';
  import PlayingCard from '$lib/components/PlayingCard.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';

  let gameState;
  let selectedBetAmount = 100;
  let showRules = false;

  $: gameState = $blackjackStore;

  const betOptions = [10, 25, 50, 100, 250, 500];

  function placeBet() {
    if (gameState.balance >= selectedBetAmount) {
      blackjackActions.placeBet(selectedBetAmount);
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
</script>

<svelte:head>
  <title>블랙잭 게임 - LuckyMesh Casino</title>
  <meta name="description" content="실시간 블랙잭 게임을 플레이하세요. 히트, 스탠드, 더블다운, 스플릿으로 딜러를 이기세요!" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-pastel-mint via-pastel-cream to-pastel-sky">
  <!-- 게임 헤더 -->
  <div class="bg-gradient-to-r from-primary-soft-mint to-primary-soft-peach py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between items-center text-black">
        <div class="flex items-center space-x-4">
          <div class="text-4xl">🃏</div>
          <div>
            <h1 class="text-3xl font-bold font-playfair">블랙잭</h1>
            <p class="text-sm opacity-90">Blackjack Game</p>
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

          <!-- 딜러 영역 -->
          <div class="text-center mb-8">
            <div class="bg-gradient-to-r from-red-500 to-red-600 text-black py-3 px-6 rounded-lg mb-4 font-bold inline-block">
              딜러 {gameState.gameState !== 'betting' && gameState.gameState !== 'insurance' ? `(${getHandValue(gameState.dealerHand)})` : ''}
            </div>

            <div class="flex justify-center space-x-2 mb-4 min-h-[120px] items-end">
              {#each gameState.dealerHand as card, index}
                <div class="animate-in" style="animation-delay: {index * 200}ms;">
                  <!-- 첫 번째 카드는 게임이 끝나기 전까지 숨김 -->
                  {#if index === 0 && gameState.gameState !== 'finished' && gameState.gameState !== 'dealer-turn'}
                    <PlayingCard isHidden={true} size="normal" />
                  {:else}
                    <PlayingCard suit={card.suit} value={card.value} size="normal" />
                  {/if}
                </div>
              {/each}
            </div>
          </div>

          <!-- 플레이어 영역들 -->
          <div class="space-y-6">
            {#each gameState.playerHands as hand, handIndex}
              <div class="text-center {handIndex === gameState.currentHandIndex && gameState.gameState === 'playing' ? 'ring-2 ring-blue-500 rounded-lg p-4' : ''}">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-black py-3 px-6 rounded-lg mb-4 font-bold inline-block">
                  플레이어 {gameState.playerHands.length > 1 ? `핸드 ${handIndex + 1}` : ''}
                  {hand.length > 0 ? `(${getHandValue(hand)})` : ''}
                  {#if gameState.bets[handIndex]}• 베팅: {formatCurrency(gameState.bets[handIndex])}{/if}
                </div>

                <div class="flex justify-center space-x-2 mb-4 min-h-[120px] items-end">
                  {#each hand as card, cardIndex}
                    <div class="animate-in" style="animation-delay: {(cardIndex + 2) * 200}ms;">
                      <PlayingCard suit={card.suit} value={card.value} size="normal" />
                    </div>
                  {/each}
                </div>

                <!-- 결과 표시 -->
                {#if gameState.results[handIndex]}
                  <div class="text-2xl font-bold mb-2 {gameState.results[handIndex] === 'win' || gameState.results[handIndex] === 'blackjack' ? 'text-green-600' : gameState.results[handIndex] === 'push' ? 'text-yellow-600' : 'text-red-600'}">
                    {getResultText(gameState.results[handIndex])}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <!-- 인슈어런스 옵션 -->
          {#if gameState.gameState === 'insurance'}
            <div class="flex justify-center gap-4 mb-6">
              <PastelButton variant="primary" on:click={blackjackActions.insurance}>
                인슈어런스 ({formatCurrency(Math.floor(gameState.bets[0] / 2))})
              </PastelButton>
              <PastelButton variant="secondary" on:click={blackjackActions.noInsurance}>
                거절
              </PastelButton>
            </div>
          {/if}

          <!-- 게임 컨트롤 -->
          <div class="flex flex-wrap justify-center gap-4">
            {#if gameState.gameState === 'betting'}
              <PastelButton
                variant="primary"
                on:click={placeBet}
                disabled={gameState.balance < selectedBetAmount}
              >
                베팅 ({formatCurrency(selectedBetAmount)})
              </PastelButton>

              {#if gameState.bets[0] > 0}
                <PastelButton
                  variant="primary"
                  on:click={blackjackActions.deal}
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

            {:else if gameState.gameState === 'playing'}
              <PastelButton variant="primary" on:click={blackjackActions.hit}>
                히트
              </PastelButton>

              <PastelButton variant="secondary" on:click={blackjackActions.stand}>
                스탠드
              </PastelButton>

              {#if gameState.canDouble}
                <PastelButton variant="accent" on:click={blackjackActions.double} disabled={gameState.balance < gameState.bets[gameState.currentHandIndex]}>
                  더블다운
                </PastelButton>
              {/if}

              {#if gameState.canSplit}
                <PastelButton variant="accent" on:click={blackjackActions.split} disabled={gameState.balance < gameState.bets[gameState.currentHandIndex]}>
                  스플릿
                </PastelButton>
              {/if}

              {#if gameState.canSurrender}
                <PastelButton variant="danger" on:click={blackjackActions.surrender}>
                  항복
                </PastelButton>
              {/if}

            {:else if gameState.gameState === 'finished'}
              <PastelButton
                variant="primary"
                on:click={blackjackActions.newGame}
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
          <h3 class="font-bold text-lg mb-4 text-center">베팅 금액</h3>
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

        <!-- 베팅 정보 -->
        {#if gameState.bets.reduce((sum, bet) => sum + bet, 0) > 0}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4 text-center text-black">현재 베팅</h3>
            <div class="space-y-2 text-black">
              {#each gameState.bets as bet, index}
                {#if bet > 0}
                  <div class="flex justify-between">
                    <span>핸드 {index + 1}</span>
                    <span class="font-bold">{formatCurrency(bet)}</span>
                  </div>
                {/if}
              {/each}
              {#if gameState.insuranceBet > 0}
                <div class="flex justify-between">
                  <span>인슈어런스</span>
                  <span class="font-bold">{formatCurrency(gameState.insuranceBet)}</span>
                </div>
              {/if}
              <hr>
              <div class="flex justify-between font-bold">
                <span>총 베팅</span>
                <span>{formatCurrency(gameState.bets.reduce((sum, bet) => sum + bet, 0) + gameState.insuranceBet)}</span>
              </div>
            </div>
          </PastelCard>
        {/if}

        <!-- 게임 통계 -->
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
          </div>
        </PastelCard>
      </div>
    </div>
  </div>

  <!-- 게임 규칙 모달 -->
  {#if showRules}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showRules = false}>
      <div class="bg-white rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto text-black" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">블랙잭 게임 규칙</h2>
          <button on:click={() => showRules = false} class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div class="space-y-4 text-sm">
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
              <li><strong>히트:</strong> 카드를 한 장 더 받기</li>
              <li><strong>스탠드:</strong> 카드를 그만 받기</li>
              <li><strong>더블다운:</strong> 베팅 2배, 카드 1장만 더 받기</li>
              <li><strong>스플릿:</strong> 같은 카드 2장을 분할하여 플레이</li>
              <li><strong>항복:</strong> 베팅의 절반을 잃고 게임 포기</li>
              <li><strong>인슈어런스:</strong> 딜러 A에 대한 보험</li>
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
        </div>
      </div>
    </div>
  {/if}
</div>