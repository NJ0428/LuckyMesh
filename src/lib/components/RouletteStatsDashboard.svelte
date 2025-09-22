<script>
  import { onMount } from 'svelte';
  import PastelCard from './PastelCard.svelte';

  export let gameHistory = [];
  export let currentBets = {};
  export let isVisible = true;

  let statsData = {
    hotNumbers: [],
    coldNumbers: [],
    colorStats: { red: 0, black: 0, green: 0 },
    patternAnalysis: {},
    lastNumbers: [],
    betAnalysis: {}
  };

  // 실시간 통계 업데이트
  $: if (gameHistory.length > 0) {
    updateStats();
  }

  function updateStats() {
    const recent = gameHistory.slice(-50); // 최근 50게임
    const numbers = recent.map(game => game.winningNumber);

    // 핫/콜드 번호 분석
    const numberCounts = {};
    numbers.forEach(num => {
      numberCounts[num] = (numberCounts[num] || 0) + 1;
    });

    const sortedNumbers = Object.entries(numberCounts)
      .sort(([,a], [,b]) => b - a);

    statsData.hotNumbers = sortedNumbers.slice(0, 5);
    statsData.coldNumbers = getAllNumbers()
      .filter(n => !numberCounts[n])
      .slice(0, 5);

    // 색상 통계
    statsData.colorStats = {
      red: recent.filter(game => game.winningColor === 'red').length,
      black: recent.filter(game => game.winningColor === 'black').length,
      green: recent.filter(game => game.winningColor === 'green').length
    };

    // 최근 번호들
    statsData.lastNumbers = numbers.slice(-10).reverse();

    // 패턴 분석
    analyzePatterns(numbers);

    // 베팅 분석
    analyzeBets();
  }

  function getAllNumbers() {
    return Array.from({length: 37}, (_, i) => i); // 0-36
  }

  function analyzePatterns(numbers) {
    const patterns = {
      evenOdd: { even: 0, odd: 0 },
      highLow: { low: 0, high: 0 },
      dozens: { first: 0, second: 0, third: 0 }
    };

    numbers.forEach(num => {
      if (num === 0) return;

      // 짝수/홀수
      if (num % 2 === 0) patterns.evenOdd.even++;
      else patterns.evenOdd.odd++;

      // 높음/낮음
      if (num <= 18) patterns.highLow.low++;
      else patterns.highLow.high++;

      // 더즌
      if (num <= 12) patterns.dozens.first++;
      else if (num <= 24) patterns.dozens.second++;
      else patterns.dozens.third++;
    });

    statsData.patternAnalysis = patterns;
  }

  function analyzeBets() {
    const totalBet = Object.values(currentBets).reduce((sum, bet) => sum + bet.amount, 0);
    const betTypes = {};

    Object.values(currentBets).forEach(bet => {
      const type = bet.type || 'number';
      betTypes[type] = (betTypes[type] || 0) + bet.amount;
    });

    statsData.betAnalysis = {
      total: totalBet,
      types: betTypes
    };
  }

  function getNumberColor(num) {
    if (num === 0) return 'green';
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
    return redNumbers.includes(num) ? 'red' : 'black';
  }

  function formatPercentage(value, total) {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
  }
</script>

