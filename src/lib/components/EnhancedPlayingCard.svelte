<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let suit = 'hearts';
  export let rank = 'A';
  export let isHidden = false;
  export let isDealing = false;
  export let dealDelay = 0;
  export let size = 'normal'; // 'small', 'normal', 'large'
  export let isSelected = false;
  export let isWinning = false;
  export let flipAnimation = false;
  export let glowEffect = false;

  const dispatch = createEventDispatcher();

  let cardElement;
  let isVisible = false;
  let isFlipped = isHidden;

  $: sizeClasses = {
    small: 'w-12 h-16',
    normal: 'w-16 h-24',
    large: 'w-20 h-32'
  }[size];

  $: textSize = {
    small: 'text-xs',
    normal: 'text-lg',
    large: 'text-xl'
  }[size];

  // 카드 색상 결정 (기호 또는 영어 이름 모두 지원)
  $: normalizedSuit = suit === '♥' ? 'hearts' :
                      suit === '♦' ? 'diamonds' :
                      suit === '♣' ? 'clubs' :
                      suit === '♠' ? 'spades' : suit;

  $: isRed = normalizedSuit === 'hearts' || normalizedSuit === 'diamonds';
  $: suitIcon = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  }[normalizedSuit] || suit;

  $: displayRank = rank === 'J' ? 'J' :
                   rank === 'Q' ? 'Q' :
                   rank === 'K' ? 'K' :
                   rank === 'A' ? 'A' : rank;

  // 카드 그림 레이아웃 결정
  $: cardPattern = getCardPattern(rank, suit);

  function getCardPattern(rank, suit) {
    // normalizedSuit 사용

    if (rank === 'A') {
      const aceSize = size === 'large' ? 'text-4xl' : size === 'small' ? 'text-2xl' : 'text-3xl';
      return { type: 'ace', symbols: [{ x: '50%', y: '50%', size: aceSize }] };
    } else if (['J', 'Q', 'K'].includes(rank)) {
      return { type: 'face', symbols: [] };
    } else {
      const num = parseInt(rank);
      const positions = getNumberPositions(num);
      return {
        type: 'number',
        symbols: positions.map(pos => ({
          x: pos.x,
          y: pos.y,
          size: size === 'large' ? 'text-xl' : size === 'small' ? 'text-xs' : 'text-base',
          rotate: pos.rotate
        }))
      };
    }
  }

  function getNumberPositions(num) {
    const positions = [];

    switch(num) {
      case 2:
        positions.push({ x: '50%', y: '25%' });
        positions.push({ x: '50%', y: '75%', rotate: true });
        break;
      case 3:
        positions.push({ x: '50%', y: '20%' });
        positions.push({ x: '50%', y: '50%' });
        positions.push({ x: '50%', y: '80%', rotate: true });
        break;
      case 4:
        positions.push({ x: '30%', y: '25%' });
        positions.push({ x: '70%', y: '25%' });
        positions.push({ x: '30%', y: '75%', rotate: true });
        positions.push({ x: '70%', y: '75%', rotate: true });
        break;
      case 5:
        positions.push({ x: '30%', y: '20%' });
        positions.push({ x: '70%', y: '20%' });
        positions.push({ x: '50%', y: '50%' });
        positions.push({ x: '30%', y: '80%', rotate: true });
        positions.push({ x: '70%', y: '80%', rotate: true });
        break;
      case 6:
        positions.push({ x: '30%', y: '20%' });
        positions.push({ x: '70%', y: '20%' });
        positions.push({ x: '30%', y: '50%' });
        positions.push({ x: '70%', y: '50%' });
        positions.push({ x: '30%', y: '80%', rotate: true });
        positions.push({ x: '70%', y: '80%', rotate: true });
        break;
      case 7:
        positions.push({ x: '30%', y: '17%' });
        positions.push({ x: '70%', y: '17%' });
        positions.push({ x: '50%', y: '35%' });
        positions.push({ x: '30%', y: '50%' });
        positions.push({ x: '70%', y: '50%' });
        positions.push({ x: '30%', y: '83%', rotate: true });
        positions.push({ x: '70%', y: '83%', rotate: true });
        break;
      case 8:
        positions.push({ x: '30%', y: '15%' });
        positions.push({ x: '70%', y: '15%' });
        positions.push({ x: '50%', y: '30%' });
        positions.push({ x: '30%', y: '45%' });
        positions.push({ x: '70%', y: '45%' });
        positions.push({ x: '50%', y: '70%', rotate: true });
        positions.push({ x: '30%', y: '85%', rotate: true });
        positions.push({ x: '70%', y: '85%', rotate: true });
        break;
      case 9:
        positions.push({ x: '30%', y: '15%' });
        positions.push({ x: '70%', y: '15%' });
        positions.push({ x: '30%', y: '35%' });
        positions.push({ x: '70%', y: '35%' });
        positions.push({ x: '50%', y: '50%' });
        positions.push({ x: '30%', y: '65%', rotate: true });
        positions.push({ x: '70%', y: '65%', rotate: true });
        positions.push({ x: '30%', y: '85%', rotate: true });
        positions.push({ x: '70%', y: '85%', rotate: true });
        break;
      case 10:
        positions.push({ x: '30%', y: '12%' });
        positions.push({ x: '70%', y: '12%' });
        positions.push({ x: '50%', y: '25%' });
        positions.push({ x: '30%', y: '40%' });
        positions.push({ x: '70%', y: '40%' });
        positions.push({ x: '30%', y: '60%', rotate: true });
        positions.push({ x: '70%', y: '60%', rotate: true });
        positions.push({ x: '50%', y: '75%', rotate: true });
        positions.push({ x: '30%', y: '88%', rotate: true });
        positions.push({ x: '70%', y: '88%', rotate: true });
        break;
      default:
        positions.push({ x: '50%', y: '50%' });
    }

    return positions;
  }

  onMount(() => {
    if (isDealing) {
      setTimeout(() => {
        isVisible = true;
        if (flipAnimation && isHidden) {
          setTimeout(() => {
            isFlipped = false;
          }, 300);
        }
      }, dealDelay);
    } else {
      isVisible = true;
    }
  });

  function handleClick() {
    dispatch('click', { suit, rank });
  }

  function handleFlip() {
    if (flipAnimation) {
      isFlipped = !isFlipped;
      dispatch('flip', { suit, rank, isFlipped });
    }
  }
