<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let tickets = [];
  let loading = true;
  let selectedStatus = 'all';

  const statusOptions = [
    { value: 'all', label: '전체', color: '#888' },
    { value: 'open', label: '대기중', color: '#ffa500' },
    { value: 'in_progress', label: '처리중', color: '#00bfff' },
    { value: 'answered', label: '답변완료', color: '#32cd32' },
    { value: 'closed', label: '종료', color: '#666' }
  ];

  const categoryLabels = {
    account: '계정/인증',
    payment: '입출금',
    game: '게임',
    technical: '기술지원',
    bug: '버그신고',
    suggestion: '건의사항',
    other: '기타'
  };

  const priorityLabels = {
    low: { label: '낮음', color: '#32cd32' },
    normal: { label: '보통', color: '#00bfff' },
    high: { label: '높음', color: '#ffa500' },
    urgent: { label: '긴급', color: '#ff4444' }
  };

  onMount(async () => {
    await loadTickets();
  });

  async function loadTickets() {
    try {
      loading = true;
      const url = selectedStatus !== 'all'
        ? `/api/support/tickets?status=${selectedStatus}`
        : '/api/support/tickets';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        tickets = data.tickets || [];
      }
    } catch (error) {
      console.error('티켓 로드 실패:', error);
    } finally {
      loading = false;
    }
  }

  function goToNewTicket() {
    goto('/support/tickets/new');
  }

  function viewTicket(id) {
    goto(`/support/tickets/${id}`);
  }

  $: if (selectedStatus) {
    loadTickets();
  }
</script>

<div class="tickets-container">
  <div class="tickets-header">
    <div>
      <h1>내 문의내역</h1>
      <p>문의하신 내역과 답변을 확인하세요</p>
    </div>
    <button class="btn-create" on:click={goToNewTicket}>
      + 새 문의하기
    </button>
  </div>

  <!-- 필터 -->
  <div class="ticket-filters">
    <span class="filter-label">상태:</span>
    <div class="status-filters">
      {#each statusOptions as status}
        <button
          class="status-filter"
          class:active={selectedStatus === status.value}
          style:--status-color={status.color}
          on:click={() => selectedStatus = status.value}
        >
          {status.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- 티켓 목록 -->
  {#if loading}
    <div class="loading">로딩 중...</div>
  {:else if tickets.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <p>문의 내역이 없습니다.</p>
      <button class="btn-create-empty" on:click={goToNewTicket}>
        첫 문의하기
      </button>
    </div>
  {:else}
    <div class="ticket-list">
      {#each tickets as ticket}
        <div
          class="ticket-card"
          on:click={() => viewTicket(ticket.id)}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && viewTicket(ticket.id)}
        >
          <div class="ticket-header">
            <div class="ticket-id">#{ticket.id}</div>
            <div class="ticket-category">{categoryLabels[ticket.category] || ticket.category}</div>
            <div class="ticket-priority" style="--priority-color: {priorityLabels[ticket.priority]?.color}">
              {priorityLabels[ticket.priority]?.label || ticket.priority}
            </div>
            <div class="ticket-status" class:status-{ticket.status}>
              {statusOptions.find(s => s.value === ticket.status)?.label || ticket.status}
            </div>
          </div>

          <div class="ticket-subject">{ticket.subject}</div>

          <div class="ticket-footer">
            <span class="ticket-date">
              {new Date(ticket.created_at).toLocaleDateString('ko-KR')}
            </span>
            {#if ticket.admin_response}
              <span class="has-response">답변 완료</span>
            {:else}
              <span class="no-response">답변 대기중</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tickets-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .tickets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .tickets-header h1 {
    font-size: 2rem;
    color: #fff;
    margin-bottom: 0.25rem;
  }

  .tickets-header p {
    color: #888;
  }

  .btn-create {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-create:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
  }

  .ticket-filters {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .filter-label {
    color: #888;
    font-weight: 500;
  }

  .status-filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .status-filter {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: #fff;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .status-filter:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .status-filter.active {
    background: var(--status-color);
    border-color: var(--status-color);
    color: #000;
    font-weight: 600;
  }

  .loading,
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #888;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .btn-create-empty {
    margin-top: 1rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 600;
    cursor: pointer;
  }

  .ticket-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ticket-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .ticket-card:hover {
    border-color: rgba(255, 215, 0, 0.3);
    transform: translateX(5px);
  }

  .ticket-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .ticket-id {
    color: #ffd700;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .ticket-category {
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #fff;
    font-size: 0.85rem;
  }

  .ticket-priority {
    padding: 0.25rem 0.75rem;
    background: var(--priority-color);
    border-radius: 4px;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .ticket-status {
    margin-left: auto;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .ticket-status.status-open {
    background: rgba(255, 165, 0, 0.2);
    color: #ffa500;
  }

  .ticket-status.status-in_progress {
    background: rgba(0, 191, 255, 0.2);
    color: #00bfff;
  }

  .ticket-status.status-answered {
    background: rgba(50, 205, 50, 0.2);
    color: #32cd32;
  }

  .ticket-status.status-closed {
    background: rgba(102, 102, 102, 0.2);
    color: #888;
  }

  .ticket-subject {
    color: #fff;
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .ticket-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ticket-date {
    color: #888;
    font-size: 0.9rem;
  }

  .has-response {
    color: #32cd32;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .no-response {
    color: #ffa500;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .tickets-header {
      flex-direction: column;
      align-items: stretch;
    }

    .btn-create {
      width: 100%;
    }

    .ticket-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .ticket-status {
      margin-left: 0;
    }
  }
</style>
