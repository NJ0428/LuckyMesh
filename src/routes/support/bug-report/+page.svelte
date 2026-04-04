<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let formData = {
    title: '',
    description: '',
    reproduction_steps: '',
    severity: 'medium',
    device_info: '',
    browser_info: '',
    screenshots: ''
  };

  let submitting = false;
  let error = '';
  let success = false;

  const severities = [
    { value: 'low', label: '낮음', color: '#32cd32', description: '사용에 지장이 없는 사소한 문제' },
    { value: 'medium', label: '보통', color: '#ffa500', description: '일부 기능에 영향을 미치는 문제' },
    { value: 'high', label: '높음', color: '#ff4444', description: '주요 기능에 영향을 미치는 문제' },
    { value: 'critical', label: '심각', color: '#cc0000', description: '서비스 이용이 불가능한 문제' }
  ];

  onMount(() => {
    // 브라우저 정보 자동 수집
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const browser = getBrowserInfo(ua);
      formData.browser_info = JSON.stringify({
        browser,
        userAgent: ua,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
      });
    }
  });

  function getBrowserInfo(ua) {
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
    return 'Unknown';
  }

  async function submitBugReport() {
    if (!formData.title || !formData.description) {
      error = '제목과 설명은 필수 항목입니다.';
      return;
    }

    submitting = true;
    error = '';

    try {
      const response = await fetch('/api/support/bug-report', {
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
          goto('/support');
        }, 2000);
      } else {
        error = data.error || '버그 리포트 제출에 실패했습니다.';
      }
    } catch (err) {
      error = '서버 오류가 발생했습니다. 다시 시도해주세요.';
    } finally {
      submitting = false;
    }
  }

  function goBack() {
    goto('/support');
  }
</script>

<div class="bug-report-container">
  <div class="bug-report-header">
    <button class="btn-back" on:click={goBack}>←</button>
    <div>
      <h1>버그 리포트</h1>
      <p>발견하신 버그를 신고해주세요. 빠른 시일 내에 처리하겠습니다.</p>
    </div>
  </div>

  {#if success}
    <div class="success-message">
      <div class="success-icon">🐛</div>
      <p>버그 리포트가 제출되었습니다!</p>
      <small>신해해주셔서 감사합니다.</small>
    </div>
  {:else}
    <form class="bug-report-form" on:submit|preventDefault={submitBugReport}>
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <!-- 제목 -->
      <div class="form-group">
        <label class="form-label required">버그 제목</label>
        <input
          type="text"
          class="form-input"
          placeholder="버그를 간단히 설명해주세요"
          bind:value={formData.title}
          maxlength="100"
        />
        <small class="char-count">{formData.title.length}/100</small>
      </div>

      <!-- 심각도 -->
      <div class="form-group">
        <label class="form-label">심각도</label>
        <div class="severity-options">
          {#each severities as sev}
            <button
              type="button"
              class="severity-option"
              class:selected={formData.severity === sev.value}
              style:--severity-color={sev.color}
              on:click={() => formData.severity = sev.value}
            >
              <span class="severity-dot"></span>
              <div>
                <span class="severity-label">{sev.label}</span>
                <span class="severity-desc">{sev.description}</span>
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- 설명 -->
      <div class="form-group">
        <label class="form-label required">상세 설명</label>
        <textarea
          class="form-textarea"
          placeholder="버그에 대해 자세히 설명해주세요..."
          bind:value={formData.description}
          rows="5"
          maxlength="2000"
        ></textarea>
        <small class="char-count">{formData.description.length}/2000</small>
      </div>

      <!-- 재현 단계 -->
      <div class="form-group">
        <label class="form-label">재현 단계</label>
        <textarea
          class="form-textarea"
          placeholder="버그가 발생하는 단계를 순서대로 설명해주세요..."
          bind:value={formData.reproduction_steps}
          rows="4"
          maxlength="2000"
        ></textarea>
        <small class="char-count">{formData.reproduction_steps.length}/2000</small>
        <small class="hint">예: 1) 로그인 페이지 접속 → 2) 아이디 입력 → 3) 로그인 버튼 클릭</small>
      </div>

      <!-- 기기 정보 -->
      <div class="form-group">
        <label class="form-label">기기 정보 (선택)</label>
        <input
          type="text"
          class="form-input"
          placeholder="예: iPhone 13, Galaxy S22, Windows 11..."
          bind:value={formData.device_info}
        />
      </div>

      <!-- 스크린샷 URL -->
      <div class="form-group">
        <label class="form-label">스크린샷 URL (선택)</label>
        <input
          type="text"
          class="form-input"
          placeholder="이미지 호스팅 서비스에 업로드된 URL을 입력하세요"
          bind:value={formData.screenshots}
        />
        <small class="hint">imgur, cloudinary 등의 서비스를 이용해 이미지를 공유해주세요</small>
      </div>

      <!-- 브라우저 정보 (자동 수집됨) -->
      {#if formData.browser_info}
        <div class="form-group">
          <label class="form-label">자동 수집된 브라우저 정보</label>
          <div class="auto-collected">
            {#each JSON.parse(formData.browser_info) || {} as value, key}
              {#if key !== 'userAgent' && value}
                <span class="info-tag">{key}: {value}</span>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- 제출 버튼 -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" on:click={goBack}>
          취소
        </button>
        <button type="submit" class="btn-submit" disabled={submitting}>
          {submitting ? '제출 중...' : '버그 신고하기'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .bug-report-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .bug-report-header {
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

  .bug-report-header h1 {
    font-size: 1.8rem;
    color: #fff;
    margin-bottom: 0.25rem;
  }

  .bug-report-header p {
    color: #888;
  }

  .success-message {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(50, 205, 50, 0.3);
    border-radius: 16px;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
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

  .bug-report-form {
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
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    color: #fff;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .form-label.required::after {
    content: ' *';
    color: #ff4444;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
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
    min-height: 120px;
  }

  .char-count {
    display: block;
    text-align: right;
    color: #888;
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }

  .hint {
    display: block;
    color: #666;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }

  .severity-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .severity-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .severity-option:hover {
    background: rgba(255, 215, 0, 0.05);
    border-color: rgba(255, 215, 0, 0.3);
  }

  .severity-option.selected {
    background: rgba(255, 215, 0, 0.1);
    border-color: var(--severity-color);
  }

  .severity-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--severity-color);
    flex-shrink: 0;
  }

  .severity-label {
    display: block;
    font-weight: 600;
  }

  .severity-desc {
    display: block;
    font-size: 0.85rem;
    color: #888;
  }

  .auto-collected {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .info-tag {
    padding: 0.25rem 0.75rem;
    background: rgba(0, 191, 255, 0.1);
    border: 1px solid rgba(0, 191, 255, 0.3);
    border-radius: 4px;
    color: #00bfff;
    font-size: 0.85rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
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
    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(255, 68, 68, 0.4);
  }

  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    .form-actions {
      flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
      width: 100%;
    }
  }
</style>
