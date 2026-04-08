<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut, elasticOut } from 'svelte/easing';

  export let show = false;
  export let jackpotName = '메가 잭팟';
  export let amount = 0;
  export let username = '';
  export let onClose = () => {};

  let particles = [];
  let fireworks = [];
  let coins = [];
  let confetti = [];
  let showMainText = false;
  let showAmount = false;
  let showButton = false;
  let animationFrame = null;
  let canvas = null;
  let ctx = null;

  // 파티클 시스템
  function createParticle(x, y, color) {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 10,
      size: Math.random() * 10 + 5,
      color,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      gravity: 0.3
    };
  }

  function createFirework(x, y) {
    const colors = ['#ff0000', '#ffd700', '#00ff00', '#00ffff', '#ff00ff', '#ff8c00'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const particles = [];

    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50;
      const speed = Math.random() * 5 + 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        gravity: 0.1
      });
    }

    return particles;
  }

  function createCoin(x, y) {
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 15 - 10,
      size: Math.random() * 20 + 20,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
      life: 1,
      decay: 0.005,
      gravity: 0.5,
      type: Math.random() > 0.5 ? 'gold' : 'rainbow'
    };
  }

  function createConfetti(x, y) {
    const colors = ['#ff0000', '#ffd700', '#00ff00', '#00ffff', '#ff00ff', '#ff8c00', '#ffffff'];
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 15,
      vy: -Math.random() * 10 - 5,
      size: Math.random() * 15 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 1,
      decay: Math.random() * 0.005 + 0.002,
      gravity: 0.2,
      flutter: Math.random() * 0.2
    };
  }

  function initCanvas() {
    canvas = document.getElementById('jackpot-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
    }
  }

  function resizeCanvas() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  function animate() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 파티클 업데이트 및 그리기
    particles = particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;

      if (p.life > 0) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      return false;
    });

    // 폭죽 업데이트 및 그리기
    fireworks.forEach(fw => {
      fw.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.life -= p.decay;

        if (p.life > 0) {
          ctx.save();
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    });

    // 코인 업데이트 및 그리기
    coins = coins.filter(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rotation += c.rotationSpeed;
      c.life -= c.decay;

      if (c.life > 0 && c.y < canvas.height + 50) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = c.life;

        // 코인 그리기
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, c.size);
        if (c.type === 'gold') {
          gradient.addColorStop(0, '#fff7ad');
          gradient.addColorStop(0.3, '#ffd700');
          gradient.addColorStop(1, '#daa520');
        } else {
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(0.5, '#ffd700');
          gradient.addColorStop(1, '#ff4500');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, c.size, c.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 코인 테두리
        ctx.strokeStyle = c.type === 'gold' ? '#b8860b' : '#ff6347';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 코인 텍스처
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = `${c.size * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₩', 0, 0);

        ctx.restore();
        return true;
      }
      return false;
    });

    // 종이 조각 업데이트 및 그리기
    confetti = confetti.filter(c => {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rotation += c.rotationSpeed;
      c.vx += Math.sin(c.y * c.flutter) * 0.5;
      c.life -= c.decay;

      if (c.life > 0 && c.y < canvas.height + 50) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = c.life;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
        ctx.restore();
        return true;
      }
      return false;
    });

    animationFrame = requestAnimationFrame(animate);
  }

  async function triggerEffect() {
    if (!canvas) {
      await tick();
      initCanvas();
    }

    // 초기 폭죽
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        fireworks.push(...createFirework(x, y));
      }, i * 200);
    }

    // 메인 텍스트 표시
    setTimeout(() => {
      showMainText = true;
    }, 500);

    // 금액 표시
    setTimeout(() => {
      showAmount = true;
      // 금액 표시 시 추가 폭죽
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height * 0.3;
          fireworks.push(...createFirework(x, y));
        }, i * 100);
      }
    }, 1500);

    // 코인 폭포
    setTimeout(() => {
      const coinInterval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
          coins.push(createCoin(Math.random() * canvas.width, -50));
        }
      }, 100);

      setTimeout(() => clearInterval(coinInterval), 5000);
    }, 2000);

    // 종이 조각
    setTimeout(() => {
      for (let i = 0; i < 200; i++) {
        setTimeout(() => {
          confetti.push(createConfetti(Math.random() * canvas.width, -20));
        }, i * 30);
      }
    }, 1000);

    // 닫기 버튼 표시
    setTimeout(() => {
      showButton = true;
    }, 4000);

    animate();
  }

  function formatAmount(amount) {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  }

  function handleClose() {
    show = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    particles = [];
    fireworks = [];
    coins = [];
    confetti = [];
    showMainText = false;
    showAmount = false;
    showButton = false;
    onClose();
  }

  onMount(() => {
    initCanvas();
  });

  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener('resize', resizeCanvas);
  });

  $: if (show) {
    triggerEffect();
  }
</script>

{#if show}
  <div class="jackpot-win-effect" transition:fade={{ duration: 300 }}>
    <!-- 캔버스 배경 -->
    <canvas id="jackpot-canvas" class="effect-canvas"></canvas>

    <!-- 배경 오버레이 -->
    <div class="overlay"></div>

    <!-- 메인 콘텐츠 -->
    <div class="content">
      {#if showMainText}
        <div class="jackpot-label" transition:fly={{ y: -50, duration: 1000, easing: elasticOut }}>
          <span class="label-glow">🎰 JACKPOT! 🎰</span>
        </div>
      {/if}

      {#if showMainText}
        <div class="jackpot-name" transition:scale={{ duration: 800, easing: quintOut }}>
          {jackpotName}
        </div>
      {/if}

      {#if showAmount}
        <div class="jackpot-amount" transition:fly={{ y: 50, duration: 1000, easing: elasticOut }}>
          <span class="amount-glow">{formatAmount(amount)}</span>
        </div>
      {/if}

      {#if username}
        <div class="winner-info" transition:fade={{ duration: 500, delay: 2000 }}>
          <span class="winner-label">당첨자:</span>
          <span class="winner-name">{username}</span>
        </div>
      {/if}

      {#if showButton}
        <button
          class="close-button"
          on:click={handleClose}
          transition:fade={{ duration: 500 }}
        >
          <span class="button-text">확인</span>
          <span class="button-glow"></span>
        </button>
      {/if}
    </div>

    <!-- 추가 빛나는 효과 -->
    <div class="sparkles"></div>
  </div>
{/if}

<style>
  .jackpot-win-effect {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .effect-canvas {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8));
    animation: overlay-pulse 2s ease-in-out infinite;
  }

  .content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 2rem;
  }

  .jackpot-label {
    margin-bottom: 1rem;
  }

  .label-glow {
    display: inline-block;
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(90deg, #ffd700, #ff8c00, #ff4500, #ffd700);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 2s linear infinite, text-glow 1.5s ease-in-out infinite;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  }

  .jackpot-name {
    font-size: 3rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    background: linear-gradient(180deg, #ffffff 0%, #ffd700 50%, #ff8c00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
    animation: bounce-in 0.8s ease-out;
  }

  .jackpot-amount {
    margin-bottom: 1.5rem;
  }

  .amount-glow {
    display: inline-block;
    font-size: 5rem;
    font-weight: 900;
    background: linear-gradient(90deg, #ffd700, #ffec8b, #ffd700, #ffa500, #ffd700);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 1.5s linear infinite, pulse-scale 1s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
  }

  .winner-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
    font-size: 1.25rem;
  }

  .winner-label {
    opacity: 0.8;
  }

  .winner-name {
    font-weight: 700;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .close-button {
    position: relative;
    padding: 1rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #000;
    background: linear-gradient(135deg, #ffd700, #ff8c00);
    border: none;
    border-radius: 9999px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  }

  .close-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
  }

  .button-text {
    position: relative;
    z-index: 1;
  }

  .button-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    animation: button-shine 2s linear infinite;
  }

  .sparkles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
      radial-gradient(2px 2px at 20% 30%, white, transparent),
      radial-gradient(2px 2px at 60% 70%, white, transparent),
      radial-gradient(2px 2px at 50% 50%, white, transparent),
      radial-gradient(2px 2px at 80% 10%, white, transparent),
      radial-gradient(2px 2px at 90% 60%, white, transparent),
      radial-gradient(2px 2px at 33% 50%, white, transparent),
      radial-gradient(2px 2px at 75% 80%, white, transparent);
    background-size: 200% 200%;
    animation: sparkle-move 4s linear infinite;
    opacity: 0.5;
  }

  /* 애니메이션 */
  @keyframes overlay-pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 0.9; }
  }

  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  @keyframes text-glow {
    0%, 100% {
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8),
                   0 0 60px rgba(255, 215, 0, 0.4);
    }
    50% {
      text-shadow: 0 0 40px rgba(255, 215, 0, 1),
                   0 0 80px rgba(255, 215, 0, 0.6),
                   0 0 120px rgba(255, 215, 0, 0.4);
    }
  }

  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3) rotate(-10deg);
    }
    50% {
      transform: scale(1.1) rotate(5deg);
    }
    70% {
      transform: scale(0.9) rotate(-3deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes pulse-scale {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes button-shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes sparkle-move {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 200%; }
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .label-glow {
      font-size: 1.75rem;
    }

    .jackpot-name {
      font-size: 2rem;
    }

    .amount-glow {
      font-size: 3rem;
    }

    .winner-info {
      font-size: 1rem;
    }

    .close-button {
      padding: 0.75rem 2rem;
      font-size: 1rem;
    }
  }

  /* 접근성 */
  @media (prefers-reduced-motion: reduce) {
    .label-glow,
    .amount-glow {
      animation: none;
    }

    .jackpot-name {
      animation: none;
    }

    .sparkles {
      display: none;
    }
  }
</style>
