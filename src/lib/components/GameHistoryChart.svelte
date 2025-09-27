<script>
  export let gameHistory = [];
  export let chartType = 'profit'; // 'profit', 'winrate', 'volume'

  let hoveredPoint = null;
  let chartContainer;

  $: chartData = generateChartData(gameHistory, chartType);

  function generateChartData(history, type) {
    if (history.length === 0) return { points: [], labels: [], stats: {} };

    const points = [];
    const labels = [];
    let runningTotal = 0;
    let wins = 0;

    history.forEach((game, index) => {
      const netResult = (game.win_amount || 0) - (game.bet_amount || 0);
      const date = new Date(game.created_at);

      if (type === 'profit') {
        runningTotal += netResult;
        points.push({
          x: index,
          y: runningTotal,
          value: runningTotal,
          game: game,
          label: `${runningTotal >= 0 ? '+' : ''}${formatCurrency(runningTotal)}`
        });
      } else if (type === 'winrate') {
        if (netResult > 0) wins++;
        const winRate = (wins / (index + 1)) * 100;
        points.push({
          x: index,
          y: winRate,
          value: winRate,
          game: game,
          label: `${winRate.toFixed(1)}%`
        });
      } else if (type === 'volume') {
        points.push({
          x: index,
          y: game.bet_amount,
          value: game.bet_amount,
          game: game,
          label: formatCurrency(game.bet_amount)
        });
      }

      labels.push(formatTime(game.created_at));
    });

    // 차트 범위 계산
    const values = points.map(p => p.y);
    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const range = maxY - minY || 1;

    return {
      points: points.map(p => ({
        ...p,
        normalizedY: ((p.y - minY) / range) * 160 + 20 // 20-180 범위로 정규화
      })),
      labels,
      minY,
      maxY,
      range,
      stats: {
        latest: points[points.length - 1]?.value || 0,
        change: points.length > 1 ? points[points.length - 1].value - points[0].value : 0,
        trend: points.length > 1 ? (points[points.length - 1].value > points[0].value ? 'up' : 'down') : 'neutral'
      }
    };
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function formatTime(timeString) {
    return new Date(timeString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function handleMouseMove(event) {
    if (!chartContainer || chartData.points.length === 0) return;

    const rect = chartContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const chartWidth = 360; // SVG 내부 차트 영역 너비
    const pointIndex = Math.round((x - 40) / chartWidth * (chartData.points.length - 1));

    if (pointIndex >= 0 && pointIndex < chartData.points.length) {
      hoveredPoint = chartData.points[pointIndex];
    }
  }

  function handleMouseLeave() {
    hoveredPoint = null;
  }

  function getChartColor(type, trend = 'neutral') {
    const colors = {
      profit: {
        up: '#10b981',    // emerald-500
        down: '#ef4444',  // red-500
        neutral: '#6b7280' // gray-500
      },
      winrate: '#3b82f6', // blue-500
      volume: '#8b5cf6'   // violet-500
    };

    return type === 'profit' ? colors.profit[trend] : colors[type];
  }

  function getGradientId(type, trend = 'neutral') {
    return `gradient-${type}-${trend}`;
  }
</script>

<div class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 relative overflow-hidden">
  <!-- 헤더 -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        {#if chartType === 'profit'}
          📈 누적 손익
        {:else if chartType === 'winrate'}
          🎯 승률 변화
        {:else}
          💰 베팅 규모
        {/if}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {chartData.points.length}개 게임 데이터
      </p>
    </div>

    <div class="text-right">
      <div class="text-2xl font-bold {chartType === 'profit' ? (chartData.stats.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400') : 'text-blue-600 dark:text-blue-400'}">
        {#if chartType === 'profit'}
          {formatCurrency(chartData.stats.latest)}
        {:else if chartType === 'winrate'}
          {chartData.stats.latest.toFixed(1)}%
        {:else}
          {formatCurrency(chartData.stats.latest)}
        {/if}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        현재 값
      </div>
    </div>
  </div>

  {#if chartData.points.length === 0}
    <div class="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
      <div class="text-center">
        <div class="text-4xl mb-2">📊</div>
        <p>데이터가 없습니다</p>
      </div>
    </div>
  {:else}
    <!-- 차트 -->
    <div class="relative h-64" bind:this={chartContainer} on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave}>
      <svg width="100%" height="100%" viewBox="0 0 400 200" class="overflow-visible">
        <!-- 그라데이션 정의 -->
        <defs>
          <linearGradient id={getGradientId(chartType, chartData.stats.trend)} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:{getChartColor(chartType, chartData.stats.trend)};stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:{getChartColor(chartType, chartData.stats.trend)};stop-opacity:0.05" />
          </linearGradient>
        </defs>

        <!-- 격자선 -->
        {#each [0, 25, 50, 75, 100] as percent}
          <line
            x1="40" y1={20 + (percent / 100) * 160}
            x2="380" y2={20 + (percent / 100) * 160}
            stroke="#e5e7eb" stroke-width="1" opacity="0.3"
            stroke-dasharray={percent === 50 ? "3,3" : "1,1"}
          />
        {/each}

        <!-- 기준선 (profit 차트의 경우 0원 라인) -->
        {#if chartType === 'profit' && chartData.minY < 0 && chartData.maxY > 0}
          {@const zeroY = 180 - ((0 - chartData.minY) / chartData.range) * 160}
          <line
            x1="40" y1={zeroY}
            x2="380" y2={zeroY}
            stroke="#374151" stroke-width="2" opacity="0.5"
            stroke-dasharray="5,5"
          />
        {/if}

        <!-- 면적 채우기 -->
        {#if chartData.points.length > 1}
          <path
            d="M 40,180 {chartData.points.map((point, index) =>
              `L ${40 + (index / (chartData.points.length - 1)) * 340},${point.normalizedY}`
            ).join(' ')} L 380,180 Z"
            fill="url(#{getGradientId(chartType, chartData.stats.trend)})"
          />
        {/if}

        <!-- 메인 라인 -->
        {#if chartData.points.length > 1}
          <polyline
            fill="none"
            stroke={getChartColor(chartType, chartData.stats.trend)}
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            points={chartData.points.map((point, index) =>
              `${40 + (index / (chartData.points.length - 1)) * 340},${point.normalizedY}`
            ).join(' ')}
          />
        {/if}

        <!-- 데이터 포인트 -->
        {#each chartData.points as point, index}
          <circle
            cx={40 + (index / (chartData.points.length - 1)) * 340}
            cy={point.normalizedY}
            r={hoveredPoint === point ? "6" : "4"}
            fill={getChartColor(chartType, chartData.stats.trend)}
            class="transition-all duration-200 cursor-pointer"
            opacity={hoveredPoint === point ? "1" : "0.8"}
          />
        {/each}

        <!-- Y축 레이블 -->
        <text x="20" y="30" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-400">
          {#if chartType === 'profit'}
            {formatCurrency(chartData.maxY)}
          {:else if chartType === 'winrate'}
            {chartData.maxY.toFixed(0)}%
          {:else}
            {formatCurrency(chartData.maxY)}
          {/if}
        </text>
        <text x="20" y="185" text-anchor="middle" class="text-xs fill-gray-600 dark:fill-gray-400">
          {#if chartType === 'profit'}
            {formatCurrency(chartData.minY)}
          {:else if chartType === 'winrate'}
            {chartData.minY.toFixed(0)}%
          {:else}
            {formatCurrency(chartData.minY)}
          {/if}
        </text>
      </svg>

      <!-- 호버 툴팁 -->
      {#if hoveredPoint}
        <div class="absolute bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none z-10 transform -translate-x-1/2 -translate-y-full"
             style="left: {40 + (hoveredPoint.x / (chartData.points.length - 1)) * 340}px; top: {hoveredPoint.normalizedY - 10}px;">
          <div class="font-bold">{hoveredPoint.label}</div>
          <div class="text-xs opacity-75">
            {formatTime(hoveredPoint.game.created_at)}
          </div>
          <div class="text-xs opacity-75">
            {hoveredPoint.game.game_type} - {hoveredPoint.game.result}
          </div>
        </div>
      {/if}
    </div>

    <!-- 통계 요약 -->
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="text-center">
        <div class="text-lg font-bold text-gray-900 dark:text-white">
          {#if chartType === 'profit'}
            {formatCurrency(chartData.stats.change)}
          {:else if chartType === 'winrate'}
            {chartData.stats.change >= 0 ? '+' : ''}{chartData.stats.change.toFixed(1)}%p
          {:else}
            {formatCurrency(chartData.stats.change)}
          {/if}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">전체 변화</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold {chartData.stats.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : chartData.stats.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}">
          {chartData.stats.trend === 'up' ? '📈 상승' : chartData.stats.trend === 'down' ? '📉 하락' : '➡️ 보합'}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">트렌드</div>
      </div>
      <div class="text-center">
        <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
          {chartData.points.length}
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">총 게임</div>
      </div>
    </div>
  {/if}
</div>