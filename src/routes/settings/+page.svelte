<script>
  import { onMount } from 'svelte';
  import { user, isAuthenticated, logout } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import PastelCard from '$lib/components/PastelCard.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';

  let currentUser = null;
  let loading = true;
  let settings = {
    notifications: {
      gameResults: true,
      promotions: true,
      systemUpdates: false
    },
    privacy: {
      showBalance: true,
      shareGameStats: false,
      allowFriendRequests: true
    },
    gameplay: {
      autoPlay: false,
      soundEffects: true,
      animations: true,
      quickBet: false
    },
    display: {
      theme: 'dark',
      language: 'ko',
      currency: 'KRW'
    }
  };

  const unsubscribe = user.subscribe((u) => {
    currentUser = u;
  });

  onMount(() => {
    loading = false;
    // 저장된 설정 로드 (로컬 스토리지에서)
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        settings = { ...settings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('설정 로드 중 오류:', error);
      }
    }
    return () => unsubscribe();
  });

  function saveSettings() {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      // 성공 알림 (간단한 구현)
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 중 오류:', error);
      alert('설정 저장에 실패했습니다.');
    }
  }

  function resetSettings() {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      settings = {
        notifications: {
          gameResults: true,
          promotions: true,
          systemUpdates: false
        },
        privacy: {
          showBalance: true,
          shareGameStats: false,
          allowFriendRequests: true
        },
        gameplay: {
          autoPlay: false,
          soundEffects: true,
          animations: true,
          quickBet: false
        },
        display: {
          theme: 'dark',
          language: 'ko',
          currency: 'KRW'
        }
      };
      saveSettings();
    }
  }

  async function handleAccountDeletion() {
    const confirmation = confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.');
    if (confirmation) {
      const finalConfirmation = prompt('계정을 삭제하려면 "DELETE"를 입력하세요:');
      if (finalConfirmation === 'DELETE') {
        // 실제 구현에서는 서버 API 호출이 필요
        alert('계정 삭제 기능은 아직 구현되지 않았습니다.');
      }
    }
  }
</script>

