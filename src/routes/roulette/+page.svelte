<script>
  import { games } from '$lib/data/games.js';

  const roulette = games.find(game => game.id === 'roulette');

  const insideBets = [
    { name: '스트레이트 업', description: '단일 번호', numbers: '1개', payout: '35:1', probability: '2.7%' },
    { name: '스플릿', description: '인접한 두 번호', numbers: '2개', payout: '17:1', probability: '5.4%' },
    { name: '스트리트', description: '한 줄의 세 번호', numbers: '3개', payout: '11:1', probability: '8.1%' },
    { name: '코너', description: '네 번호의 모서리', numbers: '4개', payout: '8:1', probability: '10.8%' },
    { name: '식스 라인', description: '두 줄의 여섯 번호', numbers: '6개', payout: '5:1', probability: '16.2%' }
  ];

  const outsideBets = [
    { name: '빨강/검정', description: '빨간색 또는 검은색', coverage: '18개', payout: '1:1', probability: '48.6%' },
    { name: '홀수/짝수', description: '홀수 또는 짝수', coverage: '18개', payout: '1:1', probability: '48.6%' },
    { name: '하이/로우', description: '1-18 또는 19-36', coverage: '18개', payout: '1:1', probability: '48.6%' },
    { name: '더즌', description: '1-12, 13-24, 25-36', coverage: '12개', payout: '2:1', probability: '32.4%' },
    { name: '칼럼', description: '세로줄 12개', coverage: '12개', payout: '2:1', probability: '32.4%' }
  ];

  const strategies = [
    {
      name: '마팅게일 시스템',
      description: '패배 시 베팅 금액을 두 배로 늘리는 전략',
      pros: '단기 승리 가능성',
      cons: '큰 자금 필요, 테이블 한도',
      risk: '높음'
    },
    {
      name: '다랑베르 시스템',
      description: '패배 시 1단위 증가, 승리 시 1단위 감소',
      pros: '완만한 베팅 증가',
      cons: '연속 패배 시 손실',
      risk: '중간'
    },
    {
      name: '피보나치 시스템',
      description: '피보나치 수열을 이용한 베팅',
      pros: '점진적 회복',
      cons: '복잡한 계산',
      risk: '중간'
    },
    {
      name: '파롤리 시스템',
      description: '승리 시 베팅 금액을 두 배로 늘리는 전략',
      pros: '손실 제한',
      cons: '연속 승리 필요',
      risk: '낮음'
    }
  ];

  const tips = [
    { icon: '🎯', title: '유럽식 룰렛 선택', description: '아메리칸 룰렛보다 낮은 하우스 엣지 (2.7% vs 5.26%)' },
    { icon: '💰', title: '자금 관리', description: '총 자금의 5% 이하로 단일 베팅 제한' },
    { icon: '🎲', title: '확률 이해', description: '각 스핀은 독립적이며 이전 결과에 영향받지 않음' },
    { icon: '🕐', title: '시간 관리', description: '장시간 플레이는 판단력을 흐리게 함' }
  ];

  const wheelNumbers = {
    red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    green: [0]
  };
</script>

<svelte:head>
  <title>룰렛 게임 규칙 및 전략 - LuckyMesh Casino</title>
  <meta name="description" content="룰렛의 모든 베팅 종류와 전략을 완벽 가이드. 인사이드 베팅, 아웃사이드 베팅부터 마팅게일 시스템까지 상세히 설명합니다." />
</svelte:head>

