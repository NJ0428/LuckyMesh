<script>
  import PastelCard from './PastelCard.svelte';
  import EnhancedPlayingCard from './EnhancedPlayingCard.svelte';

  // Mock data for players and community cards
  const players = [
    { id: 1, name: '플레이어 1', hand: [{suit: 'clubs', rank: '10'}, {suit: 'diamonds', rank: 'J'}], bet: 50, stack: 950, isTurn: false, isFolded: false },
    { id: 2, name: '플레이어 2', hand: null, bet: 100, stack: 900, isTurn: true, isFolded: false },
    { id: 3, name: '플레이어 3', hand: null, bet: 0, stack: 1000, isTurn: false, isFolded: true },
    { id: 4, name: '플레이어 4', hand: null, bet: 0, stack: 1000, isTurn: false, isFolded: false },
    { id: 5, name: '플레이어 5', hand: null, bet: 0, stack: 1000, isTurn: false, isFolded: false },
    { id: 6, name: 'You', hand: [{suit: 'spades', rank: 'A'}, {suit: 'hearts', rank: 'K'}], bet: 200, stack: 800, isTurn: false, isFolded: false },
  ];

  const communityCards = [
    { suit: 'hearts', rank: '2' },
    { suit: 'diamonds', rank: '7' },
    { suit: 'spades', rank: 'Q' },
  ];

  const potAmount = 350;

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<div class="relative w-full aspect-[2/1] bg-green-800 rounded-full border-[16px] border-yellow-800 shadow-2xl">
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="w-3/4 h-3/4 border-4 border-yellow-600 rounded-full"></div>
  </div>

  <!-- Community Cards -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-4">
    <div class="flex space-x-2">
      {#each communityCards as card}
        <EnhancedPlayingCard suit={card.suit} rank={card.rank} size="medium" />
      {/each}
      {#each { length: 5 - communityCards.length } as _}
        <div class="w-16 h-24 bg-gray-300 rounded-lg opacity-20"></div>
      {/each}
    </div>
    <div class="bg-black/50 text-white px-4 py-2 rounded-lg">
      <span class="font-bold text-lg">Pot: {formatCurrency(potAmount)}</span>
    </div>
  </div>

  <!-- Player Positions -->
  <div class="absolute inset-0">
    {#each players as player, i}
      {@const angle = (i / players.length) * 2 * Math.PI - Math.PI / 2}
      {@const x = 50 + 45 * Math.cos(angle)}
      {@const y = 50 + 45 * Math.sin(angle)}
      <div class="absolute" style="left: {x}%; top: {y}%; transform: translate(-50%, -50%);">
        <div class="flex flex-col items-center space-y-2">
            <PastelCard padding="p-2" class="w-32 {player.isFolded ? 'opacity-50' : ''} {player.isTurn ? 'ring-4 ring-blue-400' : ''}">
                <div class="text-center">
                <p class="font-bold text-sm truncate">{player.name}</p>
                <p class="text-xs font-semibold text-green-600">{formatCurrency(player.stack)}</p>
                {#if player.bet > 0}
                    <div class="mt-1 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full inline-block">
                        {formatCurrency(player.bet)}
                    </div>
                {/if}
                </div>
            </PastelCard>
            {#if player.hand}
            <div class="flex space-x-1">
              <EnhancedPlayingCard suit={player.hand[0].suit} rank={player.hand[0].rank} size="small" />
              <EnhancedPlayingCard suit={player.hand[1].suit} rank={player.hand[1].rank} size="small" />
            </div>
            {:else if !player.isFolded}
             <div class="flex space-x-1">
                <div class="w-8 h-12 bg-blue-800 rounded"></div>
                <div class="w-8 h-12 bg-blue-800 rounded"></div>
            </div>
            {/if}
        </div>
      </div>
    {/each}
  </div>
</div>
