<script>
  import { strategyStore, strategyActions } from '$lib/stores/strategy.js';
  import PastelCard from './PastelCard.svelte';
  import PastelButton from './PastelButton.svelte';

  export let show = false;
  export let playerHand = [];
  export let dealerUpCard = null;
  export let canDouble = false;
  export let canSplit = false;
  export let canSurrender = false;

  let activeTab = 'basic'; // 'basic', 'counting', 'stats'

  $: recommendedAction = dealerUpCard && playerHand.length > 0
    ? strategyActions.getBasicStrategyAction(playerHand, dealerUpCard, canDouble, canSplit, canSurrender)
    : null;

  $: hint = dealerUpCard && playerHand.length > 0
    ? strategyActions.generateHint(playerHand, dealerUpCard, canDouble, canSplit, canSurrender)
    : null;

  function closeHelper() {
    show = false;
  }

  function getActionColor(action) {
    const colors = {
      'hit': 'bg-blue-100 text-blue-800 border-blue-200',
      'stand': 'bg-green-100 text-green-800 border-green-200',
      'double': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'split': 'bg-purple-100 text-purple-800 border-purple-200',
      'surrender': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-200';
  }

  function getCountColor(count) {
    if (count > 2) return 'text-green-600 font-bold';
    if (count < -2) return 'text-red-600 font-bold';
    return 'text-gray-600';
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeHelper();
    }
  }

  // 기본 전략 차트 데이터
  const basicStrategyChart = {
    // 딜러 업카드
    dealerCards: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    // 플레이어 핸드와 추천 액션
    hardHands: [
      { hand: '5-8', actions: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H'] },
      { hand: '9', actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
      { hand: '10', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] },
      { hand: '11', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H'] },
      { hand: '12', actions: ['H', 'H', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
      { hand: '13-16', actions: ['S', 'S', 'S', 'S', 'S', 'H', 'H', 'H', 'H', 'H'] },
      { hand: '17-21', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] }
    ],
    softHands: [
      { hand: 'A,2-A,3', actions: ['H', 'H', 'H', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
      { hand: 'A,4-A,5', actions: ['H', 'H', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
      { hand: 'A,6', actions: ['H', 'D', 'D', 'D', 'D', 'H', 'H', 'H', 'H', 'H'] },
      { hand: 'A,7', actions: ['S', 'D', 'D', 'D', 'D', 'S', 'S', 'H', 'H', 'H'] },
      { hand: 'A,8-A,9', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] }
    ],
    pairs: [
      { hand: 'A,A', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
      { hand: '2,2-3,3', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] },
      { hand: '4,4', actions: ['H', 'H', 'H', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] },
      { hand: '5,5', actions: ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'H', 'H'] },
      { hand: '6,6', actions: ['P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H', 'H'] },
      { hand: '7,7', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'H', 'H', 'H', 'H'] },
      { hand: '8,8', actions: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
      { hand: '9,9', actions: ['P', 'P', 'P', 'P', 'P', 'S', 'P', 'P', 'S', 'S'] },
      { hand: '10,10', actions: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] }
    ]
  };

  function getActionDisplay(action) {
    const displays = {
      'H': '히트',
      'S': '스탠드',
      'D': '더블',
      'P': '스플릿',
      'R': '항복'
    };
    return displays[action] || action;
  }

  function getActionCellColor(action) {
    const colors = {
      'H': 'bg-blue-100 text-blue-800',
      'S': 'bg-green-100 text-green-800',
      'D': 'bg-yellow-100 text-yellow-800',
      'P': 'bg-purple-100 text-purple-800',
      'R': 'bg-red-100 text-red-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closeHelper}>
    <div class="bg-white rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" on:click|stopPropagation>

      <!-- 헤더 -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">🧠 전략 도우미</h2>
        <button on:click={closeHelper} class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>

      <!-- 탭 메뉴 -->
      <div class="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'basic' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
          on:click={() => activeTab = 'basic'}
        >
          기본 전략
        </button>
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'counting' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
          on:click={() => activeTab = 'counting'}
        >
          카드 카운팅
        </button>
        <button
          class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                 {activeTab === 'stats' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
          on:click={() => activeTab = 'stats'}
        >
          통계
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        {#if activeTab === 'basic'}
          <!-- 기본 전략 탭 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 현재 상황 분석 -->
            <PastelCard>
              <h3 class="text-xl font-bold mb-4 text-gray-800">📊 현재 상황 분석</h3>

              {#if hint}
                <div class="space-y-4">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium text-gray-700">추천 액션:</span>
                      <span class="px-3 py-1 rounded-full text-sm font-bold border {getActionColor(recommendedAction)}">
                        {strategyActions.translateAction(recommendedAction)}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">{hint.explanation}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="bg-blue-50 rounded-lg p-3">
                      <div class="font-medium text-blue-800">플레이어 핸드</div>
                      <div class="text-2xl text-blue-600">{hint.playerValue}</div>
                    </div>
                    <div class="bg-red-50 rounded-lg p-3">
                      <div class="font-medium text-red-800">딜러 업카드</div>
                      <div class="text-2xl text-red-600">{hint.dealerValue}</div>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <span class="text-xs text-gray-500">옵션:</span>
                    {#if canDouble}
                      <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">더블 가능</span>
                    {/if}
                    {#if canSplit}
                      <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">스플릿 가능</span>
                    {/if}
                    {#if canSurrender}
                      <span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">항복 가능</span>
                    {/if}
                  </div>
                </div>
              {:else}
                <div class="text-center text-gray-500 py-8">
                  게임이 시작되면 전략 분석이 표시됩니다.
                </div>
              {/if}
            </PastelCard>

            <!-- 기본 전략 차트 -->
            <PastelCard>
              <h3 class="text-xl font-bold mb-4 text-gray-800">📋 기본 전략 차트</h3>

              <div class="space-y-4 text-xs">
                <!-- 하드 핸드 -->
                <div>
                  <h4 class="font-bold text-gray-700 mb-2">하드 핸드</h4>
                  <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                      <thead>
                        <tr>
                          <th class="border p-1 bg-gray-100 text-gray-700">핸드</th>
                          {#each basicStrategyChart.dealerCards as card}
                            <th class="border p-1 bg-gray-100 text-gray-700 min-w-8">{card}</th>
                          {/each}
                        </tr>
                      </thead>
                      <tbody>
                        {#each basicStrategyChart.hardHands as row}
                          <tr>
                            <td class="border p-1 font-medium bg-gray-50">{row.hand}</td>
                            {#each row.actions as action}
                              <td class="border p-1 text-center {getActionCellColor(action)}">{action}</td>
                            {/each}
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 소프트 핸드 -->
                <div>
                  <h4 class="font-bold text-gray-700 mb-2">소프트 핸드</h4>
                  <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                      <thead>
                        <tr>
                          <th class="border p-1 bg-gray-100 text-gray-700">핸드</th>
                          {#each basicStrategyChart.dealerCards as card}
                            <th class="border p-1 bg-gray-100 text-gray-700 min-w-8">{card}</th>
                          {/each}
                        </tr>
                      </thead>
                      <tbody>
                        {#each basicStrategyChart.softHands as row}
                          <tr>
                            <td class="border p-1 font-medium bg-gray-50">{row.hand}</td>
                            {#each row.actions as action}
                              <td class="border p-1 text-center {getActionCellColor(action)}">{action}</td>
                            {/each}
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- 페어 -->
                <div>
                  <h4 class="font-bold text-gray-700 mb-2">페어</h4>
                  <div class="overflow-x-auto">
                    <table class="w-full border-collapse">
                      <thead>
                        <tr>
                          <th class="border p-1 bg-gray-100 text-gray-700">페어</th>
                          {#each basicStrategyChart.dealerCards as card}
                            <th class="border p-1 bg-gray-100 text-gray-700 min-w-8">{card}</th>
                          {/each}
                        </tr>
                      </thead>
                      <tbody>
                        {#each basicStrategyChart.pairs as row}
                          <tr>
                            <td class="border p-1 font-medium bg-gray-50">{row.hand}</td>
                            {#each row.actions as action}
                              <td class="border p-1 text-center {getActionCellColor(action)}">{action}</td>
                            {/each}
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="mt-4 text-xs text-gray-600">
                <div class="grid grid-cols-5 gap-2">
                  <div><span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">H</span> 히트</div>
                  <div><span class="px-2 py-1 bg-green-100 text-green-800 rounded">S</span> 스탠드</div>
                  <div><span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">D</span> 더블</div>
                  <div><span class="px-2 py-1 bg-purple-100 text-purple-800 rounded">P</span> 스플릿</div>
                  <div><span class="px-2 py-1 bg-red-100 text-red-800 rounded">R</span> 항복</div>
                </div>
              </div>
            </PastelCard>
          </div>

        {:else if activeTab === 'counting'}
          <!-- 카드 카운팅 탭 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PastelCard>
              <h3 class="text-xl font-bold mb-4 text-gray-800">🔢 카드 카운팅 (Hi-Lo)</h3>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-700">카운팅 모드</span>
                  <button
                    on:click={strategyActions.toggleCardCounting}
                    class="px-4 py-2 rounded-lg {$strategyStore.cardCountingMode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}"
                  >
                    {$strategyStore.cardCountingMode ? '활성화' : '비활성화'}
                  </button>
                </div>

                {#if $strategyStore.cardCountingMode}
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-50 rounded-lg p-4 text-center">
                      <div class="text-sm text-blue-700 mb-1">러닝 카운트</div>
                      <div class="text-3xl font-bold {getCountColor($strategyStore.runningCount)}">
                        {$strategyStore.runningCount > 0 ? '+' : ''}{$strategyStore.runningCount}
                      </div>
                    </div>
                    <div class="bg-green-50 rounded-lg p-4 text-center">
                      <div class="text-sm text-green-700 mb-1">트루 카운트</div>
                      <div class="text-3xl font-bold {getCountColor($strategyStore.trueCount)}">
                        {$strategyStore.trueCount > 0 ? '+' : ''}{$strategyStore.trueCount}
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="font-medium text-gray-700">딜링된 카드</div>
                      <div class="text-lg text-gray-600">{$strategyStore.cardsDealt}장</div>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-3">
                      <div class="font-medium text-gray-700">남은 덱</div>
                      <div class="text-lg text-gray-600">{$strategyStore.decksRemaining.toFixed(1)}덱</div>
                    </div>
                  </div>

                  {#if $strategyStore.trueCount > 1}
                    <div class="bg-green-100 border border-green-200 rounded-lg p-4">
                      <div class="font-bold text-green-800 mb-2">유리한 상황!</div>
                      <div class="text-sm text-green-700">
                        트루 카운트가 {$strategyStore.trueCount}입니다. 베팅을 늘리는 것을 고려해보세요.
                      </div>
                    </div>
                  {:else if $strategyStore.trueCount < -1}
                    <div class="bg-red-100 border border-red-200 rounded-lg p-4">
                      <div class="font-bold text-red-800 mb-2">불리한 상황</div>
                      <div class="text-sm text-red-700">
                        트루 카운트가 {$strategyStore.trueCount}입니다. 최소 베팅을 권장합니다.
                      </div>
                    </div>
                  {/if}

                  <PastelButton variant="secondary" on:click={strategyActions.resetCardCount}>
                    카운트 리셋
                  </PastelButton>
                {:else}
                  <div class="text-center text-gray-500 py-8">
                    카운팅 모드를 활성화하면 Hi-Lo 시스템을 사용한<br>
                    카드 카운팅 정보가 표시됩니다.
                  </div>
                {/if}
              </div>
            </PastelCard>

            <PastelCard>
              <h3 class="text-xl font-bold mb-4 text-gray-800">📚 카운팅 시스템 가이드</h3>

              <div class="space-y-4 text-sm">
                <div>
                  <h4 class="font-bold text-gray-700 mb-2">Hi-Lo 카운팅 값</h4>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="text-center p-2 bg-red-50 rounded">
                      <div class="font-bold text-red-700">+1</div>
                      <div class="text-xs text-red-600">2, 3, 4, 5, 6</div>
                    </div>
                    <div class="text-center p-2 bg-gray-50 rounded">
                      <div class="font-bold text-gray-700">0</div>
                      <div class="text-xs text-gray-600">7, 8, 9</div>
                    </div>
                    <div class="text-center p-2 bg-blue-50 rounded">
                      <div class="font-bold text-blue-700">-1</div>
                      <div class="text-xs text-blue-600">10, J, Q, K, A</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-bold text-gray-700 mb-2">베팅 전략</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span>트루 카운트 +1 이하:</span>
                      <span class="font-medium">최소 베팅</span>
                    </div>
                    <div class="flex justify-between">
                      <span>트루 카운트 +2:</span>
                      <span class="font-medium">1.5배 베팅</span>
                    </div>
                    <div class="flex justify-between">
                      <span>트루 카운트 +3:</span>
                      <span class="font-medium">2배 베팅</span>
                    </div>
                    <div class="flex justify-between">
                      <span>트루 카운트 +4 이상:</span>
                      <span class="font-medium">3-4배 베팅</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 class="font-bold text-gray-700 mb-2">주의사항</h4>
                  <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>카드 카운팅은 수학적 기법이지만 완벽하지 않습니다</li>
                    <li>실제 카지노에서는 금지된 행위일 수 있습니다</li>
                    <li>연습을 통해서만 기술을 습득할 수 있습니다</li>
                    <li>자금 관리가 가장 중요합니다</li>
                  </ul>
                </div>
              </div>
            </PastelCard>
          </div>

        {:else if activeTab === 'stats'}
          <!-- 통계 탭 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PastelCard>
              <h3 class="text-xl font-bold mb-4 text-gray-800">📈 전략 정확도</h3>

              <div class="space-y-4">
                <div class="text-center">
                  <div class="text-6xl font-bold mb-2 {$strategyStore.strategyStats.accuracy >= 80 ? 'text-green-600' : $strategyStore.strategyStats.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}">
                    {$strategyStore.strategyStats.accuracy.toFixed(1)}%
                  </div>
                  <div class="text-gray-600">전략 정확도</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-green-50 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-green-600">{$strategyStore.strategyStats.correctPlays}</div>
                    <div class="text-sm text-green-700">정확한 플레이</div>
                  </div>
                  <div class="bg-blue-50 rounded-lg p-4 text-center">
                    <div class="text-2xl font-bold text-blue-600">{$strategyStore.strategyStats.totalPlays}</div>
                    <div class="text-sm text-blue-700">총 플레이</div>
                  </div>
                </div>

                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div
                      class="h-3 rounded-full transition-all duration-300 {$strategyStore.strategyStats.accuracy >= 80 ? 'bg-green-500' : $strategyStore.strategyStats.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}"
                      style="width: {$strategyStore.strategyStats.accuracy}%"
                    ></div>
                  </div>
                  <div class="text-xs text-gray-600 mt-2 text-center">
                    {#if $strategyStore.strategyStats.accuracy >= 80}
                      훌륭합니다! 기본 전략을 잘 이해하고 있습니다.
                    {:else if $strategyStore.strategyStats.accuracy >= 60}
                      좋습니다! 조금 더 연습하면 완벽해집니다.
                    {:else if $strategyStore.strategyStats.totalPlays > 0}
                      더 많은 연습이 필요합니다.
                    {:else}
                      게임을 시작하여 전략을 연습해보세요!
                    {/if}
                  </div>
                </div>

                <PastelButton variant="secondary" on:click={strategyActions.resetStats}>
                  통계 리셋
                </PastelButton>
              </div>
            </PastelCard>

            <PastelCard>
              <h3 class="text-xl font-bold mb-4 text-gray-800">🎯 학습 팁</h3>

              <div class="space-y-4 text-sm">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 class="font-bold text-blue-800 mb-2">💡 기본 전략 학습법</h4>
                  <ul class="space-y-1 text-blue-700 text-xs list-disc list-inside">
                    <li>하드 핸드부터 외우기 시작하세요</li>
                    <li>딜러 업카드 2-6은 약한 카드입니다</li>
                    <li>딜러 업카드 7-A는 강한 카드입니다</li>
                    <li>항상 8,8과 A,A는 스플릿하세요</li>
                    <li>10,10은 절대 스플릿하지 마세요</li>
                  </ul>
                </div>

                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 class="font-bold text-green-800 mb-2">📊 자금 관리</h4>
                  <ul class="space-y-1 text-green-700 text-xs list-disc list-inside">
                    <li>전체 자금의 1-2%만 베팅하세요</li>
                    <li>연승했다고 베팅을 크게 늘리지 마세요</li>
                    <li>손실 한도를 미리 정하세요</li>
                    <li>감정적으로 플레이하지 마세요</li>
                  </ul>
                </div>

                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 class="font-bold text-yellow-800 mb-2">⚠️ 주의사항</h4>
                  <ul class="space-y-1 text-yellow-700 text-xs list-disc list-inside">
                    <li>기본 전략도 100% 승리를 보장하지 않습니다</li>
                    <li>단기적으로는 운이 더 중요할 수 있습니다</li>
                    <li>장기적 관점에서 접근하세요</li>
                    <li>도박 중독에 주의하세요</li>
                  </ul>
                </div>
              </div>
            </PastelCard>
          </div>
        {/if}
      </div>

      <!-- 하단 버튼 -->
      <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <div class="flex gap-3">
          <PastelButton
            variant={$strategyStore.showBasicStrategy ? 'primary' : 'secondary'}
            on:click={strategyActions.toggleBasicStrategy}
          >
            {$strategyStore.showBasicStrategy ? '전략 숨기기' : '전략 표시'}
          </PastelButton>
          <PastelButton
            variant={$strategyStore.showHints ? 'primary' : 'secondary'}
            on:click={strategyActions.toggleHints}
          >
            {$strategyStore.showHints ? '힌트 끄기' : '힌트 켜기'}
          </PastelButton>
        </div>

        <PastelButton variant="secondary" on:click={closeHelper}>
          닫기
        </PastelButton>
      </div>
    </div>
  </div>
{/if}

<style>
  /* 테이블 스타일 */
  table {
    font-size: 11px;
  }

  th, td {
    min-width: 30px;
    max-width: 40px;
    padding: 4px 2px;
  }
</style>