<!-- 페이지 헤더 -->
<section class="bg-gradient-to-r from-casino-dark to-black py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <div class="text-6xl mb-4">🎰</div>
      <h1 class="text-4xl md:text-5xl font-bold text-casino-gold mb-4">룰렛 (Roulette)</h1>
      <p class="text-xl text-gray-300 max-w-3xl mx-auto">
        카지노의 여왕으로 불리는 룰렛, 돌아가는 휠에서 공이 멈출 곳을 예측하는 스릴 넘치는 게임입니다.
        다양한 베팅 옵션과 높은 배당률로 무한한 즐거움을 선사합니다.
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
          {roulette.description}
        </p>
        <div class="bg-black/50 rounded-xl p-6 border border-casino-gold/20">
          <h3 class="text-xl font-semibold text-casino-gold mb-4">게임 목표</h3>
          <p class="text-gray-300">{roulette.rules.objective}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gradient-to-br from-casino-gold/20 to-yellow-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-gold font-bold">{roulette.minBet} - {roulette.maxBet}</div>
          <div class="text-gray-300 text-sm">베팅 범위</div>
        </div>
        <div class="bg-gradient-to-br from-casino-green/20 to-green-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-green font-bold">{roulette.rtp}</div>
          <div class="text-gray-300 text-sm">환원율 (RTP)</div>
        </div>
        <div class="bg-gradient-to-br from-casino-red/20 to-red-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-casino-red font-bold">{roulette.houseEdge}</div>
          <div class="text-gray-300 text-sm">하우스 엣지</div>
        </div>
        <div class="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-xl p-6 text-center">
          <div class="text-2xl text-purple-400 font-bold">37</div>
          <div class="text-gray-300 text-sm">총 번호 (유럽식)</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 룰렛 휠 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">룰렛 휠 구성</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- 휠 시각화 -->
      <div class="text-center">
        <div class="relative w-80 h-80 mx-auto mb-8">
          <!-- 휠 배경 -->
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-amber-900 to-yellow-800 border-8 border-casino-gold shadow-2xl">
            <div class="absolute inset-4 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 border-casino-gold/50"></div>
          </div>

          <!-- 중앙 -->
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-casino-gold border-4 border-yellow-300 flex items-center justify-center text-2xl">
            🎰
          </div>

          <!-- 0 표시 -->
          <div class="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-casino-green rounded flex items-center justify-center text-white font-bold text-sm">
            0
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-casino-red/20 rounded-lg p-4 border border-casino-red/30">
            <div class="text-2xl font-bold text-casino-red mb-2">18</div>
            <div class="text-gray-300 text-sm">빨간색 번호</div>
          </div>
          <div class="bg-gray-700/50 rounded-lg p-4 border border-gray-500/30">
            <div class="text-2xl font-bold text-gray-300 mb-2">18</div>
            <div class="text-gray-300 text-sm">검은색 번호</div>
          </div>
          <div class="bg-casino-green/20 rounded-lg p-4 border border-casino-green/30">
            <div class="text-2xl font-bold text-casino-green mb-2">1</div>
            <div class="text-gray-300 text-sm">초록색 (0)</div>
          </div>
        </div>
      </div>

      <!-- 게임 진행 -->
      <div>
        <h3 class="text-2xl font-semibold text-casino-gold mb-6">게임 진행</h3>
        <div class="space-y-4">
          {#each roulette.rules.basicRules as rule, index}
            <div class="flex items-start space-x-4 bg-black/30 rounded-lg p-4">
              <div class="bg-casino-gold text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {index + 1}
              </div>
              <p class="text-gray-300">{rule}</p>
            </div>
          {/each}
        </div>

        <div class="mt-8 bg-gradient-to-br from-casino-gold/10 to-yellow-900/10 rounded-xl p-6 border border-casino-gold/30">
          <h4 class="text-xl font-semibold text-casino-gold mb-4">유럽식 vs 아메리칸 룰렛</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-casino-green font-bold text-lg">유럽식 룰렛</div>
              <div class="text-gray-300 text-sm">0 하나만 존재</div>
              <div class="text-casino-gold font-semibold">하우스 엣지: 2.7%</div>
            </div>
            <div class="text-center">
              <div class="text-casino-red font-bold text-lg">아메리칸 룰렛</div>
              <div class="text-gray-300 text-sm">0과 00 존재</div>
              <div class="text-casino-red font-semibold">하우스 엣지: 5.26%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 인사이드 베팅 -->
<section class="py-16 bg-casino-dark">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">인사이드 베팅 (Inside Bets)</h2>
    <p class="text-gray-300 text-center mb-8">번호 그리드 내부에 칩을 놓는 베팅으로, 높은 배당률을 제공합니다.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each insideBets as bet}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-casino-gold/20">
          <h3 class="text-xl font-bold text-casino-gold mb-3">{bet.name}</h3>
          <p class="text-gray-300 text-sm mb-4">{bet.description}</p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">커버 번호:</span>
              <span class="text-casino-gold font-semibold">{bet.numbers}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">배당률:</span>
              <span class="text-casino-green font-bold">{bet.payout}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">당첨 확률:</span>
              <span class="text-gray-300">{bet.probability}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 아웃사이드 베팅 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">아웃사이드 베팅 (Outside Bets)</h2>
    <p class="text-gray-300 text-center mb-8">번호 그리드 외부에 칩을 놓는 베팅으로, 높은 당첨 확률을 제공합니다.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each outsideBets as bet}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-casino-gold/20">
          <h3 class="text-xl font-bold text-casino-gold mb-3">{bet.name}</h3>
          <p class="text-gray-300 text-sm mb-4">{bet.description}</p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-400">커버 번호:</span>
              <span class="text-casino-gold font-semibold">{bet.coverage}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">배당률:</span>
              <span class="text-casino-green font-bold">{bet.payout}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">당첨 확률:</span>
              <span class="text-gray-300">{bet.probability}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 베팅 전략 -->
