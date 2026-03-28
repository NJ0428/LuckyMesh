<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import {
    calculateWinRate,
    getGameTypeName,
    getGameTypeIcon,
    formatCurrency,
    formatDate
  } from '$lib/utils/statistics.js';

  // 상태 변수
  let statistics = null;
  let loading = true;
  let error = null;

  // 필터 상태
  let timeRange = 'all'; // '24hours', '7days', '30days', 'all'
  let gameTypeFilter = 'all'; // 'all', 'blackjack', 'baccarat', 'roulette', 'poker', 'slots', 'sicbo'

  // 데이터 로딩
  onMount(async () => {
    await loadStatistics();
  });

  async function loadStatistics() {
    try {
      loading = true;
      error = null;

      const params = new URLSearchParams({
        timeRange: timeRange,
        gameType: gameTypeFilter
      });

      const response = await fetch(`/api/statistics?${params}`);

      if (!response.ok) {
        if (response.status === 401) {
          goto('/login');
          return;
        }
        throw new Error('통계를 불러올 수 없습니다.');
      }

      statistics = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  // 필터 변경 시 데이터 재로딩
  $: if (timeRange !== undefined || gameTypeFilter !== undefined) {
    loadStatistics();
  }

  // 색상 헬퍼 함수들
  function getResultColor(value) {
    if (value > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  function getResultBgColor(value) {
    if (value > 0) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700';
    if (value < 0) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
  }

  function getTrendColor(trend) {
    if (trend === 'up') return 'text-emerald-600 dark:text-emerald-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  function getTrendIcon(trend) {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  }

  function getRiskLevelColor(riskLevel) {
    if (riskLevel === 'high') return 'text-red-600 dark:text-red-400';
    if (riskLevel === 'medium') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }

  function getRiskLevelLabel(riskLevel) {
    if (riskLevel === 'high') return '높음';
    if (riskLevel === 'medium') return '중간';
    return '낮음';
  }

  function getTrendLabel(trend) {
    if (trend === 'up') return '상승';
    if (trend === 'down') return '하락';
    return '횡보';
  }

  // 원형 프로그레스 SVG 생성
  function CircularProgress({ percent, size = 120, strokeWidth = 10, color = '#10b981' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;

    return `
      <svg width="${size}" height="${size}" class="transform -rotate-90">
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="currentColor"
          stroke-width="${strokeWidth}"
          fill="transparent"
          class="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="${color}"
          stroke-width="${strokeWidth}"
          fill="transparent"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          stroke-linecap="round"
          class="transition-all duration-500"
        />
      </svg>
    `;
  }

  // 게임 타입 목록
  const gameTypes = [
    { id: 'blackjack', name: '블랙잭', icon: '🃏' },
    { id: 'baccarat', name: '바카라', icon: '🎴' },
    { id: 'roulette', name: '룰렛', icon: '🎡' },
    { id: 'poker', name: '포커', icon: '♠️' },
    { id: 'slots', name: '슬롯머신', icon: '🍒' },
    { id: 'sicbo', name: '다이사이', icon: '🎲' }
  ];
</script>

<svelte:head>
  <title>통계 & 분석 - 럭키메시 카지노</title>
  <meta name="description" content="나의 게임 통계와 상세 분석을 확인하세요." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900">
  <!-- 헤더 -->
  <div class="bg-gradient-to-r from-violet-500 to-purple-600 shadow-xl">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm">
            📊
          </div>
          <div>
            <h1 class="text-3xl lg:text-4xl font-bold text-white font-playfair tracking-tight">
              통계 & 분석
            </h1>
            <p class="text-violet-100 text-sm font-medium">상세 게임 통계 & 패턴 분석</p>
          </div>
        </div>

        {#if statistics}
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
            <div class="text-xl font-bold text-white">
              {getTrendIcon(statistics.trend)} {getTrendLabel(statistics.trend)}
            </div>
            <div class="text-violet-100 text-sm font-medium">현재 추세</div>
          </div>
        {/if}
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
        <button on:click={loadStatistics} class="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors">
          다시 시도
        </button>
      </div>
    {:else if statistics}
      <!-- 필터 컨트롤 -->
      <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">필터 설정</h2>
          <div class="flex flex-wrap gap-3">
            <select bind:value={timeRange} class="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="24hours">📅 24시간</option>
              <option value="7days">📅 7일</option>
              <option value="30days">📅 30일</option>
              <option value="all">📅 전체</option>
            </select>

            <select bind:value={gameTypeFilter} class="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option value="all">🎮 모든 게임</option>
              {#each gameTypes as type}
                <option value={type.id}>{type.icon} {type.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- 주요 통계 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div class="text-3xl mb-2">🎮</div>
          <div class="text-2xl font-bold text-violet-600 dark:text-violet-400">{statistics.summary.totalGames}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">총 게임 수</div>
        </div>

        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div class="text-3xl mb-2">🎯</div>
          <div class="text-2xl font-bold {getResultColor(statistics.summary.winRate - 50)}">
            {statistics.summary.winRate.toFixed(1)}%
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">전체 승률</div>
        </div>

        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div class="text-3xl mb-2">💰</div>
          <div class="text-2xl font-bold {getResultColor(statistics.summary.netProfit)}">
            {formatCurrency(statistics.summary.netProfit)}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">순 손익</div>
        </div>

        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div class="text-3xl mb-2">📊</div>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(statistics.summary.avgBet)}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">평균 베팅</div>
        </div>
      </div>

      {#if statistics.summary.totalGames === 0}
        <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
          <div class="text-6xl mb-4">🎮</div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">게임 기록이 없습니다</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">선택한 조건에 맞는 게임 기록이 없습니다.</p>
          <a href="/" class="bg-violet-500 hover:bg-violet-600 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            게임 하러 가기
          </a>
        </div>
      {:else}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 게임별 승률/패율 통계 -->
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              🎯 게임별 승률/패율
            </h3>

            <div class="space-y-4">
              {#each Object.entries(statistics.gameTypeStats) as [gameType, stats]}
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div class="flex items-center gap-4">
                    <div class="relative">
                      {@html CircularProgress({
                        percent: stats.winRate,
                        size: 80,
                        strokeWidth: 8,
                        color: stats.winRate >= 50 ? '#10b981' : '#ef4444'
                      })}
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-sm font-bold text-gray-900 dark:text-white">
                          {stats.winRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div class="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span class="text-xl">{getGameTypeIcon(gameType)}</span>
                        {getGameTypeName(gameType)}
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        {stats.totalGames}게임 • 승 {stats.wins} / 패 {stats.losses}
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold {getResultColor(stats.netProfit)}">
                      {stats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.netProfit)}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                      최고 연승: {stats.bestStreak}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <!-- 베팅 패턴 분석 -->
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              📊 베팅 패턴 분석
            </h3>

            {#if statistics.bettingPatterns}
              <div class="space-y-6">
                <!-- 리스크 레벨 -->
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">리스크 레벨</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">베팅 스타일 분석</div>
                  </div>
                  <div class="font-bold {getRiskLevelColor(statistics.bettingPatterns.riskLevel)}">
                    {getRiskLevelLabel(statistics.bettingPatterns.riskLevel)}
                  </div>
                </div>

                <!-- 베팅 규모 분포 -->
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white mb-3">베팅 규모 분포</h4>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">소형 베팅 (≤ {formatCurrency(statistics.bettingPatterns.smallBets.threshold)})</span>
                      <span class="font-medium text-gray-900 dark:text-white">{statistics.bettingPatterns.smallBets.percentage.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style="width: {statistics.bettingPatterns.smallBets.percentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">중형 베팅 ({formatCurrency(statistics.bettingPatterns.smallBets.threshold)} - {formatCurrency(statistics.bettingPatterns.mediumBets.threshold)})</span>
                      <span class="font-medium text-gray-900 dark:text-white">{statistics.bettingPatterns.mediumBets.percentage.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style="width: {statistics.bettingPatterns.mediumBets.percentage}%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-600 dark:text-gray-400">대형 베팅 (> {formatCurrency(statistics.bettingPatterns.mediumBets.threshold)})</span>
                      <span class="font-medium text-gray-900 dark:text-white">{statistics.bettingPatterns.largeBets.percentage.toFixed(1)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        class="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style="width: {statistics.bettingPatterns.largeBets.percentage}%"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 베팅 통계 -->
                <div class="grid grid-cols-3 gap-4">
                  <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div class="text-lg font-bold text-violet-600 dark:text-violet-400">
                      {formatCurrency(statistics.bettingPatterns.avgBet)}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">평균 베팅</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(statistics.bettingPatterns.minBet)}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">최소 베팅</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div class="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(statistics.bettingPatterns.maxBet)}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">최대 베팅</div>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- 최고 기록 -->
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              🏆 최고 기록
            </h3>

            {#if statistics.bestRecords}
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최대 단일 승리</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(statistics.bestRecords.singleWin)}
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최장 연속 승리</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">
                    {statistics.bestRecords.longestWinStreak}연승
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최고 승률</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">
                    {statistics.bestRecords.highestWinRate.toFixed(1)}%
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최고 수익 일</span>
                  <div class="text-right">
                    <div class="font-bold text-emerald-600 dark:text-emerald-400">
                      {statistics.bestRecords.bestDay ? formatDate(statistics.bestRecords.bestDay) : '-'}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrency(statistics.bestRecords.bestDayProfit)}
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- 최악 기록 -->
          <div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              💔 최악 기록
            </h3>

            {#if statistics.worstRecords}
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최대 단일 손실</span>
                  <span class="font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(statistics.worstRecords.singleLoss)}
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최장 연속 패배</span>
                  <span class="font-bold text-red-600 dark:text-red-400">
                    {statistics.worstRecords.longestLossStreak}연패
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최저 승률</span>
                  <span class="font-bold text-red-600 dark:text-red-400">
                    {statistics.worstRecords.lowestWinRate.toFixed(1)}%
                  </span>
                </div>
                <div class="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <span class="font-medium text-gray-700 dark:text-gray-300">최대 손실 일</span>
                  <div class="text-right">
                    <div class="font-bold text-red-600 dark:text-red-400">
                      {statistics.worstRecords.worstDay ? formatDate(statistics.worstRecords.worstDay) : '-'}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrency(statistics.worstRecords.worstDayProfit)}
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- 누적 수익/손실 그래프 -->
        <div class="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            📈 누적 수익/손실 추이
          </h3>

          {#if statistics.cumulativeProfit && statistics.cumulativeProfit.length > 0}
            <div class="relative h-64">
              <svg class="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <!-- 배경 그리드 -->
                <defs>
                  <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
                  </linearGradient>
                  <linearGradient id="lossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#ef4444;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#ef4444;stop-opacity:0" />
                  </linearGradient>
                </defs>

                <!-- Y축 라인 -->
                <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4" />
                <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4" />
                <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4" />

                <!-- 데이터 포인트 -->
                {#if statistics.cumulativeProfit.length > 1}
                  {@const minProfit = Math.min(...statistics.cumulativeProfit.map(p => p.profit))}
                  {@const maxProfit = Math.max(...statistics.cumulativeProfit.map(p => p.profit))}
                  {@const range = maxProfit - minProfit || 1}

                  <!-- 영역 채우기 -->
                  <path
                    d="M 0,{200 - ((statistics.cumulativeProfit[0].profit - minProfit) / range * 180 + 10)}
                      {statistics.cumulativeProfit.map((p, i) => `L ${(i / (statistics.cumulativeProfit.length - 1)) * 800},${200 - ((p.profit - minProfit) / range * 180 + 10)}`).join(' ')}
                      L 800,200 L 0,200 Z"
                    fill={maxProfit >= 0 ? 'url(#profitGradient)' : 'url(#lossGradient)'}
                  />

                  <!-- 라인 -->
                  <path
                    d="M 0,{200 - ((statistics.cumulativeProfit[0].profit - minProfit) / range * 180 + 10)}
                      {statistics.cumulativeProfit.map((p, i) => `L ${(i / (statistics.cumulativeProfit.length - 1)) * 800},${200 - ((p.profit - minProfit) / range * 180 + 10)}`).join(' ')}"
                    fill="none"
                    stroke={statistics.cumulativeProfit[statistics.cumulativeProfit.length - 1].profit >= 0 ? '#10b981' : '#ef4444'}
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                {/if}
              </svg>

              <!-- X축 라벨 -->
              <div class="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 dark:text-gray-400 px-2">
                <span>{statistics.cumulativeProfit.length > 0 ? new Date(statistics.cumulativeProfit[0].date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : ''}</span>
                <span>{statistics.cumulativeProfit.length > 0 ? new Date(statistics.cumulativeProfit[statistics.cumulativeProfit.length - 1].date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : ''}</span>
              </div>
            </div>
          {:else}
            <div class="flex items-center justify-center h-64 text-gray-400">
              데이터가 부족합니다
            </div>
          {/if}
        </div>

        <!-- 시간대별 승률 -->
        <div class="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            🕐 시간대별 승률 (24시간)
          </h3>

          <div class="grid grid-cols-6 gap-2">
            {#each statistics.hourlyWinRates as data}
              <div class="text-center">
                <div
                  class="h-20 rounded-lg flex items-end justify-center relative transition-all duration-200 {data.winRate >= 50 ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-red-200 dark:bg-red-800'}"
                  style="opacity: {data.games > 0 ? 0.3 + (data.winRate / 100) * 0.7 : 0.1}"
                  title="{data.hour}시: {data.winRate.toFixed(1)}% ({data.games}게임)"
                >
                  {#if data.games > 0}
                    <span class="text-xs {data.winRate >= 50 ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'} absolute bottom-1">
                      {data.winRate.toFixed(0)}%
                    </span>
                  {/if}
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.hour}시</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- 연속 기록 -->
        <div class="mt-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            🔥 연속 기록
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
              <div class="text-3xl mb-2">🏆</div>
              <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {statistics.streaks.bestWinStreak}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">최고 연승</div>
            </div>

            <div class="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <div class="text-3xl mb-2">💔</div>
              <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                {statistics.streaks.worstLossStreak}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">최고 연패</div>
            </div>

            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
              <div class="text-3xl mb-2">📊</div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.streaks.currentStreak}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                현재 {statistics.streaks.currentStreakType === 'win' ? '연승' : statistics.streaks.currentStreakType === 'lose' ? '연패' : '-'}
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  /* 추가 애니메이션 */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .bg-white\/80, .bg-gray-800\/80 {
    animation: fadeIn 0.3s ease-out;
  }
</style>
