<script>
  import { rouletteNumbers } from '$lib/stores/roulette.js';
  import { onMount } from 'svelte';

  export let rotation = 0;
  export let isSpinning = false;
  export let spinDuration = 0;
  export let size = 'normal'; // 'small', 'normal', 'large'
  export let winningNumber = null;

  let wheelElement;
  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  $: sizeClasses = {
    small: 'w-48 h-48',
    normal: 'w-[500px] h-[500px]',
    large: 'w-[600px] h-[600px]'
  }[size];

  $: numberSize = {
    small: 'text-xs',
    normal: 'text-lg',
    large: 'text-xl'
  }[size];

  // 각 번호의 위치 계산 (원형 배치)
  function getNumberPosition(index, total) {
    const angle = (index * 360) / total - 90; // -90도로 12시 방향부터 시작
    const radius = size === 'small' ? 85 : size === 'normal' ? 220 : 270;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    return { x, y, angle };
  }
</script>

<div class="relative {sizeClasses} mx-auto" bind:this={wheelElement}>
  <!-- 3D 그림자와 조명 효과 -->
  <div class="absolute inset-0 rounded-full" style="
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, rgba(0,0,0,0.1) 0%, transparent 50%);
    transform: translateZ(10px);
  "></div>

  <!-- 룰렛 휠 배경 -->
  <div
    class="absolute inset-0 rounded-full shadow-2xl transition-transform wheel-3d"
    style="
      background: conic-gradient(
        from 0deg,
        {rouletteNumbers.map((item, i) => {
          const startAngle = (i * 360) / rouletteNumbers.length;
          const endAngle = ((i + 1) * 360) / rouletteNumbers.length;
          const color = item.color === 'red' ? '#ef4444' :
                       item.color === 'black' ? '#1f2937' : '#22c55e';
          return `${color} ${startAngle}deg ${endAngle}deg`;
        }).join(', ')}
      );
      transform: rotate({rotation}deg) perspective(1000px) rotateX(5deg);
      transition-duration: {isSpinning ? spinDuration + 'ms' : '1000ms'};
      transition-timing-function: {isSpinning ? 'cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'ease-out'};
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.1);
    "
  >
    <!-- 외곽 테두리 (3D 효과) -->
    <div class="absolute inset-0 rounded-full border-8 border-yellow-400" style="
      box-shadow: inset 0 0 20px rgba(255, 193, 7, 0.5), 0 0 20px rgba(255, 193, 7, 0.3);
    "></div>

    <!-- 내부 테두리 -->
    <div class="absolute inset-4 rounded-full border-2 border-yellow-300" style="
      box-shadow: inset 0 0 10px rgba(255, 224, 130, 0.4);
    "></div>

    <!-- 승리 번호 하이라이트 -->
    {#if winningNumber !== null && mounted}
      {@const winIndex = rouletteNumbers.findIndex(n => n.number === winningNumber)}
      {#if winIndex >= 0}
        {@const highlightAngle = (winIndex * 360) / rouletteNumbers.length}
        <div class="absolute inset-0 rounded-full winning-highlight" style="
          background: conic-gradient(
            from {highlightAngle - 5}deg,
            transparent {highlightAngle - 5}deg,
            rgba(255, 255, 0, 0.4) {highlightAngle}deg,
            rgba(255, 255, 0, 0.6) {highlightAngle + (360 / rouletteNumbers.length / 2)}deg,
            rgba(255, 255, 0, 0.4) {highlightAngle + (360 / rouletteNumbers.length)}deg,
            transparent {highlightAngle + (360 / rouletteNumbers.length) + 5}deg
          );
          animation: pulse 2s infinite;
        "></div>
      {/if}
    {/if}
  </div>

  <!-- 번호들 -->
  <div class="absolute inset-0 rounded-full">
    {#each rouletteNumbers as numberObj, index}
      {@const position = getNumberPosition(index, rouletteNumbers.length)}
      <div
        class="absolute flex items-center justify-center w-12 h-12 rounded-full border-2 border-white/30 {numberSize} font-bold text-white transition-transform"
        style="
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) translate({position.x}px, {position.y}px) rotate({rotation}deg) rotate({-position.angle - 90}deg);
          transition-duration: {isSpinning ? spinDuration + 'ms' : '1000ms'};
          transition-timing-function: {isSpinning ? 'cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'ease-out'};
        "
      >
        {numberObj.number}
      </div>
    {/each}
  </div>

  <!-- 중앙 허브 (3D 효과) -->
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 flex items-center justify-center shadow-lg hub-3d">
    <div class="text-4xl animate-spin-slow">🎰</div>
  </div>

  <!-- 포인터 (12시 방향) -->
  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
    <div class="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
  </div>
</div>

<style>
  /* 3D 룰렛 휠 효과 */
  .wheel-3d {
    transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
    transform-style: preserve-3d;
  }

  .wheel-3d.spinning {
    animation: spin-3d var(--spin-duration, 3000ms) cubic-bezier(0.17, 0.67, 0.12, 0.99);
  }

  .hub-3d {
    transform: translateZ(15px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.2);
  }

  .winning-highlight {
    pointer-events: none;
  }

  @keyframes spin-3d {
    0% {
      transform: rotate(0deg) perspective(1000px) rotateX(5deg);
    }
    50% {
      transform: rotate(180deg) perspective(1000px) rotateX(8deg);
    }
    100% {
      transform: rotate(360deg) perspective(1000px) rotateX(5deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes spin-slow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
</style>