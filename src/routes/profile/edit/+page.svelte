<script>
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let fullName = '';
  let phone = '';
  let saving = false;
  let error = '';
  let success = '';

  onMount(() => {
    const u = get(user);
    if (!u) {
      // 로그인 필요
      goto('/login');
      return;
    }

    fullName = u.fullName || '';
    phone = u.phone || '';
  });

  async function handleSubmit(e) {
    e.preventDefault();
    error = '';
    success = '';

    if (!fullName || fullName.length < 2) {
      error = '이름은 2자 이상이어야 합니다.';
      return;
    }

    saving = true;

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone })
      });

      const result = await res.json();
      if (result.success) {
        // 스토어 직접 업데이트
        user.set(result.user);
        success = '프로필이 저장되었습니다.';
        // 잠시 뒤 프로필 페이지로 돌아가기
        setTimeout(() => goto('/profile'), 900);
      } else {
        error = result.error || '프로필 저장에 실패했습니다.';
      }
    } catch (err) {
      console.error(err);
      error = '서버 오류가 발생했습니다.';
    } finally {
      saving = false;
    }
  }
</script>

<section class="max-w-2xl mx-auto p-6">
  <div class="glass-card p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">프로필 수정</h2>

    {#if error}
      <div class="text-sm text-red-400 mb-3">{error}</div>
    {/if}
    {#if success}
      <div class="text-sm text-green-400 mb-3">{success}</div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-sm text-gray-300">이름</label>
        <input type="text" bind:value={fullName} class="w-full mt-1 p-2 rounded bg-white/5 border border-white/10" />
      </div>

      <div>
        <label class="block text-sm text-gray-300">전화번호</label>
        <input type="text" bind:value={phone} class="w-full mt-1 p-2 rounded bg-white/5 border border-white/10" />
      </div>

      <div class="flex items-center gap-3 mt-4">
        <button class="btn-primary px-4 py-2 rounded" type="submit" disabled={saving}>
          {#if saving}저장 중...{:else}저장{/if}
        </button>
        <button type="button" class="btn-secondary px-4 py-2 rounded" on:click={() => goto('/profile')}>취소</button>
      </div>
    </form>
  </div>
</section>

<style>
  .glass-card { backdrop-filter: blur(6px); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); }
  .btn-primary { @apply bg-indigo-500 text-white hover:bg-indigo-600; }
  .btn-secondary { @apply bg-gray-700 text-white hover:bg-gray-800; }
</style>
