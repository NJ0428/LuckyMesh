<script>
  import { onMount } from 'svelte';
  import { user, isAuthenticated, logout } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { recentAchievements } from '$lib/stores/achievementStats.js';

  let currentUser = null;
  let loading = true;
  let recentAchievementsList = [];
  let statsLoading = true;

  const unsubscribe = user.subscribe((u) => {
    currentUser = u;
  });

  const unsubscribeAchievements = recentAchievements.subscribe((achievements) => {
    recentAchievementsList = achievements;
  });

  onMount(async () => {
    // store가 비동기로 초기화되므로 간단한 로딩 처리
    loading = false;

    // 업적 통계 로드
    if ($isAuthenticated && currentUser) {
      try {
        await loadAchievementStats();
      } catch (error) {
        console.error('Failed to load achievement stats:', error);
      }
    }

    statsLoading = false;

    return () => {
      unsubscribe();
      unsubscribeAchievements();
    };
  });

  async function loadAchievementStats() {
    try {
      const response = await fetch('/api/achievements/stats');
      const data = await response.json();

      if (data.success) {
        // 스토어 업데이트는 achievementStatsStore에서 자동으로 처리됨
        recentAchievementsList = data.recentAchievements || [];
      }
    } catch (error) {
      console.error('Error loading achievement stats:', error);
    }
  }

  async function handleLogout() {
    const result = await logout();
    // 로그아웃 성공 시 로그인 페이지로 이동
    if (result && result.success) {
      goto('/login');
    }
  }

  function goEdit() {
    goto('/profile/edit');
  }

  function goToAchievements() {
    goto('/achievements');
  }

  function getTierColor(tier) {
    const colors = {
      bronze: 'from-amber-600 to-amber-800',
      silver: 'from-gray-300 to-gray-500',
      gold: 'from-yellow-400 to-yellow-600',
      diamond: 'from-cyan-400 to-blue-600'
    };
    return colors[tier] || 'from-gray-400 to-gray-600';
  }

  function getTierTextColor(tier) {
    const colors = {
      bronze: 'text-amber-400',
      silver: 'text-gray-300',
      gold: 'text-yellow-400',
      diamond: 'text-cyan-400'
    };
    return colors[tier] || 'text-gray-400';
  }
</script>

<section class="max-w-3xl mx-auto p-6">
  {#if loading}
    <div class="text-center py-20">로딩 중...</div>
  {:else}
    {#if $isAuthenticated && currentUser}
      <div class="glass-card p-6 rounded-lg shadow-md">
        <div class="flex items-center gap-6">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-pink-400 to-indigo-400 flex items-center justify-center text-white text-2xl font-semibold">
            {#if currentUser.username}
              {currentUser.username.charAt(0).toUpperCase()}
            {:else}
              U
            {/if}
          </div>

          <div class="flex-1">
            <h2 class="text-2xl font-bold">{currentUser.username}</h2>
            <p class="text-sm text-gray-400">{currentUser.fullName}</p>
            <p class="mt-2 text-sm">
              <strong>Email:</strong> {currentUser.email}
            </p>
            {#if currentUser.phone}
              <p class="text-sm"><strong>Phone:</strong> {currentUser.phone}</p>
            {/if}
          </div>

          <div class="text-right">
            <div class="text-sm text-gray-400">Balance</div>
            <div class="text-xl font-semibold">${currentUser.balance ?? 0}</div>
          </div>
        </div>

        <!-- 업적 뱃지 섹션 -->
        {#if !statsLoading && recentAchievementsList.length > 0}
          <div class="mt-6 pt-6 border-t border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold">최근 업적</h3>
              <button
                class="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                on:click={goToAchievements}
              >
                모든 업적 보기 →
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              {#each recentAchievementsList.slice(0, 5) as userAchievement}
                {#if userAchievement.achievement}
                  <div
                    class="achievement-badge group relative"
                    title="{userAchievement.achievement.title} - {userAchievement.achievement.description}"
                  >
                    <div class="badge-icon">{userAchievement.achievement.icon}</div>
                    <div
                      class="badge-tier {getTierTextColor(userAchievement.achievement.tier)}"
                    >
                      {userAchievement.achievement.tier}
                    </div>

                    <!-- 툴팁 -->
                    <div class="badge-tooltip">
                      <div class="tooltip-title">{userAchievement.achievement.title}</div>
                      <div class="tooltip-description">
                        {userAchievement.achievement.description}
                      </div>
                      <div class="tooltip-date">
                        {new Date(userAchievement.completed_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        <div class="mt-6 flex gap-3">
          <button class="btn-primary px-4 py-2 rounded" on:click={goEdit}>프로필 수정</button>
          <button class="btn-secondary px-4 py-2 rounded" on:click={handleLogout}>로그아웃</button>
        </div>
      </div>
    {:else}
      <div class="glass-card p-6 rounded-lg text-center">
        <h3 class="text-xl font-semibold">로그인이 필요합니다</h3>
        <p class="mt-2 text-sm text-gray-400">내 프로필을 보려면 먼저 로그인하세요.</p>
        <div class="mt-4">
          <button class="btn-primary px-4 py-2 rounded" on:click={() => goto('/login')}>로그인</button>
          <button class="ml-3 btn-secondary px-4 py-2 rounded" on:click={() => goto('/signup')}>회원가입</button>
        </div>
      </div>
    {/if}
  {/if}
</section>

<style>
  /* 간단한 로컬 스타일: 전역 Tailwind가 적용되므로 최소한으로 유지 */
  .glass-card {
    backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255,255,255,0.06);
  }

  .btn-primary {
    @apply bg-indigo-500 text-white hover:bg-indigo-600;
  }

  .btn-secondary {
    @apply bg-gray-700 text-white hover:bg-gray-800;
  }

  /* 업적 뱃지 스타일 */
  .achievement-badge {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    background: rgba(30, 30, 50, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .achievement-badge:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 215, 0, 0.3);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
  }

  .badge-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .badge-tier {
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .badge-tooltip {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    padding: 0.75rem;
    background: rgba(20, 20, 40, 0.98);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;
    z-index: 100;
  }

  .achievement-badge:hover .badge-tooltip {
    opacity: 1;
    visibility: visible;
  }

  .tooltip-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: #ffd700;
    margin-bottom: 0.25rem;
  }

  .tooltip-description {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.25rem;
    line-height: 1.3;
  }

  .tooltip-date {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 640px) {
    .achievement-badge {
      flex: 0 0 calc(20% - 0.16rem);
    }

    .badge-tooltip {
      width: 150px;
    }
  }
</style>
