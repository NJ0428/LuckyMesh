<script>
  export let suit = '';
  export let value = '';
  export let isHidden = false;
  export let size = 'normal'; // 'small', 'normal', 'large'

  $: sizeClasses = {
    small: 'w-12 h-16',
    normal: 'w-16 h-24',
    large: 'w-20 h-32'
  }[size];

  $: isRed = suit === '♥' || suit === '♦';

  function getSuitEmoji(suit) {
    switch(suit) {
      case '♠': return '♠️';
      case '♥': return '♥️';
      case '♦': return '♦️';
      case '♣': return '♣️';
      default: return '';
    }
  }
</script>

<div class="playing-card {sizeClasses} {isHidden ? 'card-back' : 'card-front'} {isRed ? 'red-card' : 'black-card'}">
  {#if isHidden}
    <div class="card-back-pattern">
      <div class="pattern-grid">
        {#each Array(20) as _, i}
          <div class="pattern-dot"></div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="card-content">
      <div class="card-corner top-left">
        <div class="card-value">{value}</div>
        <div class="card-suit">{getSuitEmoji(suit)}</div>
      </div>

      <div class="card-center">
        <div class="center-suit">{getSuitEmoji(suit)}</div>
      </div>

      <div class="card-corner bottom-right">
        <div class="card-value rotated">{value}</div>
        <div class="card-suit rotated">{getSuitEmoji(suit)}</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .playing-card {
    @apply bg-white border-2 border-gray-300 rounded-lg shadow-lg relative overflow-hidden;
    transition: all 0.3s ease;
    perspective: 1000px;
  }

  .card-back {
    @apply bg-gradient-to-br from-primary-soft-purple to-primary-soft-pink;
  }

  .card-back-pattern {
    @apply w-full h-full flex items-center justify-center;
  }

  .pattern-grid {
    @apply grid grid-cols-4 gap-1 p-2;
  }

  .pattern-dot {
    @apply w-1 h-1 bg-white/30 rounded-full;
  }

  .card-front {
    @apply bg-white;
  }

  .red-card .card-value,
  .red-card .card-suit {
    @apply text-red-500;
  }

  .black-card .card-value,
  .black-card .card-suit {
    @apply text-gray-800;
  }

  .card-content {
    @apply w-full h-full relative p-1;
  }

  .card-corner {
    @apply absolute flex flex-col items-center;
  }

  .top-left {
    @apply top-1 left-1;
  }

  .bottom-right {
    @apply bottom-1 right-1;
  }

  .card-value {
    @apply text-xs font-bold leading-none;
  }

  .card-suit {
    @apply text-xs leading-none;
  }

  .rotated {
    @apply rotate-180;
  }

  .card-center {
    @apply absolute inset-0 flex items-center justify-center;
  }

  .center-suit {
    @apply text-2xl;
  }

  .playing-card:hover {
    @apply transform scale-105;
  }

  /* 크기별 조정 */
  .w-12.h-16 .card-value { @apply text-xs; }
  .w-12.h-16 .center-suit { @apply text-lg; }

  .w-20.h-32 .card-value { @apply text-sm; }
  .w-20.h-32 .center-suit { @apply text-3xl; }
</style>