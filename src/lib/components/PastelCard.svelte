<script>
  import { onMount } from 'svelte';
  import { enhanceCardHover } from '$lib/utils/animations.js';
  
  export let padding = 'p-6';
  export let hover = true;
  export let glow = false;
  export let gradient = false;
  export let gradientFrom = 'pastel-pink';
  export let gradientTo = 'pastel-lavender';
  
  let cardElement;
  
  onMount(() => {
    if (cardElement && hover && typeof window !== 'undefined') {
      enhanceCardHover(cardElement);
    }
  });
  
  $: classes = [
    'rounded-2xl shadow-lg transition-all duration-300',
    gradient ? `bg-gradient-to-br from-${gradientFrom} to-${gradientTo}` : 'glass-card',
    hover ? 'card-hover cursor-pointer' : '',
    glow ? 'pulse-glow' : '',
    padding
  ].filter(Boolean).join(' ');
</script>

{#if hover}
  <button 
    class={classes}
    bind:this={cardElement}
    on:click
    on:mouseenter
    on:mouseleave
    type="button"
  >
    <slot />
  </button>
{:else}
  <div 
    class={classes}
    bind:this={cardElement}
  >
    <slot />
  </div>
{/if}

<style>
  :global(.glass-card) {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  
  :global(.card-hover:hover) {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(184, 230, 204, 0.25);
  }
  
  :global(.pulse-glow) {
    animation: pulseGlow 2s ease-in-out infinite;
  }
  
  @keyframes pulseGlow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(248, 187, 217, 0.3);
    }
    50% { 
      box-shadow: 0 0 30px rgba(248, 187, 217, 0.6);
    }
  }
</style>