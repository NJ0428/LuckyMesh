<script>
  import { onMount, onDestroy } from 'svelte';
  import { formatCurrency, formatDate } from '$lib/utils/statistics.js';

  export let type = 'line'; // 'line', 'bar', 'circular', 'heatmap'
  export let data = [];
  export let width = '100%';
  export let height = 300;
  export let color = '#10b981'; // default emerald-500
  export let showTooltip = true;
  export let showLabels = true;

  let svgElement;
  let tooltipData = null;
  let tooltipPosition = { x: 0, y: 0 };

  // 호버 이벤트 핸들러
  function handleMouseMove(event) {
    if (!showTooltip || !svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 가장 가까운 데이터 포인트 찾기
    if (data && data.length > 0) {
      const pointWidth = rect.width / data.length;
      const index = Math.floor(x / pointWidth);

      if (index >= 0 && index < data.length) {
        tooltipData = data[index];
        tooltipPosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      }
    }
  }

  function handleMouseLeave() {
    tooltipData = null;
  }

  // 색상 그라데이션 생성
  function getGradient(id, color) {
    const isPositive = color === '#10b981'; // emerald
    return `
      <linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
      </linearGradient>
    `;
  }

  // 라인 차트 SVG 경로 생성
  function createLinePath() {
    if (!data || data.length < 2) return '';

    const values = data.map(d => d.profit || d.value || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.profit || d.value || 0 - min) / range * 80 + 10);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }

  // 영역 경로 생성 (라인 차트용)
  function createAreaPath() {
    if (!data || data.length < 2) return '';

    const linePath = createLinePath();
    return `${linePath} L 100,100 L 0,100 Z`;
  }

  // 막대 차트 데이터 계산
  function getBarData() {
    if (!data || data.length === 0) return [];

    const values = data.map(d => d.profit || d.value || d.count || 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    return data.map((d, i) => {
      const value = d.profit || d.value || d.count || 0;
      const height = Math.abs((value - min) / range * 80);
      const y = 100 - height;
      const x = (i / data.length) * 100;
      const barWidth = (100 / data.length) * 0.8;

      return { x, y, width: barWidth, height, value, data: d };
    });
  }

  // 원형 프로그레스 (스필릿파이 차트)
  export let percent = 0;
  export let size = 120;
  export let strokeWidth = 10;
  export let label = '';

  $: radius = (size - strokeWidth) / 2;
  $: circumference = radius * 2 * Math.PI;
  $: offset = circumference - (percent / 100) * circumference;
</script>

<div class="statistics-chart" style="width: {width}; height: {height}px; position: relative;">
  {#if type === 'circular'}
    <!-- 원형 프로그레스 바 -->
    <div class="flex items-center justify-center" style="width: {size}px; height: {size}px; position: relative; margin: auto;">
      <svg width={size} height={size} class="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          stroke-width={strokeWidth}
          fill="transparent"
          class="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          stroke-width={strokeWidth}
          fill="transparent"
          stroke-dasharray={circumference}
          stroke-dashoffset={offset}
          stroke-linecap="round"
          class="transition-all duration-500"
          style="transition: stroke-dashoffset 0.5s ease"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-xl font-bold text-gray-900 dark:text-white">
          {percent.toFixed(0)}%
        </span>
        {#if label}
          <span class="text-xs text-gray-600 dark:text-gray-400">{label}</span>
        {/if}
      </div>
    </div>

  {:else if type === 'line'}
    <!-- 라인 차트 -->
    <svg
      bind:this={svgElement}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="w-full h-full"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
    >
      <defs>
        {@html getGradient('chartGradient', color)}
      </defs>

      <!-- 그리드 라인 -->
      <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="2" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="2" />
      <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="2" />

      {#if data && data.length > 1}
        <!-- 영역 채우기 -->
        <path
          d={createAreaPath()}
          fill="url(#chartGradient)"
          class="transition-all duration-300"
        />

        <!-- 라인 -->
        <path
          d={createLinePath()}
          fill="none"
          stroke={color}
          stroke-width="1"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-all duration-300"
        />

        <!-- 데이터 포인트 -->
        {#each data as d, i}
          {@const x = (i / (data.length - 1)) * 100}
          {@const values = data.map(d => d.profit || d.value || 0)}
          {@const min = Math.min(...values)}
          {@const max = Math.max(...values)}
          {@const range = max - min || 1}
          {@const y = 100 - ((d.profit || d.value || 0 - min) / range * 80 + 10)}
          <circle
            cx={x}
            cy={y}
            r="1.5"
            fill={color}
            class="hover:r-2 transition-all duration-200 cursor-pointer"
          />
        {/each}
      {/if}
    </svg>

    <!-- 툴팁 -->
    {#if showTooltip && tooltipData}
      <div
        class="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-50"
        style="left: {tooltipPosition.x + 10}px; top: {tooltipPosition.y - 30}px;"
      >
        {tooltipData.profit !== undefined ? formatCurrency(tooltipData.profit : tooltipData.value)}
      </div>
    {/if}

  {:else if type === 'bar'}
    <!-- 막대 차트 -->
    <svg
      bind:this={svgElement}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="w-full h-full"
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
    >
      {#each getBarData() as bar}
        <rect
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          fill={bar.value >= 0 ? '#10b981' : '#ef4444'}
          class="hover:opacity-80 transition-all duration-200 cursor-pointer"
          rx="0.5"
        />
      {/each}
    </svg>

  {:else if type === 'heatmap'}
    <!-- 히트맵 (24시간 승률 등) -->
    <div class="grid grid-cols-6 gap-1 h-full">
      {#each data as cell}
        <div
          class="rounded flex items-center justify-center text-xs relative transition-all duration-200"
          class:bg-emerald-200={cell.winRate >= 50}
          class:bg-emerald-800={cell.winRate >= 50}
          class:bg-red-200={cell.winRate < 50}
          class:bg-red-800={cell.winRate < 50}
          style="opacity: {cell.games > 0 ? 0.3 + (cell.winRate / 100) * 0.7 : 0.1}"
          title="{cell.hour}시: {cell.winRate.toFixed(1)}% ({cell.games}게임)"
        >
          {#if cell.games > 0}
            <span class={cell.winRate >= 50 ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}>
              {cell.winRate.toFixed(0)}%
            </span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .statistics-chart {
    position: relative;
  }

  .statistics-chart svg {
    display: block;
  }
</style>
