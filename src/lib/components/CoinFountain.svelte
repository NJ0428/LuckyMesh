<script>
  import { onMount, createEventDispatcher } from 'svelte';

  export let winAmount = 0;
  export let show = false;
  export let duration = 3000;

  const dispatch = createEventDispatcher();

  let container;
  let coins = [];
  let animationId;

  function createCoin() {
    return {
      id: Math.random(),
      x: Math.random() * 300 + 50, // 컨테이너 너비 내에서 랜덤
      y: -20,
      vx: (Math.random() - 0.5) * 4, // 수평 속도
      vy: Math.random() * 2 + 2, // 수직 속도
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 10,
      scale: Math.random() * 0.5 + 0.5,
      opacity: 1,
      life: 1
    };
  }

  function animate() {
    if (!show) return;

    // 새 코인 생성
    if (Math.random() < 0.3 && coins.length < 50) {
      coins.push(createCoin());
    }

    // 코인 업데이트
    coins = coins.map(coin => ({
      ...coin,
      x: coin.x + coin.vx,
      y: coin.y + coin.vy,
      vy: coin.vy + 0.2, // 중력
      rotation: coin.rotation + coin.rotationSpeed,
      life: coin.life - 0.01,
      opacity: Math.max(0, coin.life)
    })).filter(coin => coin.y < 400 && coin.life > 0);

    if (show) {
      animationId = requestAnimationFrame(animate);
    }
  }

  function startAnimation() {
    if (!show) return;

    coins = [];
    animate();

    // 지정된 시간 후 애니메이션 종료
    setTimeout(() => {
      show = false;
      dispatch('complete');
    }, duration);
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    coins = [];
  }

  $: if (show) {
    startAnimation();
  } else {
    stopAnimation();
  }

  onMount(() => {
    return () => {
      stopAnimation();
    };
  });
</script>

<style>
  .fountain-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 400px;
    pointer-events: none;
    z-index: 1000;
  }

  .coin {
    position: absolute;
    width: 24px;
    height: 24px;
    background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
    border-radius: 50%;
    border: 2px solid #b8860b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #8b4513;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .coin::before {
    content: '$';
    font-size: 14px;
  }

  .amount-display {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: #ffd700;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 24px;
    font-weight: bold;
    border: 2px solid #ffd700;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: translateX(-50%) scale(1);
    }
    50% {
      transform: translateX(-50%) scale(1.05);
    }
  }

  .celebration-text {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    color: #ffd700;
    font-size: 32px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    animation: bounce 0.6s infinite alternate;
  }

  @keyframes bounce {
    from {
      transform: translateX(-50%) translateY(0px);
    }
    to {
      transform: translateX(-50%) translateY(-10px);
    }
  }
</style>

{#if show}
  <div class="fountain-container" bind:this={container}>
    <div class="amount-display">
      +${winAmount}
    </div>

    <div class="celebration-text">
      🎉 승리! 🎉
    </div>

    {#each coins as coin (coin.id)}
      <div
        class="coin"
        style="
          left: {coin.x}px;
          top: {coin.y}px;
          transform: rotate({coin.rotation}deg) scale({coin.scale});
          opacity: {coin.opacity};
        "
      />
    {/each}
  </div>
{/if}