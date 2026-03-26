<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let depositAccount = null;
  let depositAmount = 0;
  let withdrawAmount = 0;
  let loading = false;
  let error = '';
  let success = '';
  let showCreateModal = false;
  let initialAmount = 0;
  let interestType = 'daily';
  let stats = null;

  onMount(async () => {
    await loadDepositAccount();
    await loadStats();
  });

  async function loadDepositAccount() {
    try {
      const response = await fetch('/api/deposits/account');
      const data = await response.json();
      if (data.success) {
        depositAccount = data;
      }
    } catch (err) {
      console.error('예치금 계좌 로딩 오류:', err);
    }
  }

  async function loadStats() {
    try {
      const response = await fetch('/api/deposits/stats');
      const data = await response.json();
      if (data.success) {
        stats = data;
      }
    } catch (err) {
      console.error('통계 로딩 오류:', err);
    }
  }

  async function createAccount() {
    loading = true;
    error = '';
    success = '';

    try {
      const response = await fetch('/api/deposits/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialAmount, interestType })
      });
      const data = await response.json();

      if (data.success) {
        success = data.message;
        showCreateModal = false;
        await loadDepositAccount();
        await loadStats();
      } else {
        error = data.error;
      }
    } catch (err) {
      error = '계좌 생성에 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  async function handleDeposit() {
    loading = true;
    error = '';
    success = '';

    try {
      const response = await fetch('/api/deposits/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: depositAmount })
      });
      const data = await response.json();

      if (data.success) {
        success = data.message;
        depositAmount = 0;
        await loadDepositAccount();
        await loadStats();
      } else {
        error = data.error;
      }
    } catch (err) {
      error = '입금에 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  async function handleWithdraw() {
    loading = true;
    error = '';
    success = '';

    try {
      const response = await fetch('/api/deposits/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: withdrawAmount })
      });
      const data = await response.json();

      if (data.success) {
        success = data.message;
        withdrawAmount = 0;
        await loadDepositAccount();
        await loadStats();
      } else {
        error = data.error;
      }
    } catch (err) {
      error = '출금에 실패했습니다.';
    } finally {
      loading = false;
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR');
  }

  function formatNumber(num) {
    return num ? num.toLocaleString() : '0';
  }

  function getVipTierLabel(vipTier) {
    const tiers = {
      bronze: '브론즈',
      silver: '실버',
      gold: '골드',
      platinum: '플래티넘',
      diamond: '다이아몬드'
    };
    return tiers[vipTier] || vipTier;
  }
</script>

