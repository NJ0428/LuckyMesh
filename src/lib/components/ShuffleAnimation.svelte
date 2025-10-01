<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { soundActions } from '$lib/stores/soundSystem.js';

  export let show = false;
  export let duration = 2000;

  const dispatch = createEventDispatcher();

  let container;
  let cards = [];
  let animationId;

  // 카드 생성
  function createCard() {
    return {
      id: Math.random(),
      x: Math.random() * 200 + 100,
      y: Math.random() * 100 + 150,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.3 + 0.7,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      rotationSpeed: (Math.random() - 0.5) * 15,
      opacity: 0.8 + Math.random() * 0.2,
      life: 1,
      suit: ['♠', '♥', '♦', '♣'][Math.floor(Math.random() * 4)],
      value: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][Math.floor(Math.random() * 13)]
    };
  }

  function animate() {
    if (!show) return;

    // 카드 업데이트
    cards = cards.map(card => ({
      ...card,
      x: card.x + card.vx,
      y: card.y + card.vy,
      rotation: card.rotation + card.rotationSpeed,
      vx: card.vx * 0.99, // 마찰
      vy: card.vy * 0.99,
      life: card.life - 0.008,
      opacity: Math.max(0, card.life * 0.8)
    })).filter(card => card.life > 0);

    if (show) {
      animationId = requestAnimationFrame(animate);
    }
  }

  function startShuffle() {
    if (!show) return;

    // 사운드 재생
    soundActions.playShuffle();

    // 카드 생성
    cards = [];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        if (show) {
          cards = [...cards, createCard()];
        }
      }, i * 50);
    }

    animate();

    // 지정된 시간 후 애니메이션 종료
    setTimeout(() => {
      show = false;
      dispatch('complete');
    }, duration);
  }

  function stopShuffle() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    cards = [];
  }

  $: if (show) {
    startShuffle();
  } else {
    stopShuffle();
  }

  onMount(() => {
    return () => {
      stopShuffle();
    };
  });

  function getCardColor(suit) {
    return (suit === '♥' || suit === '♦') ? 'text-red-600' : 'text-black';
  }
</script>

<style>
  .shuffle-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 300px;
    pointer-events: none;
    z-index: 999;
  }

  .card {
    position: absolute;
    width: 40px;
    height: 56px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .shuffle-text {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 18px;
    font-weight: bold;
    animation: shimmer 1s infinite;
  }

  @keyframes shimmer {
    0%, 100% {
      background: rgba(0, 0, 0, 0.8);
    }
    50% {
      background: rgba(50, 50, 50, 0.9);
    }
  }

  .deck-pile {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 84px;
    perspective: 1000px;
  }

  .deck-card {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    border-radius: 8px;
    border: 2px solid #1e40af;
    animation: deckBounce 0.8s ease-in-out infinite;
  }

  .deck-card::before {
    content: '🃏';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 24px;
    color: white;
  }

  @keyframes deckBounce {
    0%, 100% {
      transform: translateY(0) rotateX(0deg);
    }
    50% {
      transform: translateY(-5px) rotateX(5deg);
    }
  }
</style>

{#if show}
  <div class="shuffle-container" bind:this={container}>
    <div class="shuffle-text">
      🔀 카드 섞는 중...
    </div>

    <div class="deck-pile">
      <div class="deck-card" style="transform: translateZ(0px);" />
      <div class="deck-card" style="transform: translateZ(2px); opacity: 0.9;" />
      <div class="deck-card" style="transform: translateZ(4px); opacity: 0.8;" />
    </div>

    {#each cards as card (card.id)}
      <div
        class="card {getCardColor(card.suit)}"
        style="
          left: {card.x}px;
          top: {card.y}px;
          transform: rotate({card.rotation}deg) scale({card.scale});
          opacity: {card.opacity};
        "
      >
        <div>{card.value}</div>
        <div style="font-size: 14px;">{card.suit}</div>
      </div>
    {/each}
  </div>
{/if}