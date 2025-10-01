<script>
  import { achievementsStore, achievementsActions } from '$lib/stores/achievements.js';
  import PastelButton from './PastelButton.svelte';
  import PastelCard from './PastelCard.svelte';

  export let show = false;

  let activeCategory = 'all';
  let searchQuery = '';

  $: categories = [
    { id: 'all', name: '전체', icon: '🏆' },
    ...achievementsActions.getCategories()
  ];

  $: filteredAchievements = getFilteredAchievements(activeCategory, searchQuery);
  $: completionStats = getCompletionStats();

  function getFilteredAchievements(category, query) {
    let achievements;

    if (category === 'all') {
      achievements = Object.values(achievementsActions.getAchievementsByCategory());
      // 모든 카테고리의 업적 가져오기
      achievements = [];
      categories.slice(1).forEach(cat => {
        achievements.push(...achievementsActions.getAchievementsByCategory(cat.id));
      });
    } else {
      achievements = achievementsActions.getAchievementsByCategory(category);
    }

    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      achievements = achievements.filter(achievement =>
        achievement.title.toLowerCase().includes(lowercaseQuery) ||
        achievement.description.toLowerCase().includes(lowercaseQuery)
      );
    }

    return achievements;
  }

  function getCompletionStats() {
    const allAchievements = [];
    categories.slice(1).forEach(cat => {
      allAchievements.push(...achievementsActions.getAchievementsByCategory(cat.id));
    });

    const completed = allAchievements.filter(achievement =>
      $achievementsStore.unlockedAchievements.includes(achievement.id)
    ).length;

    return {
      completed,
      total: allAchievements.length,
      percentage: allAchievements.length > 0 ? (completed / allAchievements.length) * 100 : 0
    };
  }

  function isAchievementUnlocked(achievementId) {
    return $achievementsStore.unlockedAchievements.includes(achievementId);
  }

  function getAchievementProgress(achievementId) {
    return achievementsActions.getAchievementProgress(achievementId);
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getProgressBarColor(percentage) {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    if (percentage >= 25) return 'bg-red-500';
    return 'bg-gray-400';
  }

  function closePanel() {
    show = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closePanel();
    }
  }

  function getCategoryDisplayName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  }

  function resetAchievements() {
    if (confirm('모든 업적과 진행 상황이 리셋됩니다. 정말 진행하시겠습니까?')) {
      achievementsActions.resetAchievements();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={closePanel}>
    <div class="bg-white rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" on:click|stopPropagation>

      <!-- 헤더 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-3xl font-bold text-gray-800">🏆 업적</h2>
          <p class="text-gray-600">
            {completionStats.completed}/{completionStats.total} 완료 ({completionStats.percentage.toFixed(1)}%)
          </p>
        </div>
        <button on:click={closePanel} class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>

      <!-- 진행률 바 -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-600 mb-2">
          <span>전체 진행률</span>
          <span>{completionStats.percentage.toFixed(1)}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="h-3 rounded-full transition-all duration-500 {getProgressBarColor(completionStats.percentage)}"
            style="width: {completionStats.percentage}%"
          ></div>
        </div>
      </div>

      <!-- 필터 및 검색 -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <!-- 카테고리 필터 -->
        <div class="flex flex-wrap gap-2">
          {#each categories as category}
            <button
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                     {activeCategory === category.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              on:click={() => activeCategory = category.id}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          {/each}
        </div>

        <!-- 검색 -->
        <div class="flex-1 max-w-md">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="업적 검색..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- 최근 업적 (홈 탭에서만 표시) -->
      {#if activeCategory === 'all' && $achievementsStore.recentUnlocks.length > 0}
        <div class="mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-3">🌟 최근 달성한 업적</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each $achievementsStore.recentUnlocks.slice(0, 3) as achievement}
              <div class="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="text-3xl">{achievement.icon}</div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-yellow-800 truncate">{achievement.title}</div>
                    <div class="text-xs text-yellow-700">{formatDate(achievement.unlockedAt)}</div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 업적 목록 -->
      <div class="flex-1 overflow-y-auto">
        {#if filteredAchievements.length === 0}
          <div class="text-center text-gray-500 py-12">
            {#if searchQuery.trim()}
              검색 결과가 없습니다.
            {:else}
              이 카테고리에는 업적이 없습니다.
            {/if}
          </div>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each filteredAchievements as achievement}
              {@const unlocked = isAchievementUnlocked(achievement.id)}
              {@const progress = getAchievementProgress(achievement.id)}
              {@const unlockedData = $achievementsStore.achievements[achievement.id]}

              <div
                class="border rounded-lg p-4 transition-all duration-200 hover:shadow-lg
                       {unlocked ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' : 'bg-white border-gray-200'}"
              >
                <!-- 업적 헤더 -->
                <div class="flex items-start gap-3 mb-3">
                  <div class="text-4xl {unlocked ? '' : 'grayscale opacity-60'}">
                    {achievement.icon}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-gray-800 {unlocked ? 'text-green-800' : ''} mb-1">
                      {achievement.title}
                      {#if unlocked}
                        <span class="text-green-600 ml-1">✓</span>
                      {/if}
                    </div>
                    <div class="text-sm text-gray-600 {unlocked ? 'text-green-700' : ''} mb-2">
                      {achievement.description}
                    </div>
                    <div class="text-xs text-gray-500">
                      <span class="px-2 py-1 bg-gray-100 rounded-full">
                        {getCategoryDisplayName(achievement.category)}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 진행률 또는 완료 정보 -->
                {#if unlocked}
                  <div class="bg-green-100 border border-green-200 rounded-lg p-3">
                    <div class="text-sm font-medium text-green-800 mb-1">🎉 달성 완료!</div>
                    <div class="text-xs text-green-700">
                      {formatDate(unlockedData.unlockedAt)}
                    </div>
                  </div>
                {:else}
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">진행률</span>
                      <span class="font-medium text-gray-800">
                        {progress.current}/{progress.required}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full transition-all duration-300 {getProgressBarColor(progress.percentage)}"
                        style="width: {progress.percentage}%"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 text-right">
                      {progress.percentage.toFixed(1)}%
                    </div>
                  </div>
                {/if}

                <!-- 보상 정보 -->
                <div class="mt-3 pt-3 border-t border-gray-200">
                  <div class="text-xs text-gray-600">
                    <span class="font-medium">보상:</span>
                    {#if achievement.reward.type === 'badge'}
                      🏅 뱃지
                    {:else}
                      🎁 특별 보상
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- 하단 버튼 -->
      <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
        <PastelButton variant="danger" on:click={resetAchievements}>
          업적 리셋
        </PastelButton>

        <div class="flex gap-3">
          <PastelButton variant="secondary" on:click={achievementsActions.clearRecentUnlocks}>
            최근 업적 지우기
          </PastelButton>
          <PastelButton variant="primary" on:click={closePanel}>
            닫기
          </PastelButton>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* 스크롤바 스타일 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  /* 그레이스케일 필터 */
  .grayscale {
    filter: grayscale(100%);
  }

  /* 호버 효과 */
  .hover\:shadow-lg:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /* 반응형 그리드 조정 */
  @media (max-width: 640px) {
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }
  }

  @media (min-width: 640px) and (max-width: 1024px) {
    .sm\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .lg\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
</style>