{#if isVisible}
<div class="stats-dashboard space-y-4">
  <!-- 핫/콜드 번호 -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <PastelCard>
      <h3 class="font-bold text-lg mb-3 text-center text-red-600">🔥 핫 번호</h3>
      <div class="space-y-2">
        {#each statsData.hotNumbers as [number, count]}
          <div class="flex justify-between items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
              {getNumberColor(parseInt(number)) === 'red' ? 'bg-red-500' :
               getNumberColor(parseInt(number)) === 'black' ? 'bg-gray-800' : 'bg-green-500'}">
              {number}
            </div>
            <div class="text-sm">
              <span class="font-semibold">{count}회</span>
              <span class="text-gray-500">({formatPercentage(count, gameHistory.slice(-50).length)})</span>
            </div>
          </div>
        {/each}
        {#if statsData.hotNumbers.length === 0}
          <p class="text-center text-gray-500 text-sm">데이터가 충분하지 않습니다</p>
        {/if}
      </div>
    </PastelCard>

    <PastelCard>
      <h3 class="font-bold text-lg mb-3 text-center text-blue-600">❄️ 콜드 번호</h3>
      <div class="space-y-2">
        {#each statsData.coldNumbers.slice(0, 5) as number}
          <div class="flex justify-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
              {getNumberColor(number) === 'red' ? 'bg-red-500' :
               getNumberColor(number) === 'black' ? 'bg-gray-800' : 'bg-green-500'} opacity-50">
              {number}
            </div>
          </div>
        {/each}
        {#if statsData.coldNumbers.length === 0}
          <p class="text-center text-gray-500 text-sm">모든 번호가 나왔습니다</p>
        {/if}
      </div>
    </PastelCard>
  </div>

  <!-- 색상 통계 -->
  <PastelCard>
    <h3 class="font-bold text-lg mb-3 text-center">🎨 색상 통계 (최근 50게임)</h3>
    <div class="grid grid-cols-3 gap-4">
      <div class="text-center">
        <div class="w-12 h-12 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
          <span class="text-white font-bold">{statsData.colorStats.red}</span>
        </div>
        <div class="text-sm text-gray-600">
          빨강 {formatPercentage(statsData.colorStats.red, gameHistory.slice(-50).length)}
        </div>
      </div>
      <div class="text-center">
        <div class="w-12 h-12 bg-gray-800 rounded-full mx-auto mb-2 flex items-center justify-center">
          <span class="text-white font-bold">{statsData.colorStats.black}</span>
        </div>
        <div class="text-sm text-gray-600">
          검정 {formatPercentage(statsData.colorStats.black, gameHistory.slice(-50).length)}
        </div>
      </div>
      <div class="text-center">
        <div class="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
          <span class="text-white font-bold">{statsData.colorStats.green}</span>
        </div>
        <div class="text-sm text-gray-600">
          초록 {formatPercentage(statsData.colorStats.green, gameHistory.slice(-50).length)}
        </div>
      </div>
    </div>
  </PastelCard>

  <!-- 패턴 분석 -->
  <PastelCard>
    <h3 class="font-bold text-lg mb-3 text-center">📊 패턴 분석</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div>
        <h4 class="font-semibold mb-2">짝수/홀수</h4>
        <div class="space-y-1">
          <div class="flex justify-between">
            <span>짝수:</span>
            <span>{statsData.patternAnalysis.evenOdd?.even || 0}</span>
          </div>
          <div class="flex justify-between">
            <span>홀수:</span>
            <span>{statsData.patternAnalysis.evenOdd?.odd || 0}</span>
          </div>
        </div>
      </div>
      <div>
        <h4 class="font-semibold mb-2">높음/낮음</h4>
        <div class="space-y-1">
          <div class="flex justify-between">
            <span>1-18:</span>
            <span>{statsData.patternAnalysis.highLow?.low || 0}</span>
          </div>
          <div class="flex justify-between">
            <span>19-36:</span>
            <span>{statsData.patternAnalysis.highLow?.high || 0}</span>
          </div>
        </div>
      </div>
      <div>
        <h4 class="font-semibold mb-2">더즌</h4>
        <div class="space-y-1">
          <div class="flex justify-between">
            <span>1-12:</span>
            <span>{statsData.patternAnalysis.dozens?.first || 0}</span>
          </div>
          <div class="flex justify-between">
            <span>13-24:</span>
            <span>{statsData.patternAnalysis.dozens?.second || 0}</span>
          </div>
          <div class="flex justify-between">
            <span>25-36:</span>
            <span>{statsData.patternAnalysis.dozens?.third || 0}</span>
          </div>
        </div>
      </div>
    </div>
  </PastelCard>

  <!-- 최근 결과 트렌드 -->
  {#if statsData.lastNumbers.length > 0}
  <PastelCard>
    <h3 class="font-bold text-lg mb-3 text-center">📈 최근 결과 (최신순)</h3>
    <div class="flex flex-wrap justify-center gap-2">
      {#each statsData.lastNumbers as number, index}
        <div class="relative">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white
            {getNumberColor(number) === 'red' ? 'bg-red-500' :
             getNumberColor(number) === 'black' ? 'bg-gray-800' : 'bg-green-500'}
            {index === 0 ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}">
            {number}
          </div>
          {#if index === 0}
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <span class="text-xs">🆕</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </PastelCard>
  {/if}

  <!-- 현재 베팅 분석 -->
  {#if Object.keys(currentBets).length > 0}
  <PastelCard>
    <h3 class="font-bold text-lg mb-3 text-center">💰 현재 베팅 분석</h3>
    <div class="space-y-2 text-sm">
      <div class="flex justify-between font-semibold">
        <span>총 베팅 금액:</span>
        <span>{statsData.betAnalysis.total?.toLocaleString() || 0}원</span>
      </div>
      {#each Object.entries(statsData.betAnalysis.types || {}) as [type, amount]}
        <div class="flex justify-between">
          <span class="capitalize">{type}:</span>
          <span>{amount.toLocaleString()}원</span>
        </div>
      {/each}
    </div>
  </PastelCard>
  {/if}
</div>
{/if}

<style>
  .stats-dashboard {
    animation: fadeIn 0.5s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>