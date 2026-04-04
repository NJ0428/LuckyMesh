<script>
  import { onMount } from 'svelte';

  export let isOpen = false;
  let messages = [];
  let inputMessage = '';
  let isTyping = false;
  let sessionId = '';

  // 빠른 질문 옵션
  const quickQuestions = [
    { text: '입금 방법', message: '입금하는 방법 알려줘' },
    { text: '출금 방법', message: '출금하는 방법 알려줘' },
    { text: '게임 규칙', message: '게임 규칙이 어떻게 되나요?' },
    { text: 'VIP 혜택', message: 'VIP 혜택이 뭐가 있나요?' },
    { text: '버그 신고', message: '버그를 발견했어요' }
  ];

  onMount(() => {
    // 세션 ID 생성
    sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 환영 메시지
    addMessage('bot', '안녕하세요! LuckyMesh 고객센터 챗봇입니다. 무엇을 도와드릴까요?');
  });

  function addMessage(type, content) {
    messages = [...messages, { type, content, time: new Date() }];
  }

  async function sendMessage() {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = inputMessage.trim();
    addMessage('user', userMessage);
    inputMessage = '';
    isTyping = true;

    try {
      const response = await fetch('/api/support/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        addMessage('bot', data.response);
      } else {
        addMessage('bot', '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } catch (error) {
      addMessage('bot', '서버 연결에 실패했습니다. 나중에 다시 시도해주세요.');
    } finally {
      isTyping = false;
    }
  }

  function handleQuickQuestion(question) {
    inputMessage = question.message;
    sendMessage();
  }

  function toggleChat() {
    isOpen = !isOpen;
  }

  function scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // 메시지가 추가될 때마다 스크롤
  $: if (messages.length > 0) {
    setTimeout(scrollToBottom, 0);
  }
</script>

<!-- 챗봇 토글 버튼 -->
<button
  class="chatbot-toggle"
  class:open={isOpen}
  on:click={toggleChat}
  aria-label="챗봇 열기"
>
  {#if isOpen}
    <span class="close-icon">×</span>
  {:else}
    <span class="chat-icon">💬</span>
    <span class="notification-dot"></span>
  {/if}
</button>

<!-- 챗봇 창 -->
{#if isOpen}
  <div class="chatbot-container">
    <div class="chatbot-header">
      <div class="header-info">
        <span class="bot-avatar">🤖</span>
        <div>
          <h3>LuckyMesh 챗봇</h3>
          <p>실시간 상담</p>
        </div>
      </div>
    </div>

    <div class="chatbot-body">
      <!-- 빠른 질문 (메시지가 없을 때만 표시) -->
      {#if messages.length <= 1}
        <div class="quick-questions">
          <p class="quick-title">자주 묻는 질문</p>
          <div class="quick-buttons">
            {#each quickQuestions as q}
              <button
                class="quick-btn"
                on:click={() => handleQuickQuestion(q)}
              >
                {q.text}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- 메시지 목록 -->
      <div class="chat-messages">
        {#each messages as msg}
          <div class="message" class:message-bot={msg.type === 'bot'} class:message-user={msg.type === 'user'}>
            {#if msg.type === 'bot'}
              <span class="message-avatar">🤖</span>
            {/if}
            <div class="message-content">
              <div class="message-text">{msg.content}</div>
              <span class="message-time">
                {msg.time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        {/each}

        {#if isTyping}
          <div class="message message-bot">
            <span class="message-avatar">🤖</span>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="chatbot-footer">
      <form on:submit|preventDefault={sendMessage}>
        <input
          type="text"
          class="chat-input"
          placeholder="메시지를 입력하세요..."
          bind:value={inputMessage}
          disabled={isTyping}
        />
        <button
          type="submit"
          class="send-button"
          disabled={isTyping || !inputMessage.trim()}
        >
          <span>→</span>
        </button>
      </form>
    </div>
  </div>
{/if}

<style>
  .chatbot-toggle {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
    z-index: 999;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chatbot-toggle:hover {
    transform: scale(1.1);
  }

  .chatbot-toggle.open {
    background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
    box-shadow: 0 4px 20px rgba(255, 68, 68, 0.4);
  }

  .chat-icon {
    font-size: 1.8rem;
  }

  .close-icon {
    font-size: 2rem;
    color: #fff;
    line-height: 1;
  }

  .notification-dot {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 14px;
    height: 14px;
    background: #ff4444;
    border: 2px solid #fff;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .chatbot-container {
    position: fixed;
    bottom: 6rem;
    right: 2rem;
    width: 380px;
    max-width: calc(100vw - 4rem);
    height: 600px;
    max-height: calc(100vh - 8rem);
    background: linear-gradient(135deg, #1a1a2e 0%, #16162a 100%);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 998;
    overflow: hidden;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .chatbot-header {
    padding: 1rem 1.5rem;
    background: rgba(255, 215, 0, 0.1);
    border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .bot-avatar {
    font-size: 2rem;
  }

  .header-info h3 {
    font-size: 1rem;
    color: #fff;
    margin: 0;
  }

  .header-info p {
    font-size: 0.8rem;
    color: #ffd700;
    margin: 0;
  }

  .chatbot-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .quick-questions {
    padding: 1rem 1rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .quick-title {
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 0.75rem;
  }

  .quick-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .quick-btn {
    padding: 0.5rem 0.75rem;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    color: #ffd700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-btn:hover {
    background: rgba(255, 215, 0, 0.2);
    border-color: #ffd700;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .message-bot {
    justify-content: flex-start;
  }

  .message-user {
    justify-content: flex-end;
  }

  .message-avatar {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .message-content {
    max-width: 80%;
  }

  .message-text {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    line-height: 1.4;
  }

  .message-bot .message-text {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border-bottom-left-radius: 4px;
  }

  .message-user .message-text {
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    color: #000;
    border-bottom-right-radius: 4px;
  }

  .message-time {
    display: block;
    font-size: 0.7rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .message-user .message-time {
    text-align: right;
  }

  .typing-indicator {
    display: flex;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    border-bottom-left-radius: 4px;
    width: fit-content;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    background: #888;
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.5;
    }
    30% {
      transform: translateY(-4px);
      opacity: 1;
    }
  }

  .chatbot-footer {
    padding: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .chatbot-footer form {
    display: flex;
    gap: 0.5rem;
  }

  .chat-input {
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    color: #fff;
    font-size: 0.95rem;
  }

  .chat-input:focus {
    outline: none;
    border-color: #ffd700;
  }

  .chat-input::placeholder {
    color: #666;
  }

  .send-button {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border: none;
    color: #000;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .send-button:hover:not(:disabled) {
    transform: scale(1.1);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* 스크롤바 스타일 */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: rgba(255, 215, 0, 0.3);
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 215, 0, 0.5);
  }

  @media (max-width: 480px) {
    .chatbot-container {
      right: 1rem;
      left: 1rem;
      width: auto;
      max-width: none;
      bottom: 5rem;
      height: calc(100vh - 7rem);
      max-height: none;
    }

    .chatbot-toggle {
      right: 1rem;
      bottom: 1rem;
    }
  }
</style>
