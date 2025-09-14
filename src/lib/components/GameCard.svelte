<script>
  export let game;
  export let featured = false;
</script>

<div class="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl card-hover border border-casino-gold/20">
  <!-- 게임 이미지/아이콘 -->
  <div class="relative h-48 bg-gradient-to-br from-casino-gold/20 to-casino-red/20 flex items-center justify-center">
    <div class="text-6xl mb-4">
      {#if game.id === 'blackjack'}🃏
      {:else if game.id === 'baccarat'}♠️
      {:else if game.id === 'roulette'}🎰
      {/if}
    </div>
    {#if featured}
      <div class="absolute top-4 right-4 bg-casino-gold text-black text-xs font-bold px-2 py-1 rounded-full">
        인기
      </div>
    {/if}
  </div>

  <!-- 게임 정보 -->
  <div class="p-6">
    <div class="mb-3">
      <h3 class="text-xl font-bold text-casino-gold mb-1">{game.name}</h3>
      <p class="text-gray-300 text-sm">{game.englishName}</p>
    </div>

    <p class="text-gray-300 text-sm mb-4 leading-relaxed">{game.description}</p>

    <!-- 게임 통계 -->
    <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
      <div class="bg-black/50 rounded-lg p-3">
        <div class="text-gray-400">최소 베팅</div>
        <div class="text-casino-gold font-semibold">{game.minBet}</div>
      </div>
      <div class="bg-black/50 rounded-lg p-3">
        <div class="text-gray-400">최대 베팅</div>
        <div class="text-casino-gold font-semibold">{game.maxBet}</div>
      </div>
      <div class="bg-black/50 rounded-lg p-3">
        <div class="text-gray-400">하우스 엣지</div>
        <div class="text-casino-green font-semibold">{game.houseEdge}</div>
      </div>
      <div class="bg-black/50 rounded-lg p-3">
        <div class="text-gray-400">환원율 (RTP)</div>
        <div class="text-casino-green font-semibold">{game.rtp}</div>
      </div>
    </div>

    <!-- 게임 특징 -->
    <div class="mb-4">
      <div class="text-gray-400 text-xs mb-2">게임 특징</div>
      <div class="flex flex-wrap gap-2">
        {#each game.features as feature}
          <span class="bg-casino-gold/20 text-casino-gold text-xs px-2 py-1 rounded-full">
            {feature}
          </span>
        {/each}
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="flex gap-3">
      <a href="/{game.id}" class="btn-primary flex-1 text-center text-sm py-2">
        게임 규칙 보기
      </a>
      <button class="btn-secondary text-sm px-4 py-2">
        지금 플레이
      </button>
    </div>
  </div>
</div>