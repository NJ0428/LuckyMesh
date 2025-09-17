<script>
  export let game;
  export let featured = false;
</script>

<div class="glass-card overflow-hidden shadow-2xl card-hover group">
  <!-- 게임 이미지/아이콘 -->
  <div class="relative h-48 bg-gradient-to-br {game.id === 'blackjack' ? 'from-pastel-pink to-pastel-peach' : game.id === 'baccarat' ? 'from-pastel-mint to-pastel-cream' : 'from-pastel-peach to-pastel-sky'} flex items-center justify-center">
    <div class="text-6xl mb-4">
      {#if game.id === 'blackjack'}🃏
      {:else if game.id === 'baccarat'}🎴
      {:else if game.id === 'roulette'}🎡
      {/if}
    </div>
    {#if featured}
      <div class="absolute top-4 right-4 bg-gradient-to-r from-primary-soft-pink to-accent-rose-gold text-white text-xs font-bold px-3 py-1 rounded-full font-poppins">
        ⭐ 인기
      </div>
    {/if}
  </div>

  <!-- 게임 정보 -->
  <div class="p-8">
    <div class="text-center mb-6">
      <h3 class="text-2xl font-playfair font-bold text-gray-800 mb-2">{game.name}</h3>
      <p class="text-gray-600 font-poppins">{game.description}</p>
    </div>

    <!-- 게임 통계 -->
    <div class="space-y-4 mb-6">
      <div class="flex justify-between items-center">
        <span class="text-gray-600 font-poppins">환원율</span>
        <span class="font-semibold {game.id === 'blackjack' ? 'text-primary-soft-pink' : game.id === 'baccarat' ? 'text-primary-soft-mint' : 'text-primary-soft-peach'}">{game.rtp}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-600 font-poppins">베팅 범위</span>
        <span class="font-semibold {game.id === 'blackjack' ? 'text-primary-soft-purple' : game.id === 'baccarat' ? 'text-accent-mint-cream' : 'text-accent-coral'}">{game.minBet} - {game.maxBet}</span>
      </div>
    </div>

    <!-- 게임 특징 -->
    <div class="mb-6">
      <div class="text-gray-500 text-sm mb-3 font-poppins">게임 특징</div>
      <div class="flex flex-wrap gap-2">
        {#each game.features as feature}
          <span class="bg-white/40 text-gray-700 text-xs px-3 py-1 rounded-full font-poppins">
            {feature}
          </span>
        {/each}
      </div>
    </div>

    <!-- 액션 버튼 -->
    <a href="/{game.id}" class="block w-full py-3 bg-gradient-to-r {game.id === 'blackjack' ? 'from-primary-soft-pink to-accent-rose-gold' : game.id === 'baccarat' ? 'from-primary-soft-mint to-accent-mint-cream' : 'from-primary-soft-peach to-accent-coral'} text-white rounded-full font-poppins font-semibold hover:shadow-lg transition-all group-hover:scale-105 text-center">
      게임 시작
    </a>
  </div>
</div>