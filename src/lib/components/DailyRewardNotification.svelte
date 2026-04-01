<script>
  import { fly } from 'svelte/transition';

  export let show = false;
  export let dailyRewardData = null;

  async function claimReward() {
    try {
      const response = await fetch('/api/daily-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        show = false;
        // 페이지 새로고침 또는 상태 업데이트
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } else {
        alert(`보상 수령 실패: ${data.error}`);
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
      alert('보상 수령 중 오류가 발생했습니다.');
    }
  }

  function closeNotification() {
    show = false;
  }
</script>

{#if show && dailyRewardData && !dailyRewardData.is_claimed}
  <div
    class="notification-container"
    transition:fly={{ y: -50, duration: 300 }}
  >
    <div class="notification-content">
      <div class="notification-icon">🎁</div>
      <div class="notification-text">
        <div class="notification-title">일일 보상이 도착했습니다!</div>
        <div class="notification-subtitle">
          {dailyRewardData.reward_amount.toLocaleString()}칩을 받으세요
        </div>
      </div>
      <div class="notification-actions">
        <button class="claim-btn" on:click={claimReward}>
          받기
        </button>
        <button class="close-btn" on:click={closeNotification}>
          ✕
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }

  .notification-icon {
    font-size: 2rem;
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  .notification-text {
    flex: 1;
  }

  .notification-title {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
  }

  .notification-subtitle {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .notification-actions {
    display: flex;
    gap: 0.5rem;
  }

  .claim-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
    border: none;
    border-radius: 6px;
    color: #000;
    font-weight: 700;
    font-size: 0.875rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .claim-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  }

  .close-btn {
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    .notification-container {
      top: 10px;
      right: 10px;
      left: 10px;
      max-width: none;
    }

    .notification-content {
      padding: 0.75rem 1rem;
    }

    .notification-text {
      font-size: 0.875rem;
    }
  }
</style>
