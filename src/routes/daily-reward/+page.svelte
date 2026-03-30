<script>
  import { onMount } from 'svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';

  let dailyReward = null;
  let loading = true;
  let claiming = false;
  let error = null;
  let showAnimation = false;

  onMount(async () => {
    await loadDailyReward();
  });

  async function loadDailyReward() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/daily-reward');
      const data = await response.json();

      if (data.success) {
        dailyReward = data.data;
      } else {
        error = data.error;
      }
    } catch (err) {
      error = '일일 보상을 불러오는 중 오류가 발생했습니다.';
      console.error('Error loading daily reward:', err);
    } finally {
      loading = false;
    }
  }

  async function claimReward() {
    claiming = true;
    error = null;

    try {
      const response = await fetch('/api/daily-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        showAnimation = true;
        dailyReward.is_claimed = true;

        setTimeout(() => {
          showAnimation = false;
        }, 3000);

        alert(data.message);
      } else {
        error = data.error;
      }
    } catch (err) {
      error = '보상 수령 중 오류가 발생했습니다.';
      console.error('Error claiming reward:', err);
    } finally {
      claiming = false;
    }
  }

  function getVipTierColor(tier) {
    const colors = {
      bronze: 'from-amber-600 to-amber-800',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-cyan-400 to-blue-600',
      diamond: 'from-purple-400 to-pink-600'
    };
    return colors[tier] || 'from-gray-400 to-gray-600';
  }

  function getVipTierEmoji(tier) {
    const emojis = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💍'
    };
    return emojis[tier] || '⭐';
  }
</script>

<div class="daily-reward-page">
  <div class="page-header">
    <h1>🎁 일일 보상</h1>
    <p>매일 매일 특별한 보상을 받으세요!</p>
  </div>

  {#if loading}
    <div class="loading-container">
      <div class="spinner"></div>
      <p>로딩 중...</p>
    </div>
  {:else if error}
    <div class="error-container">
      <p>❌ {error}</p>
      <button on:click={loadDailyReward}>다시 시도</button>
    </div>
  {:else if dailyReward}
    <div class="reward-container">
      <PastelCard variant="success" class="reward-card">
        <div class="reward-header">
          <div class="vip-badge {getVipTierColor(dailyReward.vip_tier)}">
            {getVipTierEmoji(dailyReward.vip_tier)} {dailyReward.vip_tier.toUpperCase()}
          </div>
          <div class="reward-date">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>

        <div class="reward-amount">
          <div class="amount-display">
            <span class="currency">₩</span>
            <span class="amount">{dailyReward.reward_amount.toLocaleString()}</span>
            <span class="unit">칩</span>
          </div>
        </div>

        {#if dailyReward.is_claimed}
          <div class="reward-claimed">
            <div class="claimed-icon">✅</div>
            <div class="claimed-text">이미 수령했습니다</div>
            <div class="claimed-time">
              {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}에 수령
            </div>
          </div>
        {:else}
          <div class="reward-actions">
            <PastelButton
              on:click={claimReward}
              disabled={claiming}
              class="claim-button"
            >
              {claiming ? '수령 중...' : '보상 받기'}
            </PastelButton>
            <div class="expiry-info">
              ⏰ {new Date(dailyReward.expires_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}까지
            </div>
          </div>
        {/if}
      </PastelCard>

      <!-- VIP 혜택 정보 -->
      <div class="vip-info">
        <h3>👑 VIP 등급별 혜택</h3>
        <div class="vip-benefits">
          <div class="benefit-item">
            <span class="vip-emoji">🥉</span>
            <span class="vip-tier">Bronze</span>
            <span class="reward">5,000칩</span>
          </div>
          <div class="benefit-item">
            <span class="vip-emoji">🥈</span>
            <span class="vip-tier">Silver</span>
            <span class="reward">10,000칩</span>
          </div>
          <div class="benefit-item">
            <span class="vip-emoji">🥇</span>
            <span class="vip-tier">Gold</span>
            <span class="reward">20,000칩</span>
          </div>
          <div class="benefit-item">
            <span class="vip-emoji">💎</span>
            <span class="vip-tier">Platinum</span>
            <span class="reward">50,000칩</span>
          </div>
          <div class="benefit-item">
            <span class="vip-emoji">💍</span>
            <span class="vip-tier">Diamond</span>
            <span class="reward">100,000칩</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 수령 애니메이션 -->
    {#if showAnimation}
      <div class="reward-animation">
        <div class="particles">
          {#each Array(20) as _}
            <div class="particle"></div>
          {/each}
        </div>
        <div class="reward-popup">
          <div class="popup-icon">🎁</div>
          <div class="popup-text">{dailyReward.reward_amount.toLocaleString()}칩 획득!</div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .daily-reward-page {
    max-width: 800px;
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

  .reward-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .reward-card {
    padding: 2rem;
    text-align: center;
  }

  .reward-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .vip-badge {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 700;
    font-size: 0.875rem;
    background: linear-gradient(135deg, var(--tw-gradient-stops));
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .reward-date {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .reward-amount {
    margin: 2rem 0;
  }

  .amount-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
  }

  .currency {
    font-size: 2rem;
    color: #ffd700;
  }

  .amount {
    font-size: 4rem;
    font-weight: 700;
    color: white;
    font-family: 'JetBrains Mono', monospace;
  }

  .unit {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .reward-claimed {
    padding: 1.5rem;
    background: rgba(0, 255, 0, 0.1);
    border: 1px solid rgba(0, 255, 0, 0.3);
    border-radius: 12px;
  }

  .claimed-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
  }

  .claimed-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #00ff00;
    margin-bottom: 0.5rem;
  }

  .claimed-time {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .reward-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .claim-button {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1.125rem;
    font-weight: 700;
  }

  .expiry-info {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .vip-info {
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

  .benefit-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: transform 0.2s;
  }

  .benefit-item:hover {
    transform: translateX(4px);
  }

  .vip-emoji {
    font-size: 1.5rem;
  }

  .vip-tier {
    flex: 1;
    font-weight: 600;
    color: white;
  }

  .reward {
    font-weight: 700;
    color: #ffd700;
  }

  .reward-animation {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .reward-popup {
    text-align: center;
    animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  @keyframes popIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .popup-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  .popup-text {
    font-size: 2rem;
    font-weight: 700;
    color: #ffd700;
  }

  .particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ffd700;
    border-radius: 50%;
    animation: particleFall 3s ease-out infinite;
  }

  @keyframes particleFall {
    0% {
      transform: translateY(-100px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
</style>