<section class="py-16 bg-casino-dark">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">인기 베팅 전략</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each strategies as strategy}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-casino-gold/20">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold text-casino-gold">{strategy.name}</h3>
            <span class="px-3 py-1 rounded-full text-xs font-semibold
                         {strategy.risk === '높음' ? 'bg-casino-red/20 text-casino-red' :
                           strategy.risk === '중간' ? 'bg-yellow-600/20 text-yellow-400' :
                           'bg-casino-green/20 text-casino-green'}">
              위험도: {strategy.risk}
            </span>
          </div>

          <p class="text-gray-300 mb-4">{strategy.description}</p>

          <div class="space-y-3">
            <div>
              <span class="text-casino-green text-sm font-semibold">장점:</span>
              <span class="text-gray-300 text-sm ml-2">{strategy.pros}</span>
            </div>
            <div>
              <span class="text-casino-red text-sm font-semibold">단점:</span>
              <span class="text-gray-300 text-sm ml-2">{strategy.cons}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <div class="max-w-4xl mx-auto mt-12">
      <div class="bg-gradient-to-br from-casino-red/10 to-red-900/10 rounded-xl p-8 border border-casino-red/30">
        <h3 class="text-2xl font-bold text-casino-red mb-6 text-center">⚠️ 전략 사용 시 주의사항</h3>
        <div class="text-gray-300 space-y-3">
          <p>• <span class="text-casino-gold font-semibold">하우스 엣지</span>는 어떤 전략으로도 제거할 수 없습니다</p>
          <p>• <span class="text-casino-gold font-semibold">테이블 한도</span>로 인해 무한정 베팅 증가는 불가능합니다</p>
          <p>• <span class="text-casino-gold font-semibold">각 스핀은 독립적</span>이며 이전 결과에 영향받지 않습니다</p>
          <p>• <span class="text-casino-gold font-semibold">자금 관리</span>가 가장 중요한 요소입니다</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 팁과 조언 -->
<section class="py-16 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold text-casino-gold text-center mb-12">성공적인 룰렛 플레이 팁</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      {#each tips as tip}
        <div class="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-casino-gold/20">
          <div class="flex items-center space-x-4 mb-4">
            <div class="text-3xl">{tip.icon}</div>
            <h3 class="text-xl font-bold text-casino-gold">{tip.title}</h3>
          </div>
          <p class="text-gray-300">{tip.description}</p>
        </div>
      {/each}
    </div>

    <div class="max-w-4xl mx-auto mt-12">
      <div class="bg-gradient-to-br from-casino-gold/10 to-yellow-900/10 rounded-xl p-8 border border-casino-gold/30">
        <h3 class="text-2xl font-bold text-casino-gold mb-6 text-center">배당률 빠른 참조</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-casino-green">35:1</div>
            <div class="text-gray-300 text-sm">스트레이트 업</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-casino-green">17:1</div>
            <div class="text-gray-300 text-sm">스플릿</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-casino-green">2:1</div>
            <div class="text-gray-300 text-sm">더즌/칼럼</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-casino-green">1:1</div>
            <div class="text-gray-300 text-sm">빨강/검정</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA 섹션 -->
<section class="py-16 bg-gradient-to-r from-casino-gold via-yellow-600 to-casino-gold text-black">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-4xl font-bold mb-4">룰렛 게임 시작하기</h2>
    <p class="text-xl mb-8 text-black/80">
      카지노의 여왕, 룰렛의 스릴 넘치는 세계로 지금 입장하세요!
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="bg-black text-casino-gold font-bold py-4 px-8 rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg">
        룰렛 플레이하기
      </button>
      <a href="/" class="bg-transparent border-2 border-black text-black font-bold py-4 px-8 rounded-lg hover:bg-black hover:text-casino-gold transition-all duration-200 text-lg">
        다른 게임 보기
      </a>
    </div>
  </div>
</section>