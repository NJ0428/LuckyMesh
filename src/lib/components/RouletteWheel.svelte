<script>
  import { rouletteNumbers } from '$lib/stores/roulette.js';

  export let rotation = 0;
  export let isSpinning = false;
  export let spinDuration = 0;
  export let size = 'normal'; // 'small', 'normal', 'large'

  $: sizeClasses = {
    small: 'w-48 h-48',
    normal: 'w-80 h-80',
    large: 'w-96 h-96'
  }[size];

  $: numberSize = {
    small: 'text-xs',
    normal: 'text-sm',
    large: 'text-base'
  }[size];

  // 각 번호의 위치 계산 (원형 배치)
  function getNumberPosition(index, total) {
    const angle = (index * 360) / total - 90; // -90도로 12시 방향부터 시작
    const radius = size === 'small' ? 85 : size === 'normal' ? 140 : 170;
    const x = Math.cos(angle * Math.PI / 180) * radius;
    const y = Math.sin(angle * Math.PI / 180) * radius;
    return { x, y, angle };
  }
</script>

<div class="relative {sizeClasses} mx-auto">
  <!-- 룰렛 휠 배경 -->
  <div
    class="absolute inset-0 rounded-full shadow-2xl transition-transform ease-out"
    class:duration-1000={!isSpinning}
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
      transform: rotate({rotation}deg);
      transition-duration: {isSpinning ? spinDuration + 'ms' : '1000ms'};
    "
  >
    <!-- 외곽 테두리 -->
    <div class="absolute inset-0 rounded-full border-8 border-yellow-400"></div>

    <!-- 내부 테두리 -->
    <div class="absolute inset-4 rounded-full border-2 border-yellow-300"></div>
  </div>

  <!-- 번호들 -->
  <div class="absolute inset-0 rounded-full">
    {#each rouletteNumbers as numberObj, index}
      {@const position = getNumberPosition(index, rouletteNumbers.length)}
      <div
        class="absolute flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/30 {numberSize} font-bold text-white transition-transform ease-out"
        class:duration-1000={!isSpinning}
        style="
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) translate({position.x}px, {position.y}px) rotate({rotation}deg) rotate({-position.angle - 90}deg);
          transition-duration: {isSpinning ? spinDuration + 'ms' : '1000ms'};
        "
      >
        {numberObj.number}
      </div>
    {/each}
  </div>

  <!-- 중앙 허브 -->
  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 flex items-center justify-center shadow-lg">
    <div class="text-2xl">🎰</div>
  </div>

  <!-- 포인터 (12시 방향) -->
  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
    <div class="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
  </div>
</div>

<style>
  /* 스핀 애니메이션을 위한 추가 스타일 */
  .transition-transform {
    transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
  }
</style>