<script>
  import { games } from '$lib/data/games.js';

  const baccarat = games.find(game => game.id === 'baccarat');

  const thirdCardRules = [
    { player: '0-5', action: '3번째 카드를 받습니다' },
    { player: '6-7', action: '스탠드합니다' },
    { player: '8-9', action: '내추럴 - 게임 종료' }
  ];

  const bankerRules = [
    { banker: '0-2', condition: '항상 카드를 받습니다' },
    { banker: '3', condition: '플레이어 3번째 카드가 8이 아니면 받습니다' },
    { banker: '4', condition: '플레이어 3번째 카드가 2-7이면 받습니다' },
    { banker: '5', condition: '플레이어 3번째 카드가 4-7이면 받습니다' },
    { banker: '6', condition: '플레이어 3번째 카드가 6-7이면 받습니다' },
    { banker: '7', condition: '스탠드합니다' }
  ];

  const bettingTypes = [
    { name: '플레이어 베팅', description: '플레이어가 승리할 때', payout: '1:1', commission: '없음' },
    { name: '뱅커 베팅', description: '뱅커가 승리할 때', payout: '1:1', commission: '5%' },
    { name: '타이 베팅', description: '무승부일 때', payout: '8:1', commission: '없음' },
    { name: '플레이어 페어', description: '플레이어 처음 2장이 페어', payout: '11:1', commission: '없음' },
    { name: '뱅커 페어', description: '뱅커 처음 2장이 페어', payout: '11:1', commission: '없음' }
  ];

  const strategies = [
    { title: '뱅커 베팅 선호', description: '가장 낮은 하우스 엣지 (1.06%)', icon: '🏦' },
    { title: '타이 베팅 피하기', description: '높은 하우스 엣지 (14.4%)', icon: '❌' },
    { title: '패턴 추적 자제', description: '각 게임은 독립적인 확률', icon: '📊' },
    { title: '자금 관리', description: '명확한 손실 한도 설정', icon: '💰' }
  ];
</script>

<svelte:head>
  <title>바카라 게임 규칙 및 전략 - LuckyMesh Casino</title>
  <meta name="description" content="바카라의 모든 규칙과 베팅 전략을 알아보세요. 플레이어, 뱅커, 타이 베팅의 차이점과 최적의 플레이 방법을 제공합니다." />
</svelte:head>

<!-- 페이지 헤더 -->
<section class="bg-gradient-to-r from-casino-dark to-black py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <div class="text-6xl mb-4">♠️</div>
      <h1 class="text-4xl md:text-5xl font-bold text-casino-gold mb-4">바카라 (Baccarat)</h1>
      <p class="text-xl text-gray-300 max-w-3xl mx-auto">
        우아함의 상징인 바카라, 간단한 룰과 높은 환원율로 전 세계 카지노에서 사랑받는 게임입니다.
        플레이어와 뱅커 중 9에 가까운 쪽을 선택하는 것이 전부입니다.
      </p>
    </div>
  </div>
</section>

