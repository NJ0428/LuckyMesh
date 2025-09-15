<script>
  import { onMount } from 'svelte';
  import { addRippleEffect } from '$lib/utils/animations.js';
  
  export let variant = 'primary'; // primary, secondary, accent
  export let size = 'md'; // sm, md, lg
  export let href = null;
  export let disabled = false;
  export let glow = false;
  export let loading = false;
  
  let buttonElement;
  
  onMount(() => {
    if (buttonElement && typeof window !== 'undefined') {
      addRippleEffect(buttonElement);
    }
  });
  
  $: classes = [
    'font-poppins font-semibold transition-all duration-300 rounded-full inline-flex items-center justify-center',
    // Size classes
    size === 'sm' ? 'px-4 py-2 text-sm' : 
    size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base',
    // Variant classes
    variant === 'primary' ? 'bg-gradient-to-r from-primary-soft-pink to-accent-rose-gold text-white hover:shadow-lg hover:scale-105' :
    variant === 'secondary' ? 'bg-white/25 backdrop-blur-sm border border-white/20 text-gray-700 hover:shadow-lg hover:scale-105' :
    variant === 'accent' ? 'bg-gradient-to-r from-primary-soft-mint to-accent-mint-cream text-white hover:shadow-lg hover:scale-105' : '',
    // State classes
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    glow ? 'pulse-glow' : '',
    loading ? 'animate-pulse' : ''
  ].filter(Boolean).join(' ');
</script>

{#if href && !disabled}
  <a 
    {href} 
    class={classes}
    bind:this={buttonElement}
    on:click
  >
    {#if loading}
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
    {/if}
    <slot />
  </a>
{:else}
  <button 
    class={classes}
    {disabled}
    bind:this={buttonElement}
    on:click
  >
    {#if loading}
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
    {/if}
    <slot />
  </button>
{/if}

<style>
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