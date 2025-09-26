<script>
  import { onMount } from 'svelte';
  import { user, isAuthenticated } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  let currentUser = null;
  let loading = false;
  let depositAmount = '';
  let withdrawAmount = '';
  let transactionHistory = [];

  const unsubscribe = user.subscribe((u) => {
    currentUser = u;
  });

  onMount(() => {
    // 인증되지 않은 사용자는 로그인 페이지로 리디렉션
    if (!$isAuthenticated) {
      goto('/login');
      return;
    }

    loadTransactionHistory();
    return () => unsubscribe();
  });

  async function loadTransactionHistory() {
    // 실제 구현에서는 API 호출
    transactionHistory = [
      { id: 1, type: 'deposit', amount: 100000, date: '2025-01-15', status: 'completed' },
      { id: 2, type: 'withdraw', amount: 50000, date: '2025-01-14', status: 'completed' },
      { id: 3, type: 'deposit', amount: 200000, date: '2025-01-13', status: 'pending' },
    ];
  }

  async function handleDeposit() {
    if (!depositAmount || depositAmount <= 0) {
      alert('유효한 입금액을 입력하세요.');
      return;
    }

    loading = true;
    try {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 잔액 업데이트 (실제로는 서버에서 업데이트된 데이터를 받아야 함)
      currentUser.balance = (currentUser.balance || 0) + parseInt(depositAmount);

      // 거래 내역 추가
      transactionHistory = [
        { id: Date.now(), type: 'deposit', amount: parseInt(depositAmount), date: new Date().toISOString().split('T')[0], status: 'pending' },
        ...transactionHistory
      ];

      depositAmount = '';
      alert('입금 요청이 완료되었습니다.');
    } catch (error) {
      alert('입금 처리 중 오류가 발생했습니다.');
    } finally {
      loading = false;
    }
  }

  async function handleWithdraw() {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('유효한 출금액을 입력하세요.');
      return;
    }

    if (withdrawAmount > (currentUser.balance || 0)) {
      alert('잔액이 부족합니다.');
      return;
    }

    loading = true;
    try {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 잔액 업데이트
      currentUser.balance = (currentUser.balance || 0) - parseInt(withdrawAmount);

      // 거래 내역 추가
      transactionHistory = [
        { id: Date.now(), type: 'withdraw', amount: parseInt(withdrawAmount), date: new Date().toISOString().split('T')[0], status: 'pending' },
        ...transactionHistory
      ];

      withdrawAmount = '';
      alert('출금 요청이 완료되었습니다.');
    } catch (error) {
      alert('출금 처리 중 오류가 발생했습니다.');
    } finally {
      loading = false;
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  }

  function getStatusText(status) {
    const statusMap = {
      'completed': '완료',
      'pending': '처리중',
      'failed': '실패'
    };
    return statusMap[status] || status;
  }

  function getStatusClass(status) {
    const classMap = {
      'completed': 'text-green-500',
      'pending': 'text-yellow-500',
      'failed': 'text-red-500'
    };
    return classMap[status] || '';
  }
</script>

<section class="max-w-4xl mx-auto p-6">
  {#if $isAuthenticated && currentUser}
    <!-- 잔액 정보 -->
    <div class="glass-card p-6 rounded-lg shadow-md mb-6">
      <h1 class="text-2xl font-bold mb-4">잔액 관리</h1>
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div class="text-sm opacity-90">현재 잔액</div>
        <div class="text-3xl font-bold">{formatCurrency(currentUser.balance || 0)}</div>
      </div>
    </div>

    <!-- 입출금 섹션 -->
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <!-- 입금 -->
      <div class="glass-card p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">입금</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">입금액 (원)</label>
            <input
              type="number"
              bind:value={depositAmount}
              placeholder="입금할 금액을 입력하세요"
              class="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            on:click={handleDeposit}
            disabled={loading || !depositAmount}
            class="w-full btn-primary px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리중...' : '입금 요청'}
          </button>
        </div>
      </div>

      <!-- 출금 -->
      <div class="glass-card p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">출금</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">출금액 (원)</label>
            <input
              type="number"
              bind:value={withdrawAmount}
              placeholder="출금할 금액을 입력하세요"
              class="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            on:click={handleWithdraw}
            disabled={loading || !withdrawAmount}
            class="w-full btn-secondary px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리중...' : '출금 요청'}
          </button>
        </div>
      </div>
    </div>

    <!-- 거래 내역 -->
    <div class="glass-card p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">거래 내역</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="text-left py-3 px-2">날짜</th>
              <th class="text-left py-3 px-2">구분</th>
              <th class="text-right py-3 px-2">금액</th>
              <th class="text-center py-3 px-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {#each transactionHistory as transaction (transaction.id)}
              <tr class="border-b border-gray-800 hover:bg-gray-800/50">
                <td class="py-3 px-2">{transaction.date}</td>
                <td class="py-3 px-2">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {transaction.type === 'deposit' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}">
                    {transaction.type === 'deposit' ? '입금' : '출금'}
                  </span>
                </td>
                <td class="py-3 px-2 text-right font-medium">
                  <span class="{transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'}">
                    {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </td>
                <td class="py-3 px-2 text-center">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs {getStatusClass(transaction.status)}">
                    {getStatusText(transaction.status)}
                  </span>
                </td>
              </tr>
            {/each}
            {#if transactionHistory.length === 0}
              <tr>
                <td colspan="4" class="py-8 text-center text-gray-400">거래 내역이 없습니다.</td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <div class="glass-card p-6 rounded-lg text-center">
      <h3 class="text-xl font-semibold">로그인이 필요합니다</h3>
      <p class="mt-2 text-sm text-gray-400">잔액 관리를 위해 먼저 로그인하세요.</p>
      <div class="mt-4">
        <button class="btn-primary px-4 py-2 rounded" on:click={() => goto('/login')}>로그인</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .glass-card {
    backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255,255,255,0.06);
  }

  .btn-primary {
    background-color: rgb(59 130 246);
    color: white;
  }

  .btn-primary:hover {
    background-color: rgb(37 99 235);
  }

  .btn-secondary {
    background-color: rgb(55 65 81);
    color: white;
  }

  .btn-secondary:hover {
    background-color: rgb(31 41 55);
  }
</style>