<script>
  import { onMount } from 'svelte';
  import PastelCard from './PastelCard.svelte';
  import PastelButton from './PastelButton.svelte';

  export let gameHistory = [];
  export let currentBets = {};
  export let onSuggestionApply = () => {};

  let analysisData = {
    winRate: 0,
    profitLoss: 0,
    bestBetType: '',
    worstBetType: '',
    suggestions: [],
    riskLevel: 'medium',
    streakAnalysis: {},
    betTypePerformance: {}
  };

  let showAdvanced = false;

  $: if (gameHistory.length > 0) {
    analyzePatterns();
  }

  function analyzePatterns() {
    const recentGames = gameHistory.slice(-20);

    // 승률 계산
    const wins = recentGames.filter(game => game.netResult > 0).length;
    analysisData.winRate = recentGames.length > 0 ? (wins / recentGames.length) * 100 : 0;

    // 손익 계산
    analysisData.profitLoss = recentGames.reduce((sum, game) => sum + game.netResult, 0);

    // 베팅 타입별 성과 분석
    analyzeBetTypePerformance();

    // 연속 패턴 분석
    analyzeStreaks();

    // 리스크 레벨 계산
    calculateRiskLevel();

    // AI 제안 생성
    generateSuggestions();
  }

  function analyzeBetTypePerformance() {
    const betTypeStats = {};

    gameHistory.forEach(game => {
      if (game.bets) {
        Object.values(game.bets).forEach(bet => {
          const type = bet.type || 'number';
          if (!betTypeStats[type]) {
            betTypeStats[type] = { wins: 0, losses: 0, totalBet: 0, totalWin: 0 };
          }

          betTypeStats[type].totalBet += bet.amount;
          if (game.netResult > 0) {
            betTypeStats[type].wins++;
            betTypeStats[type].totalWin += game.netResult;
          } else {
            betTypeStats[type].losses++;
          }
        });
      }
    });

    // 최고/최악 베팅 타입 찾기
    let bestROI = -Infinity;
    let worstROI = Infinity;
    let bestType = '';
    let worstType = '';

    Object.entries(betTypeStats).forEach(([type, stats]) => {
      const roi = stats.totalBet > 0 ? (stats.totalWin - stats.totalBet) / stats.totalBet : 0;
      if (roi > bestROI) {
        bestROI = roi;
        bestType = type;
      }
      if (roi < worstROI && stats.totalBet > 0) {
        worstROI = roi;
        worstType = type;
      }
    });

    analysisData.bestBetType = bestType;
    analysisData.worstBetType = worstType;
    analysisData.betTypePerformance = betTypeStats;
  }

  function analyzeStreaks() {
    const numbers = gameHistory.slice(-30).map(g => g.winningNumber);
    const colors = gameHistory.slice(-30).map(g => g.winningColor);

    // 색상 연속성 분석
    let currentColorStreak = 1;
    let maxColorStreak = 1;
    let currentColor = colors[colors.length - 1];

    for (let i = colors.length - 2; i >= 0; i--) {
      if (colors[i] === currentColor) {
        currentColorStreak++;
        maxColorStreak = Math.max(maxColorStreak, currentColorStreak);
      } else {
        break;
      }
    }

    // 짝수/홀수 연속성 분석
    let evenOddStreak = 1;
    let lastParity = numbers[numbers.length - 1] % 2;

    for (let i = numbers.length - 2; i >= 0; i--) {
      if (numbers[i] % 2 === lastParity) {
        evenOddStreak++;
      } else {
        break;
      }
    }

    analysisData.streakAnalysis = {
      colorStreak: currentColorStreak,
      maxColorStreak,
      currentColor,
      evenOddStreak,
      lastParity: lastParity === 0 ? 'even' : 'odd'
    };
  }

  function calculateRiskLevel() {
    const recentBets = Object.values(currentBets);
    const totalBet = recentBets.reduce((sum, bet) => sum + bet.amount, 0);
    const maxBet = Math.max(...recentBets.map(bet => bet.amount), 0);

    if (totalBet > 1000 || maxBet > 500) {
      analysisData.riskLevel = 'high';
    } else if (totalBet > 500 || maxBet > 200) {
      analysisData.riskLevel = 'medium';
    } else {
      analysisData.riskLevel = 'low';
    }
  }

  function generateSuggestions() {
    const suggestions = [];
    const { streakAnalysis, winRate, profitLoss } = analysisData;

    // 연속성 기반 제안
    if (streakAnalysis.colorStreak >= 4) {
      suggestions.push({
        type: 'pattern',
        title: `${streakAnalysis.currentColor === 'red' ? '빨강' : '검정'} 연속 ${streakAnalysis.colorStreak}회`,
        description: '반대 색상에 베팅하는 것을 고려해보세요.',
        confidence: Math.min(90, 50 + streakAnalysis.colorStreak * 8),
        action: 'bet_opposite_color'
      });
    }

    if (streakAnalysis.evenOddStreak >= 5) {
      suggestions.push({
        type: 'pattern',
        title: `${streakAnalysis.lastParity === 'even' ? '짝수' : '홀수'} 연속 ${streakAnalysis.evenOddStreak}회`,
        description: '반대 패리티에 베팅할 시점일 수 있습니다.',
        confidence: Math.min(85, 40 + streakAnalysis.evenOddStreak * 9),
        action: 'bet_opposite_parity'
      });
    }

    // 성과 기반 제안
    if (winRate < 30 && profitLoss < -500) {
      suggestions.push({
        type: 'strategy',
        title: '낮은 승률 감지',
        description: '베팅 금액을 줄이고 안전한 베팅(빨강/검정)을 고려하세요.',
        confidence: 75,
        action: 'reduce_risk'
      });
    }

    if (winRate > 70 && profitLoss > 300) {
      suggestions.push({
        type: 'strategy',
        title: '좋은 흐름 감지',
        description: '현재 전략을 유지하되, 이익 실현을 고려하세요.',
        confidence: 80,
        action: 'maintain_strategy'
      });
    }

    // 베팅 타입 기반 제안
    if (analysisData.bestBetType && analysisData.betTypePerformance[analysisData.bestBetType]) {
      const performance = analysisData.betTypePerformance[analysisData.bestBetType];
      if (performance.wins > performance.losses) {
        suggestions.push({
          type: 'bet_type',
          title: `${analysisData.bestBetType} 베팅 추천`,
          description: '이 베팅 타입이 최근 좋은 성과를 보이고 있습니다.',
          confidence: 65,
          action: 'use_best_bet_type'
        });
      }
    }

    analysisData.suggestions = suggestions;
  }

  function applySuggestion(suggestion) {
    onSuggestionApply(suggestion);
  }

  function getConfidenceColor(confidence) {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getRiskLevelInfo(level) {
    switch (level) {
      case 'low':
        return { color: 'text-green-600', icon: '🟢', text: '낮음' };
      case 'medium':
        return { color: 'text-yellow-600', icon: '🟡', text: '보통' };
      case 'high':
        return { color: 'text-red-600', icon: '🔴', text: '높음' };
      default:
        return { color: 'text-gray-600', icon: '⚪', text: '알 수 없음' };
    }
  }

  function getBetTypeDisplayName(type) {
    const names = {
      'red': '빨강',
      'black': '검정',
      'even': '짝수',
      'odd': '홀수',
      'low': '1-18',
      'high': '19-36',
      'dozen1': '1-12',
      'dozen2': '13-24',
      'dozen3': '25-36',
      'column1': '세로줄1',
      'column2': '세로줄2',
      'column3': '세로줄3',
      'number': '직접 번호'
    };
    return names[type] || type;
  }
</script>

<div class="betting-analysis space-y-4">
  <!-- 성과 요약 -->
  <PastelCard>
    <h3 class="font-bold text-lg mb-4 text-center">📊 베팅 성과 분석</h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div class="text-center">
        <div class="text-2xl font-bold {analysisData.winRate >= 50 ? 'text-green-600' : 'text-red-600'}">
          {analysisData.winRate.toFixed(1)}%
        </div>
        <div class="text-sm text-gray-600">승률</div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold {analysisData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
          {analysisData.profitLoss >= 0 ? '+' : ''}{analysisData.profitLoss.toLocaleString()}원
        </div>
        <div class="text-sm text-gray-600">손익</div>
      </div>

      <div class="text-center">
        <div class="text-2xl font-bold">
          {getBetTypeDisplayName(analysisData.bestBetType)}
        </div>
        <div class="text-sm text-gray-600">최고 베팅</div>
      </div>

      <div class="text-center">
        <div class="text-2xl {getRiskLevelInfo(analysisData.riskLevel).color}">
          {getRiskLevelInfo(analysisData.riskLevel).icon}
        </div>
        <div class="text-sm text-gray-600">
          리스크 {getRiskLevelInfo(analysisData.riskLevel).text}
        </div>
      </div>
    </div>
  </PastelCard>

  <!-- AI 제안 -->
  {#if analysisData.suggestions.length > 0}
  <PastelCard>
    <h3 class="font-bold text-lg mb-4 text-center">🤖 AI 베팅 제안</h3>

    <div class="space-y-3">
      {#each analysisData.suggestions as suggestion}
        <div class="border border-gray-200 rounded-lg p-3 bg-gradient-to-r from-blue-50 to-purple-50">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-semibold text-sm">{suggestion.title}</h4>
            <span class="text-xs px-2 py-1 rounded-full bg-white {getConfidenceColor(suggestion.confidence)}">
              {suggestion.confidence}% 신뢰도
            </span>
          </div>

          <p class="text-sm text-gray-600 mb-3">{suggestion.description}</p>

          <div class="flex justify-between items-center">
            <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
              {suggestion.type === 'pattern' ? '패턴' :
               suggestion.type === 'strategy' ? '전략' : '베팅 타입'}
            </span>

            <PastelButton
              size="sm"
              variant="secondary"
              on:click={() => applySuggestion(suggestion)}
            >
              적용
            </PastelButton>
          </div>
        </div>
      {/each}
    </div>
  </PastelCard>
  {/if}

  <!-- 패턴 분석 -->
  <PastelCard>
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">🔍 패턴 분석</h3>
      <button
        on:click={() => showAdvanced = !showAdvanced}
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        {showAdvanced ? '간단히' : '자세히'}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 색상 연속성 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <h4 class="font-semibold mb-2 text-sm">색상 연속성</h4>
        <div class="text-center">
          <div class="text-lg font-bold mb-1">
            {analysisData.streakAnalysis.currentColor === 'red' ? '🔴' : '⚫'}
            {analysisData.streakAnalysis.colorStreak}연속
          </div>
          <div class="text-xs text-gray-600">
            최대: {analysisData.streakAnalysis.maxColorStreak}연속
          </div>
        </div>
      </div>

      <!-- 짝수/홀수 연속성 -->
      <div class="bg-gray-50 rounded-lg p-3">
        <h4 class="font-semibold mb-2 text-sm">짝수/홀수</h4>
        <div class="text-center">
          <div class="text-lg font-bold mb-1">
            {analysisData.streakAnalysis.lastParity === 'even' ? '2️⃣' : '1️⃣'}
            {analysisData.streakAnalysis.evenOddStreak}연속
          </div>
          <div class="text-xs text-gray-600">
            현재: {analysisData.streakAnalysis.lastParity === 'even' ? '짝수' : '홀수'}
          </div>
        </div>
      </div>
    </div>

    <!-- 고급 분석 -->
    {#if showAdvanced}
    <div class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="font-semibold mb-3 text-sm">베팅 타입별 성과</h4>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        {#each Object.entries(analysisData.betTypePerformance) as [type, stats]}
          {@const winRate = stats.wins + stats.losses > 0 ? (stats.wins / (stats.wins + stats.losses)) * 100 : 0}
          {@const roi = stats.totalBet > 0 ? ((stats.totalWin - stats.totalBet) / stats.totalBet) * 100 : 0}

          <div class="flex justify-between items-center text-xs">
            <span class="font-medium">{getBetTypeDisplayName(type)}</span>
            <div class="text-right">
              <div class="{winRate >= 50 ? 'text-green-600' : 'text-red-600'}">
                승률: {winRate.toFixed(1)}%
              </div>
              <div class="{roi >= 0 ? 'text-green-600' : 'text-red-600'}">
                ROI: {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    {/if}
  </PastelCard>
</div>

<style>
  .betting-analysis {
    animation: slideInUp 0.5s ease-out;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>