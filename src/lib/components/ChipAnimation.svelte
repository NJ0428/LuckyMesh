<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let amount = 0;
  export let color = 'blue';
  export let size = 'medium';
  export let animationType = 'bounce'; // 'bounce', 'slide', 'fade', 'flip'
  export let delay = 0;
  export let show = true;

  const dispatch = createEventDispatcher();

  let chipElement;
  let animationPlaying = false;

  const colorMap = {
    'red': 'bg-gradient-to-br from-red-500 to-red-700 border-red-600',
    'blue': 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-600',
    'green': 'bg-gradient-to-br from-green-500 to-green-700 border-green-600',
    'purple': 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-600',
    'orange': 'bg-gradient-to-br from-orange-500 to-orange-700 border-orange-600',
    'yellow': 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500',
    'gray': 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-600'
  };

  const sizeMap = {
    'small': 'w-8 h-8 text-xs',
    'medium': 'w-12 h-12 text-sm',
    'large': 'w-16 h-16 text-base'
  };

  function getChipColor(amount) {
    if (amount >= 500) return 'purple';
    if (amount >= 250) return 'orange';
    if (amount >= 100) return 'green';
    if (amount >= 50) return 'blue';
    if (amount >= 25) return 'red';
    if (amount >= 10) return 'yellow';
    return 'gray';
  }

  function playAnimation() {
    if (!chipElement || animationPlaying) return;

    animationPlaying = true;

    setTimeout(() => {
      chipElement.classList.add('animate');

      setTimeout(() => {
        animationPlaying = false;
        chipElement.classList.remove('animate');
        dispatch('animationComplete');
      }, 600);
    }, delay);
  }

  onMount(() => {
    if (show) {
      playAnimation();
    }
  });

  $: actualColor = color === 'auto' ? getChipColor(amount) : color;
  $: chipClass = `${colorMap[actualColor]} ${sizeMap[size]}`;

  export function animate() {
    playAnimation();
  }
</script>

<style>
  .chip {
    border-radius: 50%;
    border-width: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: white;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .chip::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 20%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    opacity: 0.7;
  }

  .chip:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  /* 애니메이션 스타일 */
  .bounce.animate {
    animation: chipBounce 0.6s ease-out;
  }

  .slide.animate {
    animation: chipSlide 0.6s ease-out;
  }

  .fade.animate {
    animation: chipFade 0.6s ease-out;
  }

  .flip.animate {
    animation: chipFlip 0.6s ease-out;
  }

  @keyframes chipBounce {
    0% {
      transform: scale(0) translateY(50px);
      opacity: 0;
    }
    50% {
      transform: scale(1.2) translateY(-10px);
      opacity: 1;
    }
    100% {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }

  @keyframes chipSlide {
    0% {
      transform: translateX(-100px);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes chipFade {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes chipFlip {
    0% {
      transform: rotateY(-90deg) scale(0.8);
      opacity: 0;
    }
    50% {
      transform: rotateY(0deg) scale(1.1);
      opacity: 1;
    }
    100% {
      transform: rotateY(0deg) scale(1);
      opacity: 1;
    }
  }

  /* 반짝이는 효과 */
  .chip.shimmer::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
</style>

{#if show}
  <div
    bind:this={chipElement}
    class="chip {chipClass} {animationType}"
    on:click
    on:keydown
    role="button"
    tabindex="0"
  >
    <span class="text-shadow">
      {#if amount > 0}
        ${amount}
      {:else}
        <slot />
      {/if}
    </span>
  </div>
{/if}