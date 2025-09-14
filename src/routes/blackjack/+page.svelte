<script>
  import { games } from '$lib/data/games.js';

  const blackjack = games.find(game => game.id === 'blackjack');

  const strategyTips = [
    { situation: '딜러의 오픈 카드가 2-6', action: '12 이상일 때 스탠드' },
    { situation: '딜러의 오픈 카드가 7-A', action: '17 이상일 때 스탠드' },
    { situation: 'A-A 또는 8-8', action: '항상 스플릿' },
    { situation: '10-10', action: '스플릿 금지' },
    { situation: '11에서 더블다운', action: '딜러가 A가 아닌 경우' },
    { situation: '소프트 18 (A-7)', action: '딜러 9, 10, A일 때 히트' }
  ];

  const variations = [
    { name: '클래식 블랙잭', description: '표준 룰', decks: '6덱' },
    { name: '싱글덱 블랙잭', description: '낮은 하우스 엣지', decks: '1덱' },
    { name: '블랙잭 서렌더', description: '항복 옵션 제공', decks: '6덱' }
  ];
</script>

<svelte:head>
  <title>블랙잭 게임 규칙 및 전략 - LuckyMesh Casino</title>
  <meta name="description" content="블랙잭의 기본 규칙부터 고급 전략까지 완벽 가이드. 하우스 엣지를 낮추고 승률을 높이는 방법을 알아보세요." />
</svelte:head>