<!-- 게임 개요 -->
<section class="py-16 bg-casino-dark">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-3xl font-bold text-casino-gold mb-6">게임 개요</h2>
        <p class="text-gray-300 text-lg leading-relaxed mb-6">
          {baccarat.description}
        </p>
        <div class="bg-black/50 rounded-xl p-6 border border-casino-gold/20">
          <h3 class="text-xl font-semibold text-casino-gold mb-4">게임 목표</h3>
          <p class="text-gray-300">{baccarat.rules.objective}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-casino-gold/20 to-yellow-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-gold font-bold">{baccarat.minBet} - {baccarat.maxBet}</div>
          <div class="text-gray-300 text-sm">베팅 범위</div>
        </div>
        <div class="bg-gradient-to-br from-casino-green/20 to-green-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-green font-bold">{baccarat.rtp}</div>
          <div class="text-gray-300 text-sm">환원율 (RTP)</div>
        </div>
        <div class="bg-gradient-to-br from-casino-red/20 to-red-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-red font-bold">{baccarat.houseEdge}</div>
          <div class="text-gray-300 text-sm">하우스 엣지</div>
        </div>
        <div class="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-purple-400 font-bold">8덱</div>
          <div class="text-gray-300 text-sm">표준 덱 수</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 카드 값 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">카드 값</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each Object.entries(baccarat.rules.cardValues) as [card, value]}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 text-center border border-casino-gold/20">
          <div class="text-4xl mb-4">
            {#if card === 'A'}🂡
            {:else if card === '2-9'}🃏
            {:else if card === '10, J, Q, K'}🂮
            {/if}
          </div>
          <div class="text-xl font-bold text-casino-gold mb-2">{card}</div>
          <div class="text-gray-300">{value}</div>
        </div>
      {/each}
    </div>

    <div class="max-w-4xl mx-auto mt-12">
      <div class="bg-gradient-to-br from-casino-gold/10 to-yellow-900/10 rounded-xl p-6 border border-casino-gold/30">
        <h3 class="text-xl font-semibold text-casino-gold mb-4 text-center">점수 계산 방법</h3>
        <p class="text-gray-300 text-center">
          두 카드의 합에서 <span class="text-casino-gold font-semibold">일의 자리 숫자만</span> 해당 패의 값이 됩니다.<br>
          예: 7 + 6 = 13 → <span class="text-casino-gold font-semibold">3점</span> | 9 + 5 = 14 → <span class="text-casino-gold font-semibold">4점</span>
        </p>
      </div>
    </div>
  </div>
</section>

<!-- 게임 진행 -->
<section class="py-16 bg-casino-dark">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">게임 진행</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">기본 규칙</h3>
        <div class="space-y-4">
          {#each baccarat.rules.basicRules as rule, index}
            <div class="flex items-start space-x-4 bg-black/30 rounded-lg p-4">
              <div class="bg-casino-gold text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <p class="text-gray-300">{rule}</p>
            </div>
          {/each}
        </div>
      </div>

      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">내추럴 (Natural)</h3>
        <div class="bg-black/30 rounded-lg p-6 mb-6">
          <p class="text-gray-300 mb-4">
            처음 2장의 카드 합이 8 또는 9가 나오면 <span class="text-casino-gold font-semibold">'내추럴'</span>이라고 하며,
            즉시 게임이 종료됩니다.
          </p>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-2xl text-casino-gold font-bold mb-1">8</div>
              <div class="text-gray-400 text-sm">내추럴 8</div>
            </div>
            <div class="text-center">
              <div class="text-2xl text-casino-gold font-bold mb-1">9</div>
              <div class="text-gray-400 text-sm">내추럴 9</div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-casino-green/10 to-green-900/10 rounded-xl p-6 border border-casino-green/30">
          <h4 class="text-casino-green font-semibold mb-3">승리 조건</h4>
          <ul class="text-gray-300 space-y-2 text-sm">
            <li>• 9에 가까운 값을 가진 쪽이 승리</li>
            <li>• 동점인 경우 타이(무승부)</li>
            <li>• 내추럴 9가 가장 강함</li>
            <li>• 내추럴 8은 일반 9를 이김</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 3번째 카드 규칙 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">3번째 카드 규칙</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- 플레이어 규칙 -->
      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">플레이어 규칙</h3>
        <div class="space-y-4">
          {#each thirdCardRules as rule}
            <div class="bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg p-4 border border-blue-500/30">
              <div class="flex justify-between items-center">
                <span class="text-blue-300 font-semibold">처음 2장 합계: {rule.player}</span>
                <span class="text-gray-300">{rule.action}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 뱅커 규칙 -->
      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">뱅커 규칙</h3>
        <div class="space-y-4">
          {#each bankerRules as rule}
            <div class="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-lg p-4 border border-red-500/30">
              <div class="text-red-300 font-semibold mb-2">뱅커 합계: {rule.banker}</div>
              <div class="text-gray-300 text-sm">{rule.condition}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto mt-12">
      <div class="bg-gradient-to-br from-casino-gold/10 to-yellow-900/10 rounded-xl p-6 border border-casino-gold/30">
        <h3 class="text-xl font-semibold text-casino-gold mb-4 text-center">중요 포인트</h3>
        <p class="text-gray-300 text-center">
          3번째 카드 규칙은 <span class="text-casino-gold font-semibold">자동으로 적용</span>되므로 플레이어가 별도로 선택할 필요가 없습니다.<br>
          딜러가 모든 규칙에 따라 카드를 배분합니다.
        </p>
      </div>
    </div>
  </div>
</section>

<!-- 베팅 종류 -->
<section class="py-16 bg-casino-dark">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">베팅 종류 및 배당률</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each bettingTypes as bet}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-casino-gold/20">
          <h3 class="text-xl font-bold text-casino-gold mb-3">{bet.name}</h3>
          <p class="text-gray-300 text-sm mb-4">{bet.description}</p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">배당률:</span>
              <span class="text-casino-green font-bold">{bet.payout}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">수수료:</span>
              <span class="text-gray-300">{bet.commission}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 전략 및 팁 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">베팅 전략</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each strategies as strategy}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-casino-gold/20">
          <div class="flex items-center space-x-4 mb-4">
            <div class="text-3xl">{strategy.icon}</div>
            <h3 class="text-xl font-bold text-casino-gold">{strategy.title}</h3>
          </div>
          <p class="text-gray-300">{strategy.description}</p>
        </div>
      {/each}
    </div>

    <div class="max-w-4xl mx-auto mt-12">
      <div class="bg-gradient-to-br from-casino-red/10 to-red-900/10 rounded-xl p-8 border border-casino-red/30">
        <h3 class="text-2xl font-bold text-casino-red mb-6 text-center">하우스 엣지 비교</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-casino-green mb-2">1.06%</div>
            <div class="text-casino-green font-semibold mb-1">뱅커 베팅</div>
            <div class="text-gray-400 text-sm">가장 유리한 베팅</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-casino-gold mb-2">1.24%</div>
            <div class="text-casino-gold font-semibold mb-1">플레이어 베팅</div>
            <div class="text-gray-400 text-sm">두 번째로 유리</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-casino-red mb-2">14.4%</div>
            <div class="text-casino-red font-semibold mb-1">타이 베팅</div>
            <div class="text-gray-400 text-sm">권장하지 않음</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA 섹션 -->
<section class="py-16 bg-gradient-to-r from-casino-gold via-yellow-600 to-casino-gold text-black">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-4xl font-bold mb-4">바카라 게임 시작하기</h2>
    <p class="text-xl mb-8 text-black/80">
      간단한 규칙과 높은 환원율의 바카라에서 우아한 게임을 즐겨보세요!
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="bg-black text-casino-gold font-bold py-4 px-8 rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg">
        바카라 플레이하기
      </button>
      <a href="/" class="bg-transparent border-2 border-black text-black font-bold py-4 px-8 rounded-lg hover:bg-black hover:text-casino-gold transition-all duration-200 text-lg">
        다른 게임 보기
      </a>
    </div>
  </div>
</section>