<div class="deposits-container">
  <div class="header">
    <h1>💰 예적금 & 이자 시스템</h1>
    <p>칩을 예치하고 매일/매주 이자를 받으세요!</p>
  </div>

  {#if error}
    <div class="alert alert-error">{error}</div>
  {/if}

  {#if success}
    <div class="alert alert-success">{success}</div>
  {/if}

  {#if !depositAccount}
    <div class="no-account">
      <div class="no-account-icon">🏦</div>
      <h2>예치금 계좌가 없습니다</h2>
      <p>계좌를 생성하고 칩을 예치하여 이자를 받으세요.</p>
      <button class="btn btn-primary" on:click={() => showCreateModal = true}>
        계좌 생성하기
      </button>
    </div>
  {:else}
    <div class="account-info">
      <div class="account-header">
        <h2>내 예치금 계좌</h2>
        <span class="status-badge status-{depositAccount.deposit.status}">
          {depositAccount.deposit.status === 'active' ? '활성' : '비활성'}
        </span>
      </div>

      <div class="balance-card">
        <div class="balance-label">예치금 잔액</div>
        <div class="balance-amount">{formatNumber(depositAccount.deposit.amount)} 칩</div>
      </div>

      <div class="account-details">
        <div class="detail-item">
          <span class="detail-label">이자율</span>
          <span class="detail-value">{(depositAccount.deposit.interestRate * 100).toFixed(1)}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">이자 지급 주기</span>
          <span class="detail-value">
            {depositAccount.deposit.interestType === 'daily' ? '일일' : '주간'}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">마지막 이자 지급</span>
          <span class="detail-value">{formatDate(depositAccount.deposit.lastInterestPaid)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">마지막 활동</span>
          <span class="detail-value">{formatDate(depositAccount.deposit.lastActivity)}</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <div class="action-card deposit-card">
        <h3>💵 입금</h3>
        <p>보유 중인 칩을 예치금 계좌에 입금하세요.</p>
        <input
          type="number"
          bind:value={depositAmount}
          min="1000"
          step="1000"
          placeholder="입금할 칩 수"
          class="input-field"
        />
        <button
          class="btn btn-deposit"
          on:click={handleDeposit}
          disabled={loading || depositAmount <= 0}
        >
          {loading ? '처리 중...' : '입금하기'}
        </button>
      </div>

      <div class="action-card withdraw-card">
        <h3>💸 출금</h3>
        <p>예치금 계좌에서 칩을 출금하세요.</p>
        <input
          type="number"
          bind:value={withdrawAmount}
          min="1000"
          step="1000"
          placeholder="출금할 칩 수"
          class="input-field"
        />
        <button
          class="btn btn-withdraw"
          on:click={handleWithdraw}
          disabled={loading || withdrawAmount <= 0}
        >
          {loading ? '처리 중...' : '출금하기'}
        </button>
      </div>
    </div>

    <div class="history-section">
      <h3>📊 거래 내역</h3>
      {#if depositAccount.transactions && depositAccount.transactions.length > 0}
        <div class="transaction-list">
          {#each depositAccount.transactions.slice(0, 10) as transaction}
            <div class="transaction-item">
              <span class="transaction-type type-{transaction.transaction_type}">
                {transaction.transaction_type === 'deposit' ? '입금' : '출금'}
              </span>
              <span class="transaction-amount {transaction.transaction_type === 'deposit' ? 'positive' : 'negative'}">
                {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatNumber(transaction.amount)} 칩
              </span>
              <span class="transaction-balance">
                잔액: {formatNumber(transaction.balance_after)}
              </span>
              <span class="transaction-date">{formatDate(transaction.created_at)}</span>
              {#if transaction.reason}
                <span class="transaction-reason">{transaction.reason}</span>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <p class="no-history">거래 내역이 없습니다.</p>
      {/if}
    </div>

    <div class="interest-history-section">
      <h3>💰 이자 지급 내역</h3>
      {#if depositAccount.interestHistory && depositAccount.interestHistory.length > 0}
        <div class="interest-list">
          {#each depositAccount.interestHistory.slice(0, 10) as history}
            <div class="interest-item">
              <span class="interest-amount">+{formatNumber(history.interest_amount)} 칩</span>
              <span class="interest-rate">{(history.interest_rate * 100).toFixed(1)}%</span>
              <span class="interest-date">{formatDate(history.paid_at)}</span>
            </div>
          {/each}
        </div>
      {:else}
        <p class="no-history">이자 지급 내역이 없습니다.</p>
      {/if}
    </div>
  {/if}

  {#if stats && stats.stats}
    <div class="stats-section">
      <h3>📈 시스템 통계</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">총 계좌 수</div>
          <div class="stat-value">{formatNumber(stats.stats.totalAccounts)}개</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">총 예치금</div>
          <div class="stat-value">{formatNumber(stats.stats.totalDeposited)} 칩</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">평균 예치금</div>
          <div class="stat-value">{formatNumber(stats.stats.avgDeposit)} 칩</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">평균 이자율</div>
          <div class="stat-value">{(stats.stats.avgInterestRate * 100).toFixed(2)}%</div>
        </div>
      </div>

      {#if stats.vipRates && stats.vipRates.length > 0}
        <h4>VIP 등급별 이자율</h4>
        <div class="vip-rates-grid">
          {#each stats.vipRates as vipRate}
            <div class="vip-rate-item">
              <span class="vip-tier">{getVipTierLabel(vipRate.vip_tier)}</span>
              <span class="vip-rate">{(vipRate.avg_rate * 100).toFixed(2)}%</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

{#if showCreateModal}
  <div class="modal-overlay" on:click={() => showCreateModal = false}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>예치금 계좌 생성</h2>
        <button class="modal-close" on:click={() => showCreateModal = false}>&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>초기 입금액 (선택사항)</label>
          <input
            type="number"
            bind:value={initialAmount}
            min="0"
            step="1000"
            placeholder="0"
            class="input-field"
          />
        </div>
        <div class="form-group">
          <label>이자 지급 주기</label>
          <select bind:value={interestType} class="select-field">
            <option value="daily">일일 (매일 이자 지급)</option>
            <option value="weekly">주간 (매주 이자 지급)</option>
          </select>
        </div>
        <div class="info-box">
          <p>💡 VIP 등급에 따라 이자율이 다릅니다:</p>
          <ul>
            <li>브론즈: 1.0% (일일)</li>
            <li>실버: 1.5% (일일)</li>
            <li>골드: 2.0% (일일)</li>
            <li>플래티넘: 2.5% (일일)</li>
            <li>다이아몬드: 3.0% (일일)</li>
          </ul>
          <p>⚠️ 7일 이상 게임 미진행 시 예치금이 자동으로 반환됩니다.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={() => showCreateModal = false}>취소</button>
        <button class="btn btn-primary" on:click={createAccount} disabled={loading}>
          {loading ? '생성 중...' : '계좌 생성'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .deposits-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
  }

  .header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }

  .header p {
    color: #666;
    font-size: 1.1rem;
  }

  .alert {
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .alert-error {
    background-color: #fee;
    color: #c33;
    border: 1px solid #fcc;
  }

  .alert-success {
    background-color: #efe;
    color: #3c3;
    border: 1px solid #cfc;
  }

  .no-account {
    text-align: center;
    padding: 60px 20px;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .no-account-icon {
    font-size: 4rem;
    margin-bottom: 20px;
  }

  .no-account h2 {
    margin-bottom: 10px;
  }

  .account-info {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 30px;
  }

  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .status-badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: bold;
  }

  .status-active {
    background: #4ade80;
    color: #065f46;
  }

  .status-closed {
    background: #f87171;
    color: #991b1b;
  }

  .balance-card {
    text-align: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .balance-label {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 5px;
  }

  .balance-amount {
    font-size: 2.5rem;
    font-weight: bold;
  }

  .account-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .detail-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 8px;
  }

  .detail-label {
    display: block;
    font-size: 0.85rem;
    opacity: 0.8;
    margin-bottom: 5px;
  }

  .detail-value {
    font-size: 1.1rem;
    font-weight: bold;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .action-card {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .action-card h3 {
    margin-bottom: 10px;
  }

  .action-card p {
    color: #666;
    margin-bottom: 20px;
  }

  .input-field, .select-field {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    margin-bottom: 15px;
    font-size: 1rem;
  }

  .btn {
    width: 100%;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-deposit {
    background: #10b981;
    color: white;
  }

  .btn-deposit:hover:not(:disabled) {
    background: #059669;
  }

  .btn-withdraw {
    background: #ef4444;
    color: white;
  }

  .btn-withdraw:hover:not(:disabled) {
    background: #dc2626;
  }

  .history-section, .interest-history-section {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
  }

  .transaction-list, .interest-list {
    margin-top: 20px;
  }

  .transaction-item, .interest-item {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    padding: 15px;
    border-bottom: 1px solid #eee;
    align-items: center;
  }

  .transaction-item:last-child, .interest-item:last-child {
    border-bottom: none;
  }

  .transaction-type {
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: bold;
  }

  .type-deposit {
    background: #d1fae5;
    color: #065f46;
  }

  .type-withdrawal {
    background: #fee2e2;
    color: #991b1b;
  }

  .transaction-amount.positive {
    color: #10b981;
    font-weight: bold;
  }

  .transaction-amount.negative {
    color: #ef4444;
    font-weight: bold;
  }

  .interest-amount {
    color: #10b981;
    font-weight: bold;
    font-size: 1.1rem;
  }

  .no-history {
    text-align: center;
    color: #999;
    padding: 20px;
  }

  .stats-section {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .stat-item {
    text-align: center;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #667eea;
  }

  .vip-rates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }

  .vip-rate-item {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 6px;
  }

  .vip-tier {
    font-weight: bold;
  }

  .vip-rate {
    color: #10b981;
    font-weight: bold;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
  }

  .modal-body {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .info-box {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 15px;
  }

  .info-box p {
    margin-bottom: 10px;
  }

  .info-box ul {
    margin-left: 20px;
    margin-bottom: 10px;
  }

  .info-box li {
    margin-bottom: 5px;
  }

  .modal-footer {
    display: flex;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #eee;
  }
</style>
