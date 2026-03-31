<script>
  import { onMount } from 'svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';

  let gachaData = null;
  let spinResult = null;
  let loading = true;
  let spinning = false;
  let error = null;
  let showResult = false;

  onMount(async () => {
    await loadGachaData();
  });

  async function loadGachaData() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/gacha');
      const data = await response.json();

      if (data.success) {
        gachaData = data.data;
      } else {
        error = data.error;
      }
    } catch (err) {
      error = '뽑기 정보를 불러오는 중 오류가 발생했습니다.';
      console.error('Error loading gacha data:', err);
    } finally {
      loading = false;
    }
  }

  async function performSpin() {
    if (spinning || !gachaData?.can_spin) return;

    spinning = true;
    error = null;
    showResult = false;

    try {
      const response = await fetch('/api/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isFreeSpin: gachaData.remaining_free_spins > 0
        })
      });

      const data = await response.json();

      if (data.success) {
        spinResult = data.data;

        // 뽑기 애니메이션 시간
        setTimeout(() => {
          showResult = true;
          spinning = false;
          gachaData.remaining_free_spins = data.data.remaining_free_spins;
          gachaData.total_spins_today += 1;
        }, 3000);

      } else {
        error = data.error;
        spinning = false;
      }
    } catch (err) {
      error = '뽑기 중 오류가 발생했습니다.';
      console.error('Error performing gacha spin:', err);
      spinning = false;
    }
  }

  function getRarityColor(rarity) {
    const colors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-blue-400 to-blue-600',
      legendary: 'from-yellow-400 to-yellow-600'
    };
    return colors[rarity] || 'from-gray-400 to-gray-600';
  }

  function getRarityEmoji(rarity) {
    const emojis = {
      common: '⚪',
      rare: '🔵',
      legendary: '🟡'
    };
    return emojis[rarity] || '⚪';
  }

  function getRarityLabel(rarity) {
    const labels = {
      common: '일반',
      rare: '희귀',
      legendary: '전설'
    };
    return labels[rarity] || '알 수 없음';
  }
</script>

