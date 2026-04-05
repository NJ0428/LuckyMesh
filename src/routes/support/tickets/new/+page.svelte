<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let formData = {
    category: '',
    subject: '',
    message: '',
    priority: 'normal'
  };

  let submitting = false;
  let error = '';
  let success = false;

  const categories = [
    { value: 'account', label: '계정/인증', icon: '👤' },
    { value: 'payment', label: '입출금', icon: '💰' },
    { value: 'game', label: '게임', icon: '🎮' },
    { value: 'technical', label: '기술지원', icon: '🔧' },
    { value: 'bug', label: '버그신고', icon: '🐛' },
    { value: 'suggestion', label: '건의사항', icon: '💡' },
    { value: 'other', label: '기타', icon: '📂' }
  ];

  const priorities = [
    { value: 'low', label: '낮음', description: '단순 문의' },
    { value: 'normal', label: '보통', description: '일반적인 문의' },
    { value: 'high', label: '높음', description: '긴급한 문제' },
    { value: 'urgent', label: '긴급', description: '서비스 이슈' }
  ];

  async function submitTicket() {
    if (!formData.category || !formData.subject || !formData.message) {
      error = '모든 필수 항목을 입력해주세요.';
      return;
    }

    submitting = true;
    error = '';

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        success = true;
        setTimeout(() => {
          goto('/support/tickets');
        }, 1500);
      } else {
        error = data.error || '티켓 생성에 실패했습니다.';
      }
    } catch (err) {
      error = '서버 오류가 발생했습니다. 다시 시도해주세요.';
    } finally {
      submitting = false;
    }
  }

  function goBack() {
    goto('/support/tickets');
  }
</script>

<div class="new-ticket-container">
  <div class="new-ticket-header">
    <button class="btn-back" on:click={goBack}>←</button>
    <h1>새 문의하기</h1>
  </div>

  {#if success}
    <div class="success-message">
      <div class="success-icon">✓</div>
      <p>티켓이 성공적으로 생성되었습니다!</p>
      <small>문의 내역으로 이동합니다...</small>
    </div>
  {:else}
    <form class="ticket-form" on:submit|preventDefault={submitTicket}>
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <!-- 카테고리 선택 -->
      <div class="form-group">
        <label class="form-label required">카테고리</label>
        <div class="category-grid">
          {#each categories as cat}
            <button
              type="button"
              class="category-option"
              class:selected={formData.category === cat.value}
              on:click={() => formData.category = cat.value}
            >
              <span class="category-icon">{cat.icon}</span>
              <span class="category-label">{cat.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- 우선순위 선택 -->
      <div class="form-group">
        <label class="form-label">우선순위</label>
        <div class="priority-options">
          {#each priorities as prio}
            <button
              type="button"
              class="priority-option"
              class:selected={formData.priority === prio.value}
              on:click={() => formData.priority = prio.value}
            >
              <span class="priority-label">{prio.label}</span>
              <span class="priority-desc">{prio.description}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- 제목 -->
      <div class="form-group">
        <label class="form-label required">제목</label>
        <input
          type="text"
          class="form-input"
          placeholder="문의 제목을 입력하세요"
          bind:value={formData.subject}
          maxlength="100"
        />
        <small class="char-count">{formData.subject.length}/100</small>
      </div>

      <!-- 내용 -->
      <div class="form-group">
        <label class="form-label required">문의 내용</label>
        <textarea
          class="form-textarea"
          placeholder="자세한 문의 내용을 입력해주세요..."
          bind:value={formData.message}
          rows="10"
          maxlength="5000"
        ></textarea>
        <small class="char-count">{formData.message.length}/5000</small>
      </div>

      <!-- 제출 버튼 -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" on:click={goBack}>
          취소
        </button>
        <button type="submit" class="btn-submit" disabled={submitting}>
          {submitting ? '제출 중...' : '문의하기'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .new-ticket-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .new-ticket-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .btn-back {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-back:hover {
    background: rgba(255, 215, 0, 0.1);
    border-color: rgba(255, 215, 0, 0.3);
  }

  .new-ticket-header h1 {
    font-size: 1.8rem;
    color: #fff;
  }

  .success-message {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(50, 205, 50, 0.3);
    border-radius: 16px;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(50, 205, 50, 0.2);
    border-radius: 50%;
    color: #32cd32;
    font-size: 3rem;
  }

  .success-message p {
    color: #32cd32;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .success-message small {
    color: #888;
  }

  .ticket-form {
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
  }

  .error-message {
    padding: 1rem;
    background: rgba(255, 68, 68, 0.2);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: 8px;
    color: #ff4444;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 2rem;
  }

  .form-label {
    display: block;
    color: #fff;
    font-weight: 500;
    margin-bottom: 0.75rem;
  }

  .form-label.required::after {
    content: ' *';
    color: #ff4444;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .category-option {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .category-option:hover {
    background: rgba(255, 215, 0, 0.05);
    border-color: rgba(255, 215, 0, 0.3);
  }

  .category-option.selected {
    background: rgba(255, 215, 0, 0.1);
    border-color: #ffd700;
  }

  .category-icon {
    font-size: 1.5rem;
  }

  .category-label {
    font-size: 0.85rem;
  }

  .priority-options {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .priority-option {
    flex: 1;
    min-width: 120px;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .priority-option:hover {
    background: rgba(255, 215, 0, 0.05);
    border-color: rgba(255, 215, 0, 0.3);
  }

  .priority-option.selected {
    background: rgba(255, 215, 0, 0.1);
    border-color: #ffd700;
  }

  .priority-label {
    font-weight: 600;
  }

  .priority-desc {
    font-size: 0.75rem;
    color: #888;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #ffd700;
    background: rgba(255, 255, 255, 0.08);
  }

  .form-textarea {
    resize: vertical;
    min-height: 200px;
  }

  .char-count {
    display: block;
    text-align: right;
    color: #888;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn-cancel {
    padding: 0.75rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-submit {
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border: none;
    border-radius: 8px;
    color: #000;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .category-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .priority-options {
      flex-direction: column;
    }

    .form-actions {
      flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
      width: 100%;
    }
  }
</style>