<section class="max-w-4xl mx-auto p-6">
  {#if loading}
    <div class="text-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-soft-pink mx-auto"></div>
      <p class="mt-4 text-gray-400">로딩 중...</p>
    </div>
  {:else}
    {#if $isAuthenticated && currentUser}
      <div class="space-y-6">
        <!-- 헤더 -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold pastel-gradient-text font-playfair mb-2">설정</h1>
          <p class="text-gray-400 font-poppins">게임 환경을 개인화하고 계정을 관리하세요</p>
        </div>

        <!-- 알림 설정 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4 text-primary-soft-purple flex items-center gap-2">
              🔔 알림 설정
            </h2>
            <div class="space-y-4">
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">게임 결과 알림</span>
                <input
                  type="checkbox"
                  bind:checked={settings.notifications.gameResults}
                  class="toggle-checkbox"
                />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">프로모션 및 이벤트</span>
                <input
                  type="checkbox"
                  bind:checked={settings.notifications.promotions}
                  class="toggle-checkbox"
                />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">시스템 업데이트</span>
                <input
                  type="checkbox"
                  bind:checked={settings.notifications.systemUpdates}
                  class="toggle-checkbox"
                />
              </label>
            </div>
          </div>
        </PastelCard>

        <!-- 개인정보 설정 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4 text-primary-soft-purple flex items-center gap-2">
              🔒 개인정보 설정
            </h2>
            <div class="space-y-4">
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">잔액 공개</span>
                <input
                  type="checkbox"
                  bind:checked={settings.privacy.showBalance}
                  class="toggle-checkbox"
                />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">게임 통계 공유</span>
                <input
                  type="checkbox"
                  bind:checked={settings.privacy.shareGameStats}
                  class="toggle-checkbox"
                />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">친구 요청 허용</span>
                <input
                  type="checkbox"
                  bind:checked={settings.privacy.allowFriendRequests}
                  class="toggle-checkbox"
                />
              </label>
            </div>
          </div>
        </PastelCard>

        <!-- 게임플레이 설정 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4 text-primary-soft-purple flex items-center gap-2">
              🎮 게임플레이 설정
            </h2>
            <div class="space-y-4">
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">자동 플레이</span>
                <input
                  type="checkbox"
                  bind:checked={settings.gameplay.autoPlay}
                  class="toggle-checkbox"
                />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">사운드 효과</span>
                <input
                  type="checkbox"
                  bind:checked={settings.gameplay.soundEffects}
                  class="toggle-checkbox"
                />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">애니메이션</span>
                <input
                  type="checkbox"
                  bind:checked={settings.gameplay.animations}
                  class="toggle-checkbox"
                />
              </label>
              <label class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">퀵 베팅</span>
                <input
                  type="checkbox"
                  bind:checked={settings.gameplay.quickBet}
                  class="toggle-checkbox"
                />
              </label>
            </div>
          </div>
        </PastelCard>

        <!-- 화면 설정 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4 text-primary-soft-purple flex items-center gap-2">
              🎨 화면 설정
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">테마</span>
                <select
                  bind:value={settings.display.theme}
                  class="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-primary-soft-pink focus:outline-none"
                >
                  <option value="dark">다크</option>
                  <option value="light">라이트</option>
                  <option value="auto">자동</option>
                </select>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">언어</span>
                <select
                  bind:value={settings.display.language}
                  class="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-primary-soft-pink focus:outline-none"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-300 font-poppins">통화</span>
                <select
                  bind:value={settings.display.currency}
                  class="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-primary-soft-pink focus:outline-none"
                >
                  <option value="KRW">₩ KRW</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="JPY">¥ JPY</option>
                </select>
              </div>
            </div>
          </div>
        </PastelCard>

        <!-- 계정 관리 -->
        <PastelCard>
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4 text-accent-coral flex items-center gap-2">
              ⚠️ 계정 관리
            </h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-300 font-poppins">데이터 내보내기</p>
                  <p class="text-sm text-gray-500">게임 기록과 설정을 JSON 파일로 다운로드</p>
                </div>
                <PastelButton variant="secondary" size="sm">
                  내보내기
                </PastelButton>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-300 font-poppins">계정 삭제</p>
                  <p class="text-sm text-gray-500">모든 데이터가 영구적으로 삭제됩니다</p>
                </div>
                <PastelButton variant="danger" size="sm" on:click={handleAccountDeletion}>
                  삭제
                </PastelButton>
              </div>
            </div>
          </div>
        </PastelCard>

        <!-- 저장 버튼 -->
        <div class="flex justify-center space-x-4 pt-6">
          <PastelButton variant="primary" on:click={saveSettings}>
            💾 설정 저장
          </PastelButton>
          <PastelButton variant="secondary" on:click={resetSettings}>
            🔄 기본값 복원
          </PastelButton>
        </div>
      </div>
    {:else}
      <PastelCard>
        <div class="p-8 text-center">
          <h3 class="text-2xl font-semibold pastel-gradient-text mb-4">로그인이 필요합니다</h3>
          <p class="text-gray-400 mb-6 font-poppins">설정을 변경하려면 먼저 로그인하세요.</p>
          <div class="space-x-4">
            <PastelButton variant="primary" on:click={() => goto('/login')}>
              로그인
            </PastelButton>
            <PastelButton variant="secondary" on:click={() => goto('/signup')}>
              회원가입
            </PastelButton>
          </div>
        </div>
      </PastelCard>
    {/if}
  {/if}
</section>

<style>
  .toggle-checkbox {
    appearance: none;
    width: 3rem;
    height: 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .toggle-checkbox:checked {
    background: linear-gradient(135deg, #ff6b9d, #c44569);
  }

  .toggle-checkbox::before {
    content: '';
    position: absolute;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: white;
    top: 0.125rem;
    left: 0.125rem;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-checkbox:checked::before {
    transform: translateX(1.5rem);
  }

  select {
    min-width: 120px;
  }

  select:focus {
    box-shadow: 0 0 0 2px rgba(255, 107, 157, 0.3);
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>