</script>

<div
  bind:this={cardElement}
  class="playing-card {sizeClasses} cursor-pointer select-none"
  class:dealing={isDealing && !isVisible}
  class:visible={isVisible}
  class:selected={isSelected}
  class:winning={isWinning}
  class:glow={glowEffect}
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
>
  <div class="card-inner" class:flipped={isFlipped}>
    <!-- 카드 앞면 -->
    <div class="card-front">
      <div class="card-content bg-white rounded-lg shadow-lg border border-gray-300 h-full relative overflow-hidden">
        <!-- 좌상단 -->
        <div class="absolute top-1 left-1 flex flex-col items-center">
          <div class="rank {textSize} font-bold {isRed ? 'text-red-500' : 'text-black'}">{displayRank}</div>
          <div class="suit {textSize} {isRed ? 'text-red-500' : 'text-black'}">{suitIcon}</div>
        </div>

        <!-- 우하단 (뒤집힌 형태) -->
        <div class="absolute bottom-1 right-1 flex flex-col items-center transform rotate-180">
          <div class="rank {textSize} font-bold {isRed ? 'text-red-500' : 'text-black'}">{displayRank}</div>
          <div class="suit {textSize} {isRed ? 'text-red-500' : 'text-black'}">{suitIcon}</div>
        </div>

        <!-- 카드 중앙 패턴 -->
        <div class="absolute inset-2">
          {#if cardPattern.type === 'ace'}
            <!-- 에이스 패턴 -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div class="{cardPattern.symbols[0].size} {isRed ? 'text-red-500' : 'text-black'}">{suitIcon}</div>
            </div>
          {:else if cardPattern.type === 'face'}
            <!-- 페이스 카드 패턴 -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="{size === 'large' ? 'text-3xl' : size === 'small' ? 'text-lg' : 'text-2xl'} {isRed ? 'text-red-500' : 'text-black'} mb-1">{suitIcon}</div>
                <div class="{size === 'large' ? 'text-2xl' : size === 'small' ? 'text-base' : 'text-xl'} font-bold {isRed ? 'text-red-500' : 'text-black'}">{displayRank}</div>
                <div class="{size === 'large' ? 'text-3xl' : size === 'small' ? 'text-lg' : 'text-2xl'} {isRed ? 'text-red-500' : 'text-black'} mt-1">{suitIcon}</div>
              </div>
            </div>
          {:else if cardPattern.type === 'number'}
            <!-- 숫자 카드 패턴 -->
            {#each cardPattern.symbols as symbol, index}
              <div
                class="absolute transform -translate-x-1/2 -translate-y-1/2 {symbol.rotate ? 'rotate-180' : ''}"
                style="left: {symbol.x}; top: {symbol.y};"
              >
                <div class="{symbol.size} {isRed ? 'text-red-500' : 'text-black'}">{suitIcon}</div>
              </div>
            {/each}
          {/if}
        </div>

        <!-- 윈윈 효과 -->
        {#if isWinning}
          <div class="absolute inset-0 bg-yellow-400 opacity-20 animate-pulse"></div>
        {/if}

        <!-- 선택 효과 -->
        {#if isSelected}
          <div class="absolute inset-0 border-2 border-blue-500 rounded-lg"></div>
        {/if}
      </div>
    </div>

    <!-- 카드 뒷면 -->
    <div class="card-back">
      <div class="card-content bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg shadow-lg border border-gray-300 h-full relative overflow-hidden">
        <!-- 카드 뒷면 패턴 -->
        <div class="absolute inset-0 opacity-30"
             style="background-image: repeating-linear-gradient(
               45deg,
               transparent,
               transparent 10px,
               rgba(255,255,255,0.1) 10px,
               rgba(255,255,255,0.1) 20px
             )">
        </div>

        <!-- 중앙 로고 -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="text-2xl text-white font-bold">🎰</div>
        </div>

        <!-- 모서리 장식 -->
        <div class="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white opacity-50"></div>
        <div class="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white opacity-50"></div>
        <div class="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white opacity-50"></div>
        <div class="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white opacity-50"></div>
      </div>
    </div>
  </div>
</div>

<style>
  .playing-card {
    perspective: 1000px;
    transition: transform 0.3s ease;
  }

  .playing-card:hover {
    transform: translateY(-2px);
  }

  .playing-card.selected {
    transform: translateY(-4px) scale(1.05);
  }

  .playing-card.winning {
    animation: cardWin 1s ease-in-out;
  }

  .playing-card.glow {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }

  .playing-card.dealing {
    opacity: 0;
    transform: translateX(-100px) rotate(-10deg);
  }

  .playing-card.visible {
    opacity: 1;
    transform: translateX(0) rotate(0deg);
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .card-inner.flipped {
    transform: rotateY(180deg);
  }

  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }

  .card-back {
    transform: rotateY(180deg);
  }

  .card-content {
    transition: all 0.3s ease;
  }

  .playing-card:hover .card-content {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  @keyframes cardWin {
    0%, 100% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.1) rotate(2deg);
    }
    50% {
      transform: scale(1.15);
    }
    75% {
      transform: scale(1.1) rotate(-2deg);
    }
  }

  /* 딜링 애니메이션 */
  .playing-card.dealing.visible {
    animation: cardDeal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes cardDeal {
    0% {
      opacity: 0;
      transform: translateX(-100px) rotate(-10deg) scale(0.8);
    }
    70% {
      opacity: 1;
      transform: translateX(10px) rotate(2deg) scale(1.05);
    }
    100% {
      opacity: 1;
      transform: translateX(0) rotate(0deg) scale(1);
    }
  }
</style>