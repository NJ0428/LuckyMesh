<script>
  import { onMount } from 'svelte';
  import PastelCard from './PastelCard.svelte';
  import PastelButton from './PastelButton.svelte';

  export let gameHistory = [];
  export let gameType = 'all'; // 'all', 'blackjack', 'baccarat', 'roulette'

  let filteredHistory = [];
  let viewMode = 'timeline'; // 'timeline', 'chart', 'stats'
  let timeRange = '7days'; // '24hours', '7days', '30days', 'all'
  let chartData = null;

  $: filteredHistory = filterHistory(gameHistory, gameType, timeRange);
  $: chartData = generateChartData(filteredHistory);

  function filterHistory(history, type, range) {
    let filtered = history;

    // 게임 타입 필터
    if (type !== 'all') {
      filtered = filtered.filter(game => game.gameType === type);
    }

    // 시간 범위 필터
    const now = new Date();
    if (range !== 'all') {
      const cutoff = new Date();
      switch (range) {
        case '24hours':
          cutoff.setHours(now.getHours() - 24);
          break;
        case '7days':
          cutoff.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoff.setDate(now.getDate() - 30);
          break;
      }
      filtered = filtered.filter(game => new Date(game.createdAt) >= cutoff);
    }

    return filtered.slice(-50); // 최대 50개만 표시
  }

  function generateChartData(history) {
    if (history.length === 0) return null;

    const data = {
      profitLoss: [],
      winRate: [],
      gameStats: {},
      hourlyStats: Array(24).fill(0),
      dailyStats: {}
    };

    let runningTotal = 0;
    let wins = 0;

    history.forEach((game, index) => {
      runningTotal += game.netResult || 0;
      if (game.netResult > 0) wins++;

      data.profitLoss.push({
        x: index,
        y: runningTotal,
        game: game.gameType,
        result: game.netResult,
        time: game.createdAt
      });

      data.winRate.push({
        x: index,
        y: (wins / (index + 1)) * 100
      });

      // 게임별 통계
      if (!data.gameStats[game.gameType]) {
        data.gameStats[game.gameType] = {
          count: 0,
          totalBet: 0,
          totalWin: 0,
          wins: 0
        };
      }
      data.gameStats[game.gameType].count++;
      data.gameStats[game.gameType].totalBet += game.betAmount || 0;
      data.gameStats[game.gameType].totalWin += game.winAmount || 0;
      if (game.netResult > 0) data.gameStats[game.gameType].wins++;

      // 시간별 통계
      const hour = new Date(game.createdAt).getHours();
      data.hourlyStats[hour]++;

      // 일별 통계
      const date = new Date(game.createdAt).toDateString();
      if (!data.dailyStats[date]) {
        data.dailyStats[date] = { games: 0, profit: 0 };
      }
      data.dailyStats[date].games++;
      data.dailyStats[date].profit += game.netResult || 0;
    });

    return data;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  function formatTime(timeString) {
    return new Date(timeString).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getGameIcon(gameType) {
    const icons = {
      blackjack: '🃏',
      baccarat: '🎴',
      roulette: '🎡'
    };
    return icons[gameType] || '🎮';
  }

  function getResultColor(result) {
    if (result > 0) return 'text-green-600';
    if (result < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  function getWinRateColor(rate) {
    if (rate >= 60) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }
</script>

<div class="game-history-visualization">
  <!-- 헤더 및 필터 -->
  <div class="flex flex-wrap gap-4 mb-6">
    <!-- 뷰 모드 선택 -->
    <div class="flex gap-2">
      <PastelButton
        size="sm"
        variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
        on:click={() => viewMode = 'timeline'}
      >
        📊 타임라인
      </PastelButton>
      <PastelButton
        size="sm"
        variant={viewMode === 'chart' ? 'primary' : 'secondary'}
        on:click={() => viewMode = 'chart'}
      >
        📈 차트
      </PastelButton>
      <PastelButton
        size="sm"
        variant={viewMode === 'stats' ? 'primary' : 'secondary'}
        on:click={() => viewMode = 'stats'}
      >
        📋 통계
      </PastelButton>
    </div>

    <!-- 게임 타입 필터 -->
    <select bind:value={gameType} class="px-3 py-1 rounded-lg border border-gray-300 text-sm">
      <option value="all">모든 게임</option>
      <option value="blackjack">블랙잭</option>
      <option value="baccarat">바카라</option>
      <option value="roulette">룰렛</option>
    </select>

    <!-- 시간 범위 필터 -->
    <select bind:value={timeRange} class="px-3 py-1 rounded-lg border border-gray-300 text-sm">
      <option value="24hours">24시간</option>
      <option value="7days">7일</option>
      <option value="30days">30일</option>
      <option value="all">전체</option>
    </select>
  </div>

  {#if filteredHistory.length === 0}
    <PastelCard>
      <div class="text-center py-8 text-gray-500">
        <div class="text-4xl mb-4">📊</div>
        <p>선택한 조건에 맞는 게임 기록이 없습니다.</p>
      </div>
    </PastelCard>
  {:else}

    <!-- 타임라인 뷰 -->
    {#if viewMode === 'timeline'}
      <div class="space-y-4">
        <PastelCard>
          <h3 class="font-bold text-lg mb-4">🕒 게임 히스토리 타임라인</h3>
          <div class="space-y-3 max-h-96 overflow-y-auto">
            {#each filteredHistory.slice().reverse() as game, index}
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="text-2xl">{getGameIcon(game.gameType)}</div>
                  <div>
                    <div class="font-semibold text-sm">
                      {game.gameType === 'blackjack' ? '블랙잭' :
                       game.gameType === 'baccarat' ? '바카라' :
                       game.gameType === 'roulette' ? '룰렛' : game.gameType}
                    </div>
                    <div class="text-xs text-gray-600">{formatTime(game.createdAt)}</div>
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-sm font-semibold {getResultColor(game.netResult)}">
                    {game.netResult >= 0 ? '+' : ''}{formatCurrency(game.netResult)}
                  </div>
                  <div class="text-xs text-gray-600">
                    베팅: {formatCurrency(game.betAmount || 0)}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </PastelCard>
      </div>

    <!-- 차트 뷰 -->
    {:else if viewMode === 'chart' && chartData}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 손익 차트 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4">📈 누적 손익</h3>
          <div class="h-64 relative">
            <svg width="100%" height="100%" viewBox="0 0 400 200" class="border rounded">
              {#if chartData.profitLoss.length > 1}
                {@const maxY = Math.max(...chartData.profitLoss.map(d => d.y), 0)}
                {@const minY = Math.min(...chartData.profitLoss.map(d => d.y), 0)}
                {@const range = maxY - minY || 1}

                <!-- 기준선 (0원) -->
                <line
                  x1="40" y1={160 - ((0 - minY) / range) * 120}
                  x2="380" y2={160 - ((0 - minY) / range) * 120}
                  stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3,3"
                />

                <!-- 손익 라인 -->
                <polyline
                  fill="none"
                  stroke="{chartData.profitLoss[chartData.profitLoss.length - 1].y >= 0 ? '#10b981' : '#ef4444'}"
                  stroke-width="2"
                  points={chartData.profitLoss.map((d, i) =>
                    `${40 + (i / (chartData.profitLoss.length - 1)) * 340},${160 - ((d.y - minY) / range) * 120}`
                  ).join(' ')}
                />

                <!-- 포인트 -->
                {#each chartData.profitLoss as point, i}
                  <circle
                    cx={40 + (i / (chartData.profitLoss.length - 1)) * 340}
                    cy={160 - ((point.y - minY) / range) * 120}
                    r="3"
                    fill="{point.y >= 0 ? '#10b981' : '#ef4444'}"
                    class="hover:r-5"
                  />
                {/each}
              {/if}

              <!-- Y축 레이블 -->
              <text x="20" y="40" text-anchor="middle" class="text-xs fill-gray-600">
                {formatCurrency(chartData.profitLoss.length > 0 ? Math.max(...chartData.profitLoss.map(d => d.y), 0) : 0)}
              </text>
              <text x="20" y="180" text-anchor="middle" class="text-xs fill-gray-600">
                {formatCurrency(chartData.profitLoss.length > 0 ? Math.min(...chartData.profitLoss.map(d => d.y), 0) : 0)}
              </text>
            </svg>
          </div>
        </PastelCard>

        <!-- 승률 차트 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4">🎯 승률 변화</h3>
          <div class="h-64 relative">
            <svg width="100%" height="100%" viewBox="0 0 400 200" class="border rounded">
              {#if chartData.winRate.length > 1}
                <!-- 50% 기준선 -->
                <line x1="40" y1="100" x2="380" y2="100" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3,3"/>

                <!-- 승률 라인 -->
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                  points={chartData.winRate.map((d, i) =>
                    `${40 + (i / (chartData.winRate.length - 1)) * 340},${160 - (d.y / 100) * 120}`
                  ).join(' ')}
                />

                <!-- 포인트 -->
                {#each chartData.winRate as point, i}
                  <circle
                    cx={40 + (i / (chartData.winRate.length - 1)) * 340}
                    cy={160 - (point.y / 100) * 120}
                    r="3"
                    fill="#3b82f6"
                  />
                {/each}
              {/if}

              <!-- Y축 레이블 -->
              <text x="20" y="50" text-anchor="middle" class="text-xs fill-gray-600">100%</text>
              <text x="20" y="110" text-anchor="middle" class="text-xs fill-gray-600">50%</text>
              <text x="20" y="170" text-anchor="middle" class="text-xs fill-gray-600">0%</text>
            </svg>
          </div>
        </PastelCard>
      </div>

    <!-- 통계 뷰 -->
    {:else if viewMode === 'stats' && chartData}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 전체 통계 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4">📊 전체 통계</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span>총 게임 수:</span>
              <span class="font-bold">{filteredHistory.length}</span>
            </div>
            <div class="flex justify-between">
              <span>총 베팅:</span>
              <span class="font-bold">{formatCurrency(filteredHistory.reduce((sum, g) => sum + (g.betAmount || 0), 0))}</span>
            </div>
            <div class="flex justify-between">
              <span>총 손익:</span>
              <span class="font-bold {getResultColor(filteredHistory.reduce((sum, g) => sum + (g.netResult || 0), 0))}">
                {formatCurrency(filteredHistory.reduce((sum, g) => sum + (g.netResult || 0), 0))}
              </span>
            </div>
            <div class="flex justify-between">
              <span>승률:</span>
              <span class="font-bold {getWinRateColor((filteredHistory.filter(g => g.netResult > 0).length / filteredHistory.length) * 100)}">
                {((filteredHistory.filter(g => g.netResult > 0).length / filteredHistory.length) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </PastelCard>

        <!-- 게임별 통계 -->
        {#each Object.entries(chartData.gameStats) as [gameType, stats]}
          <PastelCard>
            <h3 class="font-bold text-lg mb-4">
              {getGameIcon(gameType)}
              {gameType === 'blackjack' ? '블랙잭' :
               gameType === 'baccarat' ? '바카라' :
               gameType === 'roulette' ? '룰렛' : gameType}
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span>게임 수:</span>
                <span class="font-bold">{stats.count}</span>
              </div>
              <div class="flex justify-between">
                <span>총 베팅:</span>
                <span class="font-bold">{formatCurrency(stats.totalBet)}</span>
              </div>
              <div class="flex justify-between">
                <span>승률:</span>
                <span class="font-bold {getWinRateColor((stats.wins / stats.count) * 100)}">
                  {((stats.wins / stats.count) * 100).toFixed(1)}%
                </span>
              </div>
              <div class="flex justify-between">
                <span>ROI:</span>
                <span class="font-bold {getResultColor(stats.totalWin - stats.totalBet)}">
                  {stats.totalBet > 0 ? (((stats.totalWin - stats.totalBet) / stats.totalBet) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </PastelCard>
        {/each}

        <!-- 시간대별 활동 -->
        <PastelCard>
          <h3 class="font-bold text-lg mb-4">🕐 시간대별 활동</h3>
          <div class="grid grid-cols-6 gap-1 text-xs">
            {#each chartData.hourlyStats as count, hour}
              <div class="text-center">
                <div
                  class="h-8 bg-blue-200 rounded mb-1 flex items-end justify-center"
                  style="height: {Math.max(8, (count / Math.max(...chartData.hourlyStats) || 1) * 32)}px;"
                >
                  <span class="text-xs text-blue-800">{count}</span>
                </div>
                <div class="text-gray-600">{hour}시</div>
              </div>
            {/each}
          </div>
        </PastelCard>
      </div>
    {/if}
  {/if}
</div>

<style>
  .game-history-visualization {
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

  svg circle:hover {
    r: 5;
  }
</style>