<!-- 페이지 헤더 -->
<section class="bg-gradient-to-r from-casino-dark to-black py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <div class="text-6xl mb-4">🃏</div>
      <h1 class="text-4xl md:text-5xl font-bold text-casino-gold mb-4">블랙잭 (Blackjack)</h1>
      <p class="text-xl text-gray-300 max-w-3xl mx-auto">
        전 세계에서 가장 사랑받는 카드 게임, 블랙잭의 모든 것을 알아보세요.
        기본 규칙부터 고급 전략까지 완벽 가이드를 제공합니다.
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
          {blackjack.description}
        </p>
        <div class="bg-black/50 rounded-xl p-6 border border-casino-gold/20">
          <h3 class="text-xl font-semibold text-casino-gold mb-4">게임 목표</h3>
          <p class="text-gray-300">{blackjack.rules.objective}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-casino-gold/20 to-yellow-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-gold font-bold">{blackjack.minBet} - {blackjack.maxBet}</div>
          <div class="text-gray-300 text-sm">베팅 범위</div>
        </div>
        <div class="bg-gradient-to-br from-casino-green/20 to-green-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-green font-bold">{blackjack.rtp}</div>
          <div class="text-gray-300 text-sm">환원율 (RTP)</div>
        </div>
        <div class="bg-gradient-to-br from-casino-red/20 to-red-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-red font-bold">{blackjack.houseEdge}</div>
          <div class="text-gray-300 text-sm">하우스 엣지</div>
        </div>
        <div class="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-purple-400 font-bold">6덱</div>
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
      {#each Object.entries(blackjack.rules.cardValues) as [card, value]}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 text-center border border-casino-gold/20">
          <div class="text-4xl mb-4">
            {#if card === 'A'}🂡
            {:else if card === 'K, Q, J'}🂮
            {:else}🃏
            {/if}
          </div>
          <div class="text-xl font-bold text-casino-gold mb-2">{card}</div>
          <div class="text-gray-300">{value}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 게임 규칙 -->
<section class="py-16 bg-casino-dark">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">게임 규칙</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">기본 규칙</h3>
        <div class="space-y-4">
          {#each blackjack.rules.basicRules as rule, index}
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
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">플레이어 옵션</h3>
        <div class="space-y-4">
          <div class="bg-black/30 rounded-lg p-4">
            <h4 class="text-casino-gold font-semibold mb-2">히트 (Hit)</h4>
            <p class="text-gray-300 text-sm">카드를 한 장 더 받습니다.</p>
          </div>
          <div class="bg-black/30 rounded-lg p-4">
            <h4 class="text-casino-gold font-semibold mb-2">스탠드 (Stand)</h4>
            <p class="text-gray-300 text-sm">더 이상 카드를 받지 않습니다.</p>
          </div>
          <div class="bg-black/30 rounded-lg p-4">
            <h4 class="text-casino-gold font-semibold mb-2">더블다운 (Double Down)</h4>
            <p class="text-gray-300 text-sm">베팅을 두 배로 늘리고 카드를 한 장만 더 받습니다.</p>
          </div>
          <div class="bg-black/30 rounded-lg p-4">
            <h4 class="text-casino-gold font-semibold mb-2">스플릿 (Split)</h4>
            <p class="text-gray-300 text-sm">같은 값의 카드 2장을 받았을 때 두 개의 패로 나누어 플레이합니다.</p>
          </div>
          <div class="bg-black/30 rounded-lg p-4">
            <h4 class="text-casino-gold font-semibold mb-2">인슈어런스 (Insurance)</h4>
            <p class="text-gray-300 text-sm">딜러의 오픈 카드가 A일 때 딜러의 블랙잭에 보험을 걸 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 배당률 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">배당률 (Payout)</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each blackjack.payouts as payout}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 text-center border border-casino-gold/20">
          <h4 class="text-casino-gold font-semibold mb-3">{payout.condition}</h4>
          <div class="text-2xl font-bold text-white">{payout.payout}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 기본 전략 -->
<section class="py-16 bg-casino-dark">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">기본 전략</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">전략 팁</h3>
        <div class="space-y-4">
          {#each strategyTips as tip}
            <div class="bg-black/30 rounded-lg p-4">
              <div class="text-casino-gold font-semibold mb-2">{tip.situation}</div>
              <div class="text-gray-300">{tip.action}</div>
            </div>
          {/each}
        </div>
      </div>

      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">중요 포인트</h3>
        <div class="bg-gradient-to-br from-casino-gold/10 to-yellow-900/10 rounded-xl p-6 border border-casino-gold/30">
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <span class="text-casino-gold text-xl">💡</span>
              <span class="text-gray-300">기본 전략을 완벽히 익히면 하우스 엣지를 0.5%까지 낮출 수 있습니다.</span>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-casino-green text-xl">✅</span>
              <span class="text-gray-300">감정적인 판단보다는 수학적 확률에 기반해 플레이하세요.</span>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-casino-red text-xl">❌</span>
              <span class="text-gray-300">인슈어런스 베팅은 일반적으로 권장되지 않습니다.</span>
            </div>
            <div class="flex items-center space-x-3">
              <span class="text-purple-400 text-xl">🎯</span>
              <span class="text-gray-300">카드 카운팅은 이론적으로 가능하지만 실제 카지노에서는 제한됩니다.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 게임 변형 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">블랙잭 변형 게임</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each variations as variation}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-casino-gold/20">
          <h3 class="text-xl font-bold text-casino-gold mb-3">{variation.name}</h3>
          <p class="text-gray-300 mb-4">{variation.description}</p>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-400">사용 덱:</span>
            <span class="text-casino-gold font-semibold">{variation.decks}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA 섹션 -->
<section class="py-16 bg-gradient-to-r from-casino-gold via-yellow-600 to-casino-gold text-black">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-4xl font-bold mb-4">블랙잭 게임 시작하기</h2>
    <p class="text-xl mb-8 text-black/80">
      이제 규칙을 익혔으니 실제 게임에서 여러분의 실력을 시험해보세요!
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="bg-black text-casino-gold font-bold py-4 px-8 rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg">
        블랙잭 플레이하기
      </button>
      <a href="/" class="bg-transparent border-2 border-black text-black font-bold py-4 px-8 rounded-lg hover:bg-black hover:text-casino-gold transition-all duration-200 text-lg">
        다른 게임 보기
      </a>
    </div>
  </div>
</section>