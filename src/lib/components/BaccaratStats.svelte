<script>
  export let stats = {
    playerWins: 0,
    bankerWins: 0,
    ties: 0,
    playerPairs: 0,
    bankerPairs: 0,
    currentStreak: { type: null, count: 0 },
    longestStreak: { type: null, count: 0 },
    hotTrend: null,
    shoeNumber: 1,
    gamesInShoe: 0
  };

  $: totalGames = stats.playerWins + stats.bankerWins + stats.ties;
  $: playerWinRate = totalGames > 0 ? ((stats.playerWins / totalGames) * 100).toFixed(1) : 0;
  $: bankerWinRate = totalGames > 0 ? ((stats.bankerWins / totalGames) * 100).toFixed(1) : 0;
  $: tieRate = totalGames > 0 ? ((stats.ties / totalGames) * 100).toFixed(1) : 0;
</script>

<div class="bg-white rounded-lg p-4 text-black">
  <h3 class="font-bold text-lg mb-4 text-center">통계 분석</h3>

  <div class="space-y-4">
    <!-- 슈 정보 -->
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
      <div class="flex justify-between items-center">
        <span class="font-bold">슈 번호</span>
        <span class="text-xl font-bold text-purple-600">#{stats.shoeNumber}</span>
      </div>
      <div class="flex justify-between items-center text-sm mt-1">
        <span>이번 슈 게임 수</span>
        <span class="font-bold">{stats.gamesInShoe}</span>
      </div>
    </div>

    <!-- 승률 통계 -->
    <div>
      <h4 class="font-bold text-sm mb-2">승률 통계</h4>
      <div class="space-y-2">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>플레이어</span>
            <span class="font-bold text-blue-600">{stats.playerWins}승 ({playerWinRate}%)</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: {playerWinRate}%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>뱅커</span>
            <span class="font-bold text-red-600">{stats.bankerWins}승 ({bankerWinRate}%)</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-red-500 h-2 rounded-full transition-all" style="width: {bankerWinRate}%"></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span>타이</span>
            <span class="font-bold text-green-600">{stats.ties}회 ({tieRate}%)</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full transition-all" style="width: {tieRate}%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 연승 정보 -->
    <div>
      <h4 class="font-bold text-sm mb-2">연승 기록</h4>
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-blue-50 p-2 rounded">
          <div class="text-xs text-gray-600">현재 연승</div>
          <div class="font-bold text-lg {
            stats.currentStreak.type === 'player' ? 'text-blue-600' :
            stats.currentStreak.type === 'banker' ? 'text-red-600' :
            'text-green-600'
          }">
            {stats.currentStreak.count}
            {#if stats.currentStreak.type}
              ({stats.currentStreak.type === 'player' ? 'P' : stats.currentStreak.type === 'banker' ? 'B' : 'T'})
            {/if}
          </div>
        </div>

        <div class="bg-yellow-50 p-2 rounded">
          <div class="text-xs text-gray-600">최대 연승</div>
          <div class="font-bold text-lg text-yellow-600">
            {stats.longestStreak.count}
            {#if stats.longestStreak.type}
              ({stats.longestStreak.type === 'player' ? 'P' : stats.longestStreak.type === 'banker' ? 'B' : 'T'})
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- 핫/콜드 트렌드 -->
    {#if stats.hotTrend}
      <div class="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border-2 border-orange-300">
        <div class="flex items-center justify-between">
          <span class="font-bold">🔥 핫 트렌드</span>
          <span class="font-bold text-orange-600">
            {stats.hotTrend === 'player' ? '플레이어' : '뱅커'}
          </span>
        </div>
        <div class="text-xs text-gray-600 mt-1">최근 10게임 기준 우세</div>
      </div>
    {/if}

    <!-- 페어 통계 -->
    <div>
      <h4 class="font-bold text-sm mb-2">페어 출현</h4>
      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="flex justify-between">
          <span>플레이어 페어</span>
          <span class="font-bold text-blue-600">{stats.playerPairs}</span>
        </div>
        <div class="flex justify-between">
          <span>뱅커 페어</span>
          <span class="font-bold text-red-600">{stats.bankerPairs}</span>
        </div>
      </div>
    </div>
  </div>
</div>