<div class="gacha-page">
  <div class="page-header">
    <h1>🎰 럭키 룰렛</h1>
    <p>VIP 등급별로 더 좋은 보상이 기다립니다!</p>
  </div>

  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>로딩 중...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <p>❌ {error}</p>
      <button on:click={loadGachaData}>다시 시도</button>
    </div>
  {:else}
    <div class="gacha-container">
      <!-- 룰렛 휠 -->
      <div class="wheel-container">
        <div class="roulette-wheel" class:spinning={spinning}>
          <div class="wheel-inner">
            <div class="wheel-section common" style="--angle: 0deg">
              <span class="section-icon">⚪</span>
            </div>
            <div class="wheel-section rare" style="--angle: 120deg">
              <span class="section-icon">🔵</span>
            </div>
            <div class="wheel-section legendary" style="--angle: 240deg">
              <span class="section-icon">🟡</span>
            </div>
          </div>
          <div class="wheel-pointer">▼</div>
        </div>
      </div>

      <!-- 뽑기 정보 -->
      <div class="spin-info">
        <div class="spin-stats">
          <div class="stat-item">
            <span class="stat-label">남은 무료 뽑기</span>
            <span class="stat-value">{gachaData.remaining_free_spins}회</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">오늘의 뽑기</span>
            <span class="stat-value">{gachaData.total_spins_today}회</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">VIP 등급</span>
            <span class="stat-value">{gachaData.vip_tier}</span>
          </div>
        </div>

        <PastelButton
          on:click={performSpin}
          disabled={spinning || !gachaData.can_spin}
          class="spin-button"
        >
          {spinning ? '뽑는 중...' : gachaData.can_spin ? '🎰 뽑기' : '⚠️ 무료 뽑기 소진'}
        </PastelButton>

        {#if !gachaData.can_spin}
          <div class="info-message">
            오늘의 무료 뽑기 횟수를 모두 사용했습니다. 내일 다시 오세요!
          </div>
        {/if}
      </div>

      <!-- 결과 표시 -->
      {#if showResult && spinResult}
        <div class="result-display">
          <div class="result-card {getRarityColor(spinResult.rarity)}">
            <div class="result-icon">{getRarityEmoji(spinResult.rarity)}</div>
            <div class="result-rarity">{getRarityLabel(spinResult.rarity)}</div>
            <div class="result-amount">
              <span class="currency">₩</span>
              <span class="amount">{spinResult.reward_amount.toLocaleString()}</span>
              <span class="unit">칩</span>
            </div>

            {#if spinResult.vip_bonus_applied}
              <div class="vip-bonus">
                <span class="bonus-icon">👑</span>
                <span class="bonus-text">VIP 보너스 x{spinResult.bonus_multiplier.toFixed(1)}</span>
              </div>
            {/if}

            <div class="result-stats">
              <div class="probability">
                확률: {spinResult.probability.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- VIP 혜택 정보 -->
      <div class="vip-info">
        <h3>👑 VIP 등급별 혜택</h3>
        <div class="vip-benefits">
          <div class="benefit-row">
            <div class="benefit-tier">
              <span class="tier-icon">🥉</span>
              <span class="tier-name">Bronze</span>
            </div>
            <div class="benefit-details">
              <span class="spins">1회</span>
              <span class="probability">기본 확률</span>
            </div>
          </div>
          <div class="benefit-row">
            <div class="benefit-tier">
              <span class="tier-icon">🥈</span>
              <span class="tier-name">Silver</span>
            </div>
            <div class="benefit-details">
              <span class="spins">2회</span>
              <span class="probability">희귀+5%, 전설+2%</span>
            </div>
          </div>
          <div class="benefit-row">
            <div class="benefit-tier">
              <span class="tier-icon">🥇</span>
              <span class="tier-name">Gold</span>
            </div>
            <div class="benefit-details">
              <span class="spins">3회</span>
              <span class="probability">희귀+10%, 전설+5%</span>
            </div>
          </div>
          <div class="benefit-row">
            <div class="benefit-tier">
              <span class="tier-icon">💎</span>
              <span class="tier-name">Platinum</span>
            </div>
            <div class="benefit-details">
              <span class="spins">4회</span>
              <span class="probability">희귀+15%, 전설+8%</span>
            </div>
          </div>
          <div class="benefit-row">
            <div class="benefit-tier">
              <span class="tier-icon">💍</span>
              <span class="tier-name">Diamond</span>
            </div>
            <div class="benefit-details">
              <span class="spins">5회</span>
              <span class="probability">희귀+20%, 전설+12%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 확률 정보 -->
      <div class="probability-info">
        <h3>📊 기본 확률</h3>
        <div class="probability-list">
          <div class="probability-item common">
            <span class="rarity-icon">⚪</span>
            <span class="rarity-name">일반</span>
            <span class="rarity-amount">10,000칩</span>
            <span class="rarity-probability">60%</span>
          </div>
          <div class="probability-item rare">
            <span class="rarity-icon">🔵</span>
            <span class="rarity-name">희귀</span>
            <span class="rarity-amount">50,000칩</span>
            <span class="rarity-probability">30%</span>
          </div>
          <div class="probability-item legendary">
            <span class="rarity-icon">🟡</span>
            <span class="rarity-name">전설</span>
            <span class="rarity-amount">200,000칩</span>
            <span class="rarity-probability">10%</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .gacha-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .page-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .page-header h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .page-header p {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #ffd700;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-container button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .error-container button:hover {
    transform: scale(1.05);
  }

  .gacha-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    align-items: center;
  }

  .wheel-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }

  .roulette-wheel {
    position: relative;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    border: 8px solid #ffd700;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  }

  .roulette-wheel.spinning .wheel-inner {
    animation: wheelSpin 3s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  }

  @keyframes wheelSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(1800deg); }
  }

  .wheel-inner {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
  }

  .wheel-section {
    position: absolute;
    width: 50%;
    height: 50%;
    top: 0;
    right: 0;
    transform-origin: bottom left;
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: polygon(0 0, 100% 0, 100% 100%);
  }

  .wheel-section.common {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    transform: rotate(0deg);
  }

  .wheel-section.rare {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    transform: rotate(120deg);
  }

  .wheel-section.legendary {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    transform: rotate(240deg);
  }

  .section-icon {
    font-size: 3rem;
    position: absolute;
    top: 20%;
    right: 20%;
  }

  .wheel-pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2rem;
    color: #ffd700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .spin-info {
    text-align: center;
    width: 100%;
    max-width: 600px;
  }

  .spin-stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(30, 30, 50, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffd700;
  }

  .spin-button {
    width: 100%;
    padding: 1.5rem 2rem;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .info-message {
    padding: 1rem;
    background: rgba(255, 165, 0, 0.1);
    border: 1px solid rgba(255, 165, 0, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
  }

  .result-display {
    width: 100%;
    max-width: 400px;
  }

  .result-card {
    padding: 2rem;
    text-align: center;
    background: linear-gradient(135deg, var(--tw-gradient-stops));
    border-radius: 16px;
    animation: resultPopIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes resultPopIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .result-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .result-rarity {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .result-amount {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .currency {
    font-size: 1.5rem;
    color: white;
  }

  .amount {
    font-size: 3rem;
    font-weight: 700;
    color: white;
    font-family: 'JetBrains Mono', monospace;
  }

  .unit {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .vip-bonus {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 215, 0, 0.2);
    border: 1px solid rgba(255, 215, 0, 0.4);
    border-radius: 20px;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .result-stats {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .probability {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .vip-info {
    width: 100%;
    padding: 2rem;
    background: rgba(30, 30, 50, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .vip-info h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .vip-benefits {
    display: grid;
    gap: 1rem;
  }

  .benefit-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: transform 0.2s;
  }

  .benefit-row:hover {
    transform: translateX(4px);
  }

  .benefit-tier {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .tier-icon {
    font-size: 1.5rem;
  }

  .tier-name {
    font-weight: 600;
    color: white;
  }

  .benefit-details {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }

  .spins {
    font-weight: 700;
    color: #ffd700;
  }

  .probability {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .probability-info {
    width: 100%;
    padding: 2rem;
    background: rgba(30, 30, 50, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .probability-info h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .probability-list {
    display: grid;
    gap: 1rem;
  }

  .probability-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border-left: 4px solid;
  }

  .probability-item.common {
    border-left-color: #9ca3af;
  }

  .probability-item.rare {
    border-left-color: #3b82f6;
  }

  .probability-item.legendary {
    border-left-color: #fbbf24;
  }

  .rarity-icon {
    font-size: 1.5rem;
  }

  .rarity-name {
    flex: 1;
    margin-left: 1rem;
    font-weight: 600;
    color: white;
  }

  .rarity-amount {
    font-weight: 700;
    color: #ffd700;
  }

  .rarity-probability {
    font-weight: 700;
    color: white;
  }

  @media (max-width: 768px) {
    .gacha-page {
      padding: 1rem;
    }

    .page-header h1 {
      font-size: 2rem;
    }

    .wheel-container {
      padding: 1rem;
    }

    .roulette-wheel {
      width: 250px;
      height: 250px;
    }

    .spin-stats {
      flex-direction: column;
      gap: 1rem;
    }

    .result-amount .amount {
      font-size: 2rem;
    }
  }
</style>
