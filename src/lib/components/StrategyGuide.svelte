<script>
  import { createEventDispatcher } from 'svelte';
  import PastelCard from './PastelCard.svelte';
  import PastelButton from './PastelButton.svelte';

  export let gameType = 'blackjack'; // 'blackjack', 'baccarat', 'roulette'
  export let currentGameState = null;
  export let userLevel = 'beginner'; // 'beginner', 'intermediate', 'advanced'
  export let isVisible = true;

  const dispatch = createEventDispatcher();

  let selectedStrategy = null;
  let showAdvancedTips = false;

  // 블랙잭 기본 전략 차트
  const blackjackBasicStrategy = {
    'hard': {
      '5-8': { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
      '9': { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
      '10': { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'H', 'A': 'H' },
      '11': { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'D', 'A': 'D' },
      '12': { '2': 'H', '3': 'H', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
      '13-16': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
      '17-21': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' }
    },
    'soft': {
      'A,2-A,3': { '2': 'H', '3': 'H', '4': 'H', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
      'A,4-A,5': { '2': 'H', '3': 'H', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
      'A,6': { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
      'A,7': { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'S', '8': 'S', '9': 'H', '10': 'H', 'A': 'H' },
      'A,8-A,9': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'D', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' }
    },
    'pairs': {
      'A,A': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'Y', '9': 'Y', '10': 'Y', 'A': 'Y' },
      '10,10': { '2': 'N', '3': 'N', '4': 'N', '5': 'N', '6': 'N', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },
      '9,9': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'N', '8': 'Y', '9': 'Y', '10': 'N', 'A': 'N' },
      '8,8': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'Y', '9': 'Y', '10': 'Y', 'A': 'Y' },
      '7,7': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },
      '6,6': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },
      '5,5': { '2': 'N', '3': 'N', '4': 'N', '5': 'N', '6': 'N', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },
      '4,4': { '2': 'N', '3': 'N', '4': 'N', '5': 'Y', '6': 'Y', '7': 'N', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' },
      '2,2-3,3': { '2': 'Y', '3': 'Y', '4': 'Y', '5': 'Y', '6': 'Y', '7': 'Y', '8': 'N', '9': 'N', '10': 'N', 'A': 'N' }
    }
  };

  // 전략 가이드 데이터
  const strategies = {
    blackjack: {
      beginner: [
        {
          title: '기본 규칙 이해하기',
          icon: '📚',
          content: [
            '21을 넘지 않으면서 딜러보다 높은 수를 만드는 것이 목표',
            'A는 1 또는 11, 그림카드는 10으로 계산',
            '딜러는 17 이상에서 의무적으로 스탠드',
            '블랙잭(A + 10)은 3:2로 배당'
          ],
          tips: [
            '절대 21을 넘지 마세요',
            '딜러의 업카드를 항상 확인하세요',
            '감정에 휘둘리지 말고 차분하게 플레이하세요'
          ]
        },
        {
          title: '기본 전략 익히기',
          icon: '🎯',
          content: [
            '12-16: 딜러가 2-6이면 스탠드, 7 이상이면 히트',
            '17 이상: 항상 스탠드',
            '11 이하: 항상 히트',
            'A,A와 8,8은 항상 스플릿'
          ],
          tips: [
            '기본 전략표를 외우는 것이 가장 중요합니다',
            '직감보다는 수학적 확률을 따르세요',
            '충분히 연습한 후 실전에 임하세요'
          ]
        }
      ],
      intermediate: [
        {
          title: '고급 베팅 전략',
          icon: '💰',
          content: [
            '더블다운: 9, 10, 11에서 유리할 때 사용',
            '스플릿: 같은 카드 2장을 분할하여 플레이',
            '인슈어런스: 딜러가 A를 보여줄 때의 보험',
            '항복: 매우 불리한 상황에서 손실 최소화'
          ],
          tips: [
            '더블다운은 11에서 가장 효과적입니다',
            '10,10은 절대 스플릿하지 마세요',
            '인슈어런스는 대부분 손해입니다'
          ]
        },
        {
          title: '카드 카운팅 기초',
          icon: '🧮',
          content: [
            'Hi-Lo 시스템: 2-6(+1), 7-9(0), 10-A(-1)',
            'True Count: Running Count ÷ 남은 덱 수',
            'True Count가 +2 이상일 때 베팅 증가',
            '카지노에서 금지되므로 조심스럽게 사용'
          ],
          tips: [
            '연습 없이는 실전에서 사용하지 마세요',
            '자연스럽게 카운팅하는 것이 중요합니다',
            '과도한 베팅 변화는 피하세요'
          ]
        }
      ],
      advanced: [
        {
          title: '완벽한 기본 전략',
          icon: '🏆',
          content: [
            '모든 상황에서 수학적으로 최적의 선택',
            '하우스 엣지를 0.5% 이하로 줄일 수 있음',
            '감정이 아닌 확률에 기반한 의사결정',
            '장기적으로 가장 안정적인 수익률 보장'
          ],
          tips: [
            '100% 정확한 기본 전략 실행이 필수입니다',
            '예외 상황도 모두 숙지해야 합니다',
            '압박감 속에서도 정확한 판단이 중요합니다'
          ]
        }
      ]
    },
    baccarat: {
      beginner: [
        {
          title: '바카라 기본 이해',
          icon: '🎴',
          content: [
            '플레이어와 뱅커 중 9에 가까운 쪽을 맞히는 게임',
            '카드 합의 일의 자리만 유효 (9가 최고)',
            '세 가지 베팅: 플레이어, 뱅커, 타이',
            '뱅커 베팅이 가장 유리함 (하우스 엣지 1.06%)'
          ],
          tips: [
            '뱅커에 베팅하는 것이 가장 안전합니다',
            '타이 베팅은 피하는 것이 좋습니다',
            '패턴을 찾으려 하지 마세요'
          ]
        }
      ],
      intermediate: [
        {
          title: '베팅 패턴 관리',
          icon: '📊',
          content: [
            '플랫 베팅: 항상 같은 금액으로 베팅',
            '마틴게일: 질 때마다 베팅 금액 2배 증가',
            '패롤리: 이길 때마다 베팅 금액 증가',
            '1-3-2-6 시스템: 정해진 순서로 베팅'
          ],
          tips: [
            '자금 관리가 가장 중요합니다',
            '연속 손실에 대비하세요',
            '목표 수익에 도달하면 그만두세요'
          ]
        }
      ],
      advanced: [
        {
          title: '고급 전략과 분석',
          icon: '🔬',
          content: [
            '슈 컴포지션 분석',
            '베팅 타이밍 최적화',
            '수수료 고려한 뱅커 베팅',
            '심리적 압박감 관리'
          ],
          tips: [
            '통계적 사고가 중요합니다',
            '감정적 베팅을 피하세요',
            '장기적 관점을 유지하세요'
          ]
        }
      ]
    },
    roulette: {
      beginner: [
        {
          title: '룰렛 기본 이해',
          icon: '🎡',
          content: [
            '0-36번 중 공이 멈출 번호 예측',
            '인사이드 베팅: 특정 번호에 베팅',
            '아웃사이드 베팅: 색상, 홀짝, 구간 베팅',
            '유럽식 룰렛이 아메리칸보다 유리'
          ],
          tips: [
            '아웃사이드 베팅이 더 안전합니다',
            '한 번에 많은 금액을 걸지 마세요',
            '운에 의존하는 게임임을 인지하세요'
          ]
        }
      ],
      intermediate: [
        {
          title: '베팅 시스템 활용',
          icon: '⚖️',
          content: [
            '마틴게일: 질 때마다 2배씩 증가',
            '피보나치: 피보나치 수열로 베팅',
            '달랑베르: 질 때 +1, 이길 때 -1',
            '제임스 본드: 고정 패턴 베팅'
          ],
          tips: [
            '시스템만으로는 하우스 엣지를 이길 수 없습니다',
            '자금 한계를 정하고 지키세요',
            '어떤 시스템도 완벽하지 않습니다'
          ]
        }
      ],
      advanced: [
        {
          title: '확률과 기댓값',
          icon: '🧮',
          content: [
            '각 베팅의 정확한 확률 계산',
            '하우스 엣지 최소화 전략',
            '분산과 표준편차 이해',
            '장기적 수익률 분석'
          ],
          tips: [
            '수학적 사실을 받아들이세요',
            '완벽한 전략은 존재하지 않습니다',
            '엔터테인먼트로 즐기세요'
          ]
        }
      ]
    }
  };

  function getActionText(action) {
    const actions = {
      'H': 'HIT (히트)',
      'S': 'STAND (스탠드)',
      'D': 'DOUBLE (더블다운)',
      'Y': 'SPLIT (스플릿)',
      'N': 'NO SPLIT (스플릿 안함)'
    };
    return actions[action] || action;
  }

  function getActionColor(action) {
    const colors = {
      'H': 'bg-blue-100 text-blue-800',
      'S': 'bg-red-100 text-red-800',
      'D': 'bg-green-100 text-green-800',
      'Y': 'bg-yellow-100 text-yellow-800',
      'N': 'bg-gray-100 text-gray-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  }

  function applyStrategy(strategy) {
    dispatch('applyStrategy', strategy);
  }

  function showStrategyDetails(strategy) {
    selectedStrategy = strategy;
  }

  $: currentStrategies = strategies[gameType]?.[userLevel] || [];
</script>

{#if isVisible}
<div class="strategy-guide space-y-6">
  <!-- 헤더 -->
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold">
      🎓 {gameType === 'blackjack' ? '블랙잭' : gameType === 'baccarat' ? '바카라' : '룰렛'} 전략 가이드
    </h2>

    <div class="flex gap-2">
      <select bind:value={userLevel} class="px-3 py-1 rounded-lg border border-gray-300 text-sm">
        <option value="beginner">초급</option>
        <option value="intermediate">중급</option>
        <option value="advanced">고급</option>
      </select>

      <button
        on:click={() => showAdvancedTips = !showAdvancedTips}
        class="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-sm hover:bg-blue-200"
      >
        {showAdvancedTips ? '기본' : '고급'} 팁
      </button>
    </div>
  </div>

  <!-- 블랙잭 기본 전략표 -->
  {#if gameType === 'blackjack' && showAdvancedTips}
    <PastelCard>
      <h3 class="font-bold text-lg mb-4">📋 블랙잭 기본 전략표</h3>

      <div class="overflow-x-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Hard Totals -->
          <div>
            <h4 class="font-semibold mb-2">Hard Totals</h4>
            <div class="text-xs">
              <div class="grid grid-cols-11 gap-1">
                <div class="font-bold">핸드/딜러</div>
                {#each ['2','3','4','5','6','7','8','9','10','A'] as dealer}
                  <div class="font-bold text-center">{dealer}</div>
                {/each}

                {#each Object.entries(blackjackBasicStrategy.hard) as [player, actions]}
                  <div class="font-bold">{player}</div>
                  {#each Object.values(actions) as action}
                    <div class="text-center p-1 rounded text-xs {getActionColor(action)}">
                      {action}
                    </div>
                  {/each}
                {/each}
              </div>
            </div>
          </div>

          <!-- Soft Totals -->
          <div>
            <h4 class="font-semibold mb-2">Soft Totals</h4>
            <div class="text-xs">
              <div class="grid grid-cols-11 gap-1">
                <div class="font-bold">핸드/딜러</div>
                {#each ['2','3','4','5','6','7','8','9','10','A'] as dealer}
                  <div class="font-bold text-center">{dealer}</div>
                {/each}

                {#each Object.entries(blackjackBasicStrategy.soft) as [player, actions]}
                  <div class="font-bold text-xs">{player}</div>
                  {#each Object.values(actions) as action}
                    <div class="text-center p-1 rounded text-xs {getActionColor(action)}">
                      {action}
                    </div>
                  {/each}
                {/each}
              </div>
            </div>
          </div>

          <!-- Pairs -->
          <div>
            <h4 class="font-semibold mb-2">Pairs</h4>
            <div class="text-xs">
              <div class="grid grid-cols-11 gap-1">
                <div class="font-bold">페어/딜러</div>
                {#each ['2','3','4','5','6','7','8','9','10','A'] as dealer}
                  <div class="font-bold text-center">{dealer}</div>
                {/each}

                {#each Object.entries(blackjackBasicStrategy.pairs) as [player, actions]}
                  <div class="font-bold text-xs">{player}</div>
                  {#each Object.values(actions) as action}
                    <div class="text-center p-1 rounded text-xs {getActionColor(action)}">
                      {action}
                    </div>
                  {/each}
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 text-sm text-gray-600">
        <p><strong>범례:</strong> H=히트, S=스탠드, D=더블다운, Y=스플릿, N=스플릿안함</p>
      </div>
    </PastelCard>
  {/if}

  <!-- 전략 가이드 목록 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each currentStrategies as strategy}
      <PastelCard hover={true}>
        <div class="cursor-pointer" on:click={() => showStrategyDetails(strategy)}>
          <div class="flex items-center mb-3">
            <div class="text-3xl mr-3">{strategy.icon}</div>
            <h3 class="font-bold text-lg">{strategy.title}</h3>
          </div>

          <div class="space-y-2 mb-4">
            {#each strategy.content.slice(0, 2) as content}
              <p class="text-sm text-gray-700">• {content}</p>
            {/each}
            {#if strategy.content.length > 2}
              <p class="text-sm text-blue-600">더 보기...</p>
            {/if}
          </div>

          <div class="flex justify-between items-center">
            <div class="text-xs text-gray-500">
              {userLevel === 'beginner' ? '초급' : userLevel === 'intermediate' ? '중급' : '고급'} 전략
            </div>
            <PastelButton size="sm" variant="secondary" on:click|stopPropagation={() => applyStrategy(strategy)}>
              적용
            </PastelButton>
          </div>
        </div>
      </PastelCard>
    {/each}
  </div>

  <!-- 전략 상세 모달 -->
  {#if selectedStrategy}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => selectedStrategy = null}>
      <div class="bg-white rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto" on:click|stopPropagation>
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <div class="text-3xl mr-3">{selectedStrategy.icon}</div>
            <h2 class="text-2xl font-bold">{selectedStrategy.title}</h2>
          </div>
          <button on:click={() => selectedStrategy = null} class="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class="font-bold mb-2">📚 주요 내용</h3>
            <ul class="space-y-1">
              {#each selectedStrategy.content as content}
                <li class="text-sm">• {content}</li>
              {/each}
            </ul>
          </div>

          <div>
            <h3 class="font-bold mb-2">💡 실전 팁</h3>
            <ul class="space-y-1">
              {#each selectedStrategy.tips as tip}
                <li class="text-sm text-blue-700">• {tip}</li>
              {/each}
            </ul>
          </div>

          <div class="flex justify-end space-x-2">
            <PastelButton variant="secondary" on:click={() => selectedStrategy = null}>
              닫기
            </PastelButton>
            <PastelButton variant="primary" on:click={() => { applyStrategy(selectedStrategy); selectedStrategy = null; }}>
              전략 적용
            </PastelButton>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- 현재 상황별 추천 -->
  {#if currentGameState}
    <PastelCard>
      <h3 class="font-bold text-lg mb-4">🎯 현재 상황 추천</h3>

      {#if gameType === 'blackjack' && currentGameState.playerHand && currentGameState.dealerUpCard}
        {@const playerTotal = currentGameState.playerTotal || 0}
        {@const dealerUpCard = currentGameState.dealerUpCard}

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold">플레이어: {playerTotal}</span>
            <span class="font-semibold">딜러 업카드: {dealerUpCard}</span>
          </div>

          <div class="text-center">
            <div class="text-lg font-bold text-blue-600 mb-2">
              추천 액션:
              {#if playerTotal < 12}HIT
              {:else if playerTotal >= 17}STAND
              {:else if dealerUpCard >= 7}HIT
              {:else}STAND
              {/if}
            </div>
            <p class="text-sm text-gray-600">기본 전략에 따른 최적의 선택입니다.</p>
          </div>
        </div>
      {:else if gameType === 'baccarat'}
        <div class="bg-green-50 rounded-lg p-4 text-center">
          <div class="text-lg font-bold text-green-600 mb-2">추천: 뱅커 베팅</div>
          <p class="text-sm text-gray-600">가장 낮은 하우스 엣지 (1.06%)를 가진 베팅입니다.</p>
        </div>
      {:else if gameType === 'roulette'}
        <div class="bg-red-50 rounded-lg p-4 text-center">
          <div class="text-lg font-bold text-red-600 mb-2">추천: 이븐 머니 베팅</div>
          <p class="text-sm text-gray-600">빨강/검정, 홀수/짝수 베팅이 가장 안전합니다.</p>
        </div>
      {/if}
    </PastelCard>
  {/if}
</div>
{/if}

<style>
  .strategy-guide {
    animation: slideInRight 0.5s ease-out;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>