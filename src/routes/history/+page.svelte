<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import GameHistoryChart from '$lib/components/GameHistoryChart.svelte';

  let gameHistory = [];
  let loading = true;
  let error = null;
  let filteredHistory = [];
  let viewMode = 'timeline'; // 'timeline', 'chart', 'stats'
  let chartType = 'profit'; // 'profit', 'winrate', 'volume'
  let gameTypeFilter = 'all'; // 'all', 'blackjack', 'baccarat', 'roulette'
  let timeRangeFilter = '7days'; // '24hours', '7days', '30days', 'all'
  let sortBy = 'newest'; // 'newest', 'oldest', 'amount-high', 'amount-low'

  $: filteredHistory = filterAndSortHistory(gameHistory, gameTypeFilter, timeRangeFilter, sortBy);

  onMount(async () => {
    await loadGameHistory();
  });

  async function loadGameHistory() {
    try {
      loading = true;
      const response = await fetch('/api/game-history');
      if (!response.ok) {
        if (response.status === 401) {
          goto('/auth/login');
          return;
        }
        throw new Error('게임 기록을 불러올 수 없습니다.');
      }
      gameHistory = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function filterAndSortHistory(history, gameType, timeRange, sort) {
    let filtered = [...history];

    // 게임 타입 필터
    if (gameType !== 'all') {
      filtered = filtered.filter(game => game.game_type === gameType);
    }

    // 시간 범위 필터
    const now = new Date();
    if (timeRange !== 'all') {
      const cutoff = new Date();
      switch (timeRange) {
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
      filtered = filtered.filter(game => new Date(game.created_at) >= cutoff);
    }

    // 정렬
    switch (sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'amount-high':
        filtered.sort((a, b) => getNetResult(b) - getNetResult(a));
        break;
      case 'amount-low':
        filtered.sort((a, b) => getNetResult(a) - getNetResult(b));
        break;
    }

    return filtered;
  }

  function getNetResult(game) {
    return (game.win_amount || 0) - (game.bet_amount || 0);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  function formatTime(timeString) {
    return new Date(timeString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getGameName(gameType) {
    const names = {
      blackjack: '블랙잭',
      baccarat: '바카라',
      roulette: '룰렛'
    };
    return names[gameType] || gameType;
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
    if (result > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (result < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  function getResultBgColor(result) {
    if (result > 0) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700';
    if (result < 0) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
  }

  // 통계 계산
  $: stats = calculateStats(filteredHistory);

  function calculateStats(history) {
    if (history.length === 0) {
      return {
        totalGames: 0,
        totalBet: 0,
        totalWin: 0,
        netProfit: 0,
        winRate: 0,
        avgBet: 0,
        biggestWin: 0,
        biggestLoss: 0
      };
    }

    const totalGames = history.length;
    const totalBet = history.reduce((sum, game) => sum + (game.bet_amount || 0), 0);
    const totalWin = history.reduce((sum, game) => sum + (game.win_amount || 0), 0);
    const netProfit = totalWin - totalBet;
    const wins = history.filter(game => getNetResult(game) > 0).length;
    const winRate = (wins / totalGames) * 100;
    const avgBet = totalBet / totalGames;

    const results = history.map(game => getNetResult(game));
    const biggestWin = Math.max(...results, 0);
    const biggestLoss = Math.min(...results, 0);

    return {
      totalGames,
      totalBet,
      totalWin,
      netProfit,
      winRate,
      avgBet,
      biggestWin,
      biggestLoss
    };
  }
</script>

<svelte:head>
  <title>게임 기록 - LuckyMesh Casino</title>
  <meta name="description" content="나의 게임 기록과 통계를 확인하세요." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900">
  <!-- 헤더 -->
  <div class="bg-gradient-to-r from-violet-500 to-purple-600 shadow-xl">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">📊</div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-white font-playfair tracking-tight">게임 기록</h1>
            <p class="text-violet-100 text-sm font-medium">나의 게임 히스토리 & 통계</p>
          </div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
          <div class="text-xl font-bold text-white">총 {filteredHistory.length}게임</div>
          <div class="text-violet-100 text-sm font-medium">필터된 결과</div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    {:else if error}
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6 text-center">
        <div class="text-4xl mb-4">❌</div>
        <p class="text-red-700 dark:text-red-300 font-medium">{error}</p>
        <button on:click={loadGameHistory} class="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors">
          다시 시도
        </button>
      </div>
    {:else}
      <!-- 필터 및 뷰 모드 컨트롤 -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <!-- 뷰 모드 선택 -->
          <div class="flex gap-2">
            <button
              on:click={() => viewMode = 'timeline'}
              class="px-4 py-2 rounded-xl font-medium transition-all duration-200 {viewMode === 'timeline' ? 'bg-violet-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
            >
              📊 타임라인
            </button>
            <button
              on:click={() => viewMode = 'chart'}
              class="px-4 py-2 rounded-xl font-medium transition-all duration-200 {viewMode === 'chart' ? 'bg-violet-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
            >
              📈 차트
            </button>
            <button
              on:click={() => viewMode = 'stats'}
              class="px-4 py-2 rounded-xl font-medium transition-all duration-200 {viewMode === 'stats' ? 'bg-violet-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
            >
              📊 통계
            </button>
          </div>

          <!-- 필터 컨트롤 -->
          <div class="flex flex-wrap gap-3">
            <select bind:value={gameTypeFilter} class="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="all">🎮 모든 게임</option>
              <option value="blackjack">🃏 블랙잭</option>
              <option value="baccarat">🎴 바카라</option>
              <option value="roulette">🎡 룰렛</option>
            </select>

            <select bind:value={timeRangeFilter} class="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="24hours">📅 24시간</option>
              <option value="7days">📅 7일</option>
              <option value="30days">📅 30일</option>
              <option value="all">📅 전체</option>
            </select>

            <select bind:value={sortBy} class="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="newest">⬇️ 최신순</option>
              <option value="oldest">⬆️ 오래된순</option>
              <option value="amount-high">💰 손익 높은순</option>
              <option value="amount-low">💸 손익 낮은순</option>
            </select>
          </div>
        </div>
      </div>

      {#if filteredHistory.length === 0}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
          <div class="text-6xl mb-4">🎮</div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">게임 기록이 없습니다</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">선택한 조건에 맞는 게임 기록이 없습니다.</p>
          <a href="/" class="bg-violet-500 hover:bg-violet-600 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            게임 하러 가기
          </a>
        </div>
      {:else}
        <!-- 통계 카드 (항상 표시) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
            <div class="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.totalGames}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">총 게임</div>
          </div>
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
            <div class="text-2xl font-bold {getResultColor(stats.netProfit)}">{formatCurrency(stats.netProfit)}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">순 손익</div>
          </div>
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.winRate.toFixed(1)}%</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">승률</div>
          </div>
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
            <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.avgBet)}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">평균 베팅</div>
          </div>
        </div>

        {#if viewMode === 'timeline'}
          <!-- 타임라인 뷰 -->
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              🕒 게임 히스토리
            </h3>

            <div class="space-y-3 max-h-96 overflow-y-auto">
              {#each filteredHistory as game}
                {@const netResult = getNetResult(game)}
                <div class="p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg {getResultBgColor(netResult)}">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div class="flex items-center space-x-4">
                      <div class="text-3xl">{getGameIcon(game.game_type)}</div>
                      <div>
                        <div class="font-bold text-lg text-gray-900 dark:text-white">
                          {getGameName(game.game_type)}
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(game.created_at)}
                        </div>
                      </div>
                    </div>

                    <div class="text-right">
                      <div class="text-xl font-bold {getResultColor(netResult)}">
                        {netResult >= 0 ? '+' : ''}{formatCurrency(netResult)}
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        베팅: {formatCurrency(game.bet_amount)} • 결과: {game.result}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

        {:else if viewMode === 'chart'}
          <!-- 차트 뷰 -->
          <div class="space-y-6">
            <!-- 차트 타입 선택 -->
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">차트 유형 선택</h3>
              <div class="flex flex-wrap gap-3">
                <button
                  on:click={() => chartType = 'profit'}
                  class="px-4 py-2 rounded-xl font-medium transition-all duration-200 {chartType === 'profit' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                >
                  📈 누적 손익
                </button>
                <button
                  on:click={() => chartType = 'winrate'}
                  class="px-4 py-2 rounded-xl font-medium transition-all duration-200 {chartType === 'winrate' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                >
                  🎯 승률 변화
                </button>
                <button
                  on:click={() => chartType = 'volume'}
                  class="px-4 py-2 rounded-xl font-medium transition-all duration-200 {chartType === 'volume' ? 'bg-violet-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
                >
                  💰 베팅 규모
                </button>
              </div>
            </div>

            <!-- 차트 표시 -->
            <GameHistoryChart gameHistory={filteredHistory} {chartType} />

            <!-- 추가 인사이트 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 게임별 성과 -->
              <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  🎮 게임별 성과
                </h3>
                <div class="space-y-3">
                  {#each ['blackjack', 'baccarat', 'roulette'] as gameType}
                    {@const gameStats = filteredHistory.filter(g => g.game_type === gameType)}
                    {#if gameStats.length > 0}
                      {@const totalProfit = gameStats.reduce((sum, g) => sum + getNetResult(g), 0)}
                      {@const avgProfit = totalProfit / gameStats.length}
                      <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div class="flex items-center gap-3">
                          <span class="text-xl">{getGameIcon(gameType)}</span>
                          <div>
                            <div class="font-medium text-gray-900 dark:text-white">{getGameName(gameType)}</div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">{gameStats.length}게임</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="font-bold {getResultColor(totalProfit)}">{formatCurrency(totalProfit)}</div>
                          <div class="text-xs text-gray-600 dark:text-gray-400">평균: {formatCurrency(avgProfit)}</div>
                        </div>
                      </div>
                    {/if}
                  {/each}
                </div>
              </div>

              <!-- 시간대별 활동 -->
              <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  🕐 시간대별 활동
                </h3>
                <div class="grid grid-cols-6 gap-2">
                  {#each Array(24).fill(0) as _, hour}
                    {@const hourGames = filteredHistory.filter(g => new Date(g.created_at).getHours() === hour)}
                    {@const maxHourGames = Math.max(...Array(24).fill(0).map((_, h) => filteredHistory.filter(g => new Date(g.created_at).getHours() === h).length))}
                    <div class="text-center">
                      <div
                        class="h-8 bg-violet-200 dark:bg-violet-800 rounded mb-1 flex items-end justify-center relative"
                        style="height: {Math.max(8, (hourGames.length / Math.max(maxHourGames, 1)) * 32)}px;"
                      >
                        {#if hourGames.length > 0}
                          <span class="text-xs text-violet-800 dark:text-violet-200 absolute bottom-0">{hourGames.length}</span>
                        {/if}
                      </div>
                      <div class="text-xs text-gray-600 dark:text-gray-400">{hour}시</div>
                    </div>
                  {/each}
                </div>
              </div>
            </div>
          </div>

        {:else if viewMode === 'stats'}
          <!-- 상세 통계 뷰 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- 주요 통계 -->
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                📊 주요 통계
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">총 베팅 금액</span>
                  <span class="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(stats.totalBet)}</span>
                </div>
                <div class="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">총 상금</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.totalWin)}</span>
                </div>
                <div class="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최대 승리</span>
                  <span class="font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.biggestWin)}</span>
                </div>
                <div class="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최대 손실</span>
                  <span class="font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.biggestLoss)}</span>
                </div>
              </div>
            </div>

            <!-- 게임별 통계 -->
            <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                🎯 게임별 통계
              </h3>
              <div class="space-y-4">
                {#each ['blackjack', 'baccarat', 'roulette'] as gameType}
                  {@const gameStats = filteredHistory.filter(g => g.game_type === gameType)}
                  {#if gameStats.length > 0}
                    {@const gameWins = gameStats.filter(g => getNetResult(g) > 0).length}
                    {@const gameWinRate = (gameWins / gameStats.length) * 100}
                    <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <span class="text-xl">{getGameIcon(gameType)}</span>
                          <span class="font-bold text-gray-900 dark:text-white">{getGameName(gameType)}</span>
                        </div>
                        <span class="text-sm font-medium {gameWinRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                          {gameWinRate.toFixed(1)}%
                        </span>
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        {gameStats.length}게임 • 승률 {gameWinRate.toFixed(1)}%
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</div>