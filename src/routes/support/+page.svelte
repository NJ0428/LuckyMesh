<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let faqs = [];
  let loading = true;
  let selectedCategory = 'all';
  let searchQuery = '';
  let expandedFaq = null;

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'account', label: '계정/인증' },
    { value: 'payment', label: '입출금' },
    { value: 'game', label: '게임' },
    { value: 'technical', label: '기술지원' },
    { value: 'vip', label: 'VIP/혜택' },
    { value: 'event', label: '이벤트' }
  ];

  onMount(async () => {
    await loadFaqs();
  });

  async function loadFaqs() {
    try {
      const url = searchQuery
        ? `/api/support/faq?search=${encodeURIComponent(searchQuery)}`
        : selectedCategory !== 'all'
        ? `/api/support/faq?category=${selectedCategory}`
        : '/api/support/faq';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        faqs = data.faqs || [];
      }
    } catch (error) {
      console.error('FAQ 로드 실패:', error);
    } finally {
      loading = false;
    }
  }

  function toggleFaq(id) {
    expandedFaq = expandedFaq === id ? null : id;
  }

  function goToTicketList() {
    goto('/support/tickets');
  }

  function goToNewTicket() {
    goto('/support/tickets/new');
  }

  function goToBugReport() {
    goto('/support/bug-report');
  }

  $: if (searchQuery !== '' || selectedCategory !== 'all') {
    loading = true;
    const timer = setTimeout(() => loadFaqs(), 300);
    return () => clearTimeout(timer);
  }
</script>

<div class="support-container">
  <div class="support-header">
    <h1 class="support-title">고객센터</h1>
    <p class="support-subtitle">24시간 여러분의 편리한 이용을 돕습니다</p>
  </div>

  <!-- 빠른 메뉴 -->
  <div class="quick-menu">
    <button class="quick-menu-item" on:click={goToNewTicket}>
      <div class="quick-icon">📝</div>
      <div class="quick-title">1:1 문의하기</div>
      <div class="quick-desc">궁금한 점을 문의하세요</div>
    </button>

    <button class="quick-menu-item" on:click={goToTicketList}>
      <div class="quick-icon">📋</div>
      <div class="quick-title">내 문의내역</div>
      <div class="quick-desc">문의하신 내역을 확인하세요</div>
    </button>

    <button class="quick-menu-item" on:click={goToBugReport}>
      <div class="quick-icon">🐛</div>
      <div class="quick-title">버그 리포트</div>
      <div class="quick-desc">버그를 신고해주세요</div>
    </button>
  </div>

  <!-- FAQ 섹션 -->
  <div class="faq-section">
    <div class="faq-header">
      <h2>자주 묻는 질문</h2>

      <div class="faq-controls">
        <div class="search-box">
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            bind:value={searchQuery}
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>

        <select bind:value={selectedCategory} class="category-select">
          {#each categories as cat}
            <option value={cat.value}>{cat.label}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if loading}
      <div class="loading">로딩 중...</div>
    {:else}
      <div class="faq-list">
        {#if faqs.length === 0}
          <div class="no-results">검색 결과가 없습니다.</div>
        {:else}
          {#each faqs as faq}
            <div class="faq-item">
              <button
                class="faq-question"
                class:expanded={expandedFaq === faq.id}
                on:click={() => toggleFaq(faq.id)}
              >
                <span class="faq-category">[{faq.category}]</span>
                {faq.question}
                <span class="faq-toggle">{expandedFaq === faq.id ? '−' : '+'}</span>
              </button>

              {#if expandedFaq === faq.id}
                <div class="faq-answer">
                  {@html faq.answer}
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>

  <!-- 연락처 정보 -->
  <div class="contact-info">
    <h3>고객센터 운영 안내</h3>
    <div class="contact-grid">
      <div class="contact-item">
        <div class="contact-icon">📞</div>
        <div class="contact-text">
          <strong>전화 상담</strong>
          <p>1588-0000</p>
          <small>평일 09:00 - 18:00</small>
        </div>
      </div>

      <div class="contact-item">
        <div class="contact-icon">📧</div>
        <div class="contact-text">
          <strong>이메일 문의</strong>
          <p>support@luckymesh.com</p>
          <small>24시간 접수 가능</small>
        </div>
      </div>

      <div class="contact-item">
        <div class="contact-icon">💬</div>
        <div class="contact-text">
          <strong>실시간 채팅</strong>
          <p>채팅 상담 이용</p>
          <small>평일 09:00 - 18:00</small>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .support-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .support-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .support-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .support-subtitle {
    color: #888;
    font-size: 1.1rem;
  }

  .quick-menu {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 4rem;
  }

  .quick-menu-item {
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .quick-menu-item:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
  }

  .quick-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .quick-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #ffd700;
    margin-bottom: 0.5rem;
  }

  .quick-desc {
    color: #888;
    font-size: 0.9rem;
  }

  .faq-section {
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .faq-header {
    margin-bottom: 2rem;
  }

  .faq-header h2 {
    font-size: 1.8rem;
    color: #fff;
    margin-bottom: 1.5rem;
  }

  .faq-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
  }

  .search-input:focus {
    outline: none;
    border-color: #ffd700;
  }

  .search-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.5;
  }

  .category-select {
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
  }

  .category-select:focus {
    outline: none;
    border-color: #ffd700;
  }

  .loading,
  .no-results {
    text-align: center;
    padding: 3rem;
    color: #888;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .faq-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .faq-question {
    width: 100%;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: none;
    border: none;
    color: #fff;
    font-size: 1rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }

  .faq-question:hover {
    background: rgba(255, 215, 0, 0.05);
  }

  .faq-question.expanded {
    background: rgba(255, 215, 0, 0.1);
  }

  .faq-category {
    color: #ffd700;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .faq-toggle {
    margin-left: auto;
    font-size: 1.5rem;
    color: #ffd700;
  }

  .faq-answer {
    padding: 1rem 1.5rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #ccc;
    line-height: 1.6;
  }

  .contact-info {
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
    padding: 2rem;
  }

  .contact-info h3 {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .contact-icon {
    font-size: 2rem;
  }

  .contact-text strong {
    display: block;
    color: #ffd700;
    margin-bottom: 0.25rem;
  }

  .contact-text p {
    color: #fff;
    margin-bottom: 0.25rem;
  }

  .contact-text small {
    color: #888;
  }

  @media (max-width: 768px) {
    .support-title {
      font-size: 2rem;
    }

    .quick-menu {
      grid-template-columns: 1fr;
    }

    .faq-controls {
      flex-direction: column;
    }
  }
</style>
