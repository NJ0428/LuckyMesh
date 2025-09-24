<script>
  import { onMount } from 'svelte';
  import { user, isAuthenticated, logout } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let currentUser = null;
  let loading = true;

  const unsubscribe = user.subscribe((u) => {
    currentUser = u;
  });

  onMount(() => {
    // store가 비동기로 초기화되므로 간단한 로딩 처리
    loading = false;
    return () => unsubscribe();
  });

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
</style>
