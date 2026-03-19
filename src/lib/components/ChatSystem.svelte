<script>
	import { onMount, onDestroy } from 'svelte';
	import { io } from 'socket.io-client';
	import { browser } from '$app/environment';
	import {
		filterProfanity,
		containsProfanity,
		validateMessageLength,
		generateMessageId,
		getReactionEmojis,
		formatMessage,
		SpamFilter,
		processCommand,
		detectLanguage,
		getHelpText
	} from '$lib/utils/chatUtils.js';

	export let room = 'global';
	export let position = 'right'; // left, right, floating
	export let theme = 'pastel';
	export let maxHeight = '500px';

	let socket;
	let messages = [];
	let messageInput = '';
	let isConnected = false;
	let isAuthenticated = false;
	let currentUser = null;
	let isTyping = false;
	let typingUsers = new Set();
	let spamFilter;
	let ignoredUsers = new Set();
	let showEmojiPicker = false;
	let reactionEmojis = [];
	let showHelp = false;
	let showReportModal = false;
	let selectedMessage = null;
	let reportReason = '';

	// 번역 설정
	let autoTranslate = false;
	let userLanguage = 'ko';

	onMount(async () => {
		if (!browser) return;

		spamFilter = new SpamFilter(5, 10000);
		reactionEmojis = getReactionEmojis();

		// 언어 감지
		if (navigator.language) {
			userLanguage = navigator.language.split('-')[0];
		}

		// Socket.IO 연결
		socket = io({
			path: '/socket.io',
			transports: ['websocket', 'polling']
		});

		// 연결됨
		socket.on('connect', () => {
			isConnected = true;
			console.log('Connected to chat server');

			// 세션으로 인증
			const sessionId = getCookie('session');
			if (sessionId) {
				socket.emit('authenticate', sessionId);
			}
		});

		// 인증 결과
		socket.on('authenticated', (data) => {
			if (data.success) {
				isAuthenticated = true;
				currentUser = data.user;
				socket.emit('join-room', { room });
			} else {
				console.error('Authentication failed:', data.error);
				isAuthenticated = false;
			}
		});

		// 새 메시지 수신
		socket.on('new-message', (data) => {
			if (!ignoredUsers.has(data.userId)) {
				messages = [...messages, data];
				scrollToBottom();
			}
		});

		// 반응 추가
		socket.on('reaction-added', (data) => {
			messages = messages.map((msg) => {
				if (msg.id === data.messageId) {
					return {
						...msg,
						reactions: msg.reactions || []
					};
				}
				return msg;
			});
		});

		// 방 사용자 수
		socket.on('room-users', (data) => {
			// 사용자 수 표시
		});

		// 입력 중 상태
		socket.on('user-typing', (data) => {
			if (data.isTyping) {
				typingUsers.add(data.username);
			} else {
				typingUsers.delete(data.username);
			}
		});

		// 에러
		socket.on('error', (data) => {
			console.error('Socket error:', data.message);
		});

		// 연결 해제
		socket.on('disconnect', () => {
			isConnected = false;
			console.log('Disconnected from chat server');
		});
	});

	onDestroy(() => {
		if (socket) {
			socket.emit('leave-room', { room });
			socket.disconnect();
		}
	});

	// 메시지 전송
	function sendMessage() {
		if (!isAuthenticated || !socket || !messageInput.trim()) return;

		const message = messageInput.trim();

		// 명령어 처리
		if (message.startsWith('/')) {
			const commandResult = processCommand(message);
			if (commandResult) {
				if (commandResult.action === 'clear') {
					messages = [];
				} else if (commandResult.action === 'ignore') {
					ignoredUsers.add(commandResult.username);
					messages = [
						...messages,
						{
							id: generateMessageId(),
							system: true,
							message: `${commandResult.username}님을 무시했습니다.`
						}
					];
				} else if (commandResult.action === 'unignore') {
					ignoredUsers.delete(commandResult.username);
					messages = [
						...messages,
						{
							id: generateMessageId(),
							system: true,
							message: `${commandResult.username}님의 무시를 해제했습니다.`
						}
					];
				} else if (commandResult.error) {
					messages = [
						...messages,
						{
							id: generateMessageId(),
							system: true,
							message: commandResult.error
						}
					];
				}
			}
			messageInput = '';
			return;
		}

		// 메시지 길이 검증
		const lengthValidation = validateMessageLength(message);
		if (!lengthValidation.valid) {
			alert(lengthValidation.error);
			return;
		}

		// 욕설 필터링
		const filteredMessage = filterProfanity(message);

		// 스팸 체크
		const spamCheck = spamFilter.canSend();
		if (!spamCheck.allowed) {
			alert(spamCheck.error);
			return;
		}

		const messageId = generateMessageId();
		const detectedLang = detectLanguage(message);

		// 메시지 전송
		socket.emit('send-message', {
			room,
			message: filteredMessage,
			originalMessage: autoTranslate ? message : null,
			language: detectedLang,
			messageId,
			username: currentUser.username,
			avatar: currentUser.avatar
		});

		messageInput = '';
	}

	// 반응 추가
	function addReaction(messageId, emoji) {
		if (!socket || !isAuthenticated) return;

		socket.emit('add-reaction', {
			room,
			messageId,
			emoji,
			userId: currentUser.id
		});

		showEmojiPicker = false;
	}

	// 입력 중 상태 전송
	let typingTimeout;
	function handleTyping() {
		if (!socket || !isAuthenticated) return;

		if (!isTyping) {
			isTyping = true;
			socket.emit('typing-start', {
				room,
				username: currentUser.username
			});
		}

		clearTimeout(typingTimeout);
		typingTimeout = setTimeout(() => {
			isTyping = false;
			socket.emit('typing-stop', {
				room,
				username: currentUser.username
			});
		}, 1000);
	}

	// 스크롤 하단으로
	function scrollToBottom() {
		setTimeout(() => {
			const container = document.getElementById('chat-messages');
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		}, 100);
	}

	// 쿠키 가져오기
	function getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop().split(';').shift();
	}

	// 채팅 지우기
	function clearChat() {
		messages = [];
	}

	// 도움말 토글
	function toggleHelp() {
		showHelp = !showHelp;
	}

	// 신고 모달 열기
	function openReportModal(message) {
		selectedMessage = message;
		showReportModal = true;
		reportReason = '';
	}

	// 신고 모달 닫기
	function closeReportModal() {
		showReportModal = false;
		selectedMessage = null;
		reportReason = '';
	}

	// 메시지 신고
	async function submitReport() {
		if (!selectedMessage || !reportReason) {
			alert('신고 사유를 선택해주세요.');
			return;
		}

		try {
			const response = await fetch('/api/chat/report', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messageId: selectedMessage.id,
					reportedUserId: selectedMessage.userId,
					reason: reportReason
				})
			});

			const data = await response.json();

			if (data.success) {
				alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
				closeReportModal();
			} else {
				alert(data.error || '신고 접수에 실패했습니다.');
			}
		} catch (error) {
			console.error('Report error:', error);
			alert('신고 접수 중 오류가 발생했습니다.');
		}
	}

	// 시간 포맷팅
	function formatTime(timestamp) {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('ko-KR', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$: typingIndicator = typingUsers.size > 0
		? Array.from(typingUsers).join(', ') + ' 입력 중...'
		: '';
</script>

<div
	class="chat-container {position} {theme}"
	class:floating={position === 'floating'}
	style="max-height: {maxHeight}"
>
	<!-- 채팅 헤더 -->
	<div class="chat-header">
		<div class="header-left">
			<span class="room-name">{room === 'global' ? '전체 채팅' : room}</span>
			{#if isConnected}
				<span class="status online">●</span>
			{:else}
				<span class="status offline">●</span>
			{/if}
		</div>
		<div class="header-right">
			<button on:click={toggleHelp} class="icon-btn" title="도움말">?</button>
			<button on:click={clearChat} class="icon-btn" title="채팅 지우기">🗑️</button>
		</div>
	</div>

	<!-- 도움말 패널 -->
	{#if showHelp}
		<div class="help-panel">
			<pre>{getHelpText()}</pre>
		</div>
	{/if}

	<!-- 메시지 영역 -->
	<div class="chat-messages" id="chat-messages">
		{#if !isAuthenticated}
			<div class="auth-message">
				<p>채팅을 이용하려면 로그인해주세요.</p>
			</div>
		{:else}
			{#each messages as message}
				{#if message.system}
					<div class="message system">
						<span class="system-text">{message.message}</span>
					</div>
				{:else}
					<div class="message {message.userId === currentUser?.id ? 'own' : 'other'}">
						<div class="message-avatar">
							{#if message.avatar}
								<img src={message.avatar} alt={message.username} />
							{:else}
								<div class="default-avatar">{message.username[0].toUpperCase()}</div>
							{/if}
						</div>
						<div class="message-content">
							<div class="message-header">
								<span class="username">{message.username}</span>
								<span class="timestamp">{formatTime(message.timestamp)}</span>
							</div>
							<div class="message-text">
								{@html formatMessage(message.message)}
							</div>
							{#if message.originalMessage && autoTranslate}
								<div class="original-message">
									<span class="translation-label">원문:</span> {message.originalMessage}
								</div>
							{/if}
							<!-- 반응 영역 -->
							<div class="reactions">
								{#if message.reactions}
									{#each message.reactions as reaction}
										<span class="reaction">{reaction.emoji}</span>
									{/each}
								{/if}
							</div>
						</div>
						<div class="message-actions">
							<button
								on:click={() => (showEmojiPicker = message.id)}
								class="reaction-btn"
								title="반응 추가"
							>
								😊
							</button>
							{#if message.userId !== currentUser?.id}
								<button
									on:click={() => openReportModal(message)}
									class="reaction-btn report-btn"
									title="신고"
								>
									🚨
								</button>
							{/if}
							{#if showEmojiPicker === message.id}
								<div class="emoji-picker">
									{#each reactionEmojis as emoji}
										<button
											on:click={() => addReaction(message.id, emoji.emoji)}
											class="emoji-btn"
										>
											{emoji.emoji}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<!-- 입력 중 표시 -->
	{#if typingIndicator}
		<div class="typing-indicator">{typingIndicator}</div>
	{/if}

	<!-- 입력 영역 -->
	{#if isAuthenticated}
		<div class="chat-input">
			<label class="translate-toggle">
				<input type="checkbox" bind:checked={autoTranslate} />
				<span>자동 번역</span>
			</label>
			<form on:submit|preventDefault={sendMessage}>
				<input
					type="text"
					bind:value={messageInput}
					on:input={handleTyping}
					placeholder="메시지를 입력하세요..."
					disabled={!isConnected}
				/>
				<button type="submit" class="send-btn" disabled={!messageInput.trim() || !isConnected}>
					전송
				</button>
			</form>
		</div>
	{/if}
</div>

<!-- 신고 모달 -->
{#if showReportModal}
	<div class="modal-overlay" on:click={closeReportModal}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3>🚨 메시지 신고</h3>
				<button on:click={closeReportModal} class="close-modal-btn">×</button>
			</div>
			<div class="modal-body">
				{#if selectedMessage}
					<div class="reported-message">
						<div class="reported-header">
							<strong>{selectedMessage.username}</strong>
							<span class="reported-time">{formatTime(selectedMessage.timestamp)}</span>
						</div>
						<div class="reported-text">{selectedMessage.message}</div>
					</div>
				{/if}

				<div class="report-reasons">
					<h4>신고 사유를 선택하세요:</h4>
					<label class="radio-option">
						<input type="radio" bind:group={reportReason} value="profanity" />
						<span>욕설/비속어</span>
					</label>
					<label class="radio-option">
						<input type="radio" bind:group={reportReason} value="spam" />
						<span>스팸/도배</span>
					</label>
					<label class="radio-option">
						<input type="radio" bind:group={reportReason} value="harassment" />
						<span>괴롭힘/희롱</span>
					</label>
					<label class="radio-option">
						<input type="radio" bind:group={reportReason} value="inappropriate" />
						<span>부적절한 콘텐츠</span>
					</label>
					<label class="radio-option">
						<input type="radio" bind:group={reportReason} value="other" />
						<span>기타</span>
					</label>
				</div>
			</div>
			<div class="modal-footer">
				<button on:click={closeReportModal} class="btn-cancel">취소</button>
				<button on:click={submitReport} class="btn-submit" disabled={!reportReason}>
					신고하기
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.chat-container.left {
		border-top-left-radius: 0;
	}

	.chat-container.right {
		border-top-right-radius: 0;
	}

	.chat-container.floating {
		position: fixed;
		bottom: 20px;
		right: 20px;
		width: 400px;
		max-height: 600px !important;
		z-index: 1000;
	}

	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 20px;
		background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
		border-bottom: 1px solid #eee;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.room-name {
		font-weight: 600;
		color: #333;
	}

	.status {
		font-size: 12px;
	}

	.status.online {
		color: #4ade80;
	}

	.status.offline {
		color: #ef4444;
	}

	.header-right {
		display: flex;
		gap: 8px;
	}

	.icon-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.3);
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}

	.icon-btn:hover {
		background: rgba(255, 255, 255, 0.5);
		transform: scale(1.1);
	}

	.help-panel {
		padding: 16px;
		background: #f8f9fa;
		border-bottom: 1px solid #eee;
	}

	.help-panel pre {
		margin: 0;
		font-size: 13px;
		line-height: 1.6;
		color: #666;
		white-space: pre-wrap;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		background: #fafafa;
	}

	.auth-message {
		text-align: center;
		padding: 40px 20px;
		color: #666;
	}

	.message {
		display: flex;
		gap: 10px;
		max-width: 80%;
	}

	.message.own {
		flex-direction: row-reverse;
		margin-left: auto;
	}

	.message.system {
		justify-content: center;
		max-width: 100%;
	}

	.system-text {
		padding: 8px 16px;
		background: #e0e7ff;
		color: #4338ca;
		border-radius: 12px;
		font-size: 13px;
		font-weight: 500;
	}

	.message-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
	}

	.message-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.default-avatar {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-weight: 600;
	}

	.message-content {
		flex: 1;
	}

	.message-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.message.own .message-header {
		flex-direction: row-reverse;
	}

	.username {
		font-size: 13px;
		font-weight: 600;
		color: #333;
	}

	.timestamp {
		font-size: 11px;
		color: #999;
	}

	.message-text {
		padding: 10px 14px;
		border-radius: 12px;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		word-wrap: break-word;
		line-height: 1.4;
	}

	.message.own .message-text {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.message.own .message-text :global(a) {
		color: white;
		text-decoration: underline;
	}

	.message.own .message-text :global(.mention) {
		background: rgba(255, 255, 255, 0.3);
		padding: 2px 6px;
		border-radius: 4px;
	}

	.original-message {
		margin-top: 6px;
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		font-size: 12px;
	}

	.translation-label {
		font-weight: 600;
		color: #666;
	}

	.message.own .original-message {
		background: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.9);
	}

	.message.own .translation-label {
		color: rgba(255, 255, 255, 0.9);
	}

	.reactions {
		display: flex;
		gap: 4px;
		margin-top: 6px;
	}

	.reaction {
		padding: 4px 8px;
		background: #f0f0f0;
		border-radius: 12px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reaction:hover {
		transform: scale(1.1);
	}

	.message-actions {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.reaction-btn {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 14px;
		opacity: 0;
		transition: opacity 0.2s;
	}

	.message:hover .reaction-btn {
		opacity: 1;
	}

	.emoji-picker {
		position: absolute;
		bottom: 100%;
		right: 0;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 4px;
		padding: 8px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		z-index: 10;
	}

	.emoji-btn {
		width: 32px;
		height: 32px;
		border: none;
		background: transparent;
		font-size: 18px;
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.emoji-btn:hover {
		background: #f0f0f0;
		transform: scale(1.2);
	}

	.typing-indicator {
		padding: 8px 16px;
		font-size: 12px;
		color: #666;
		font-style: italic;
		background: #f8f9fa;
	}

	.chat-input {
		padding: 12px 16px;
		background: white;
		border-top: 1px solid #eee;
	}

	.translate-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 8px;
		font-size: 12px;
		color: #666;
		cursor: pointer;
	}

	.chat-input form {
		display: flex;
		gap: 8px;
	}

	.chat-input input {
		flex: 1;
		padding: 10px 14px;
		border: 1px solid #ddd;
		border-radius: 20px;
		outline: none;
		transition: border-color 0.2s;
	}

	.chat-input input:focus {
		border-color: #667eea;
	}

	.chat-input input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.send-btn {
		padding: 10px 20px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 20px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.send-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.send-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* 신고 버튼 */
	.report-btn {
		color: #ef4444 !important;
	}

	.report-btn:hover {
		background: #fee2e2 !important;
	}

	/* 신고 모달 */
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
		z-index: 2000;
		backdrop-filter: blur(4px);
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		animation: modalSlideIn 0.3s ease-out;
	}

	@keyframes modalSlideIn {
		from {
			opacity: 0;
			transform: scale(0.9) translateY(-20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #eee;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
		color: #333;
	}

	.close-modal-btn {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		background: #f5f5f5;
		font-size: 20px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.close-modal-btn:hover {
		background: #e5e5e5;
		transform: scale(1.1);
	}

	.modal-body {
		padding: 24px;
	}

	.reported-message {
		padding: 16px;
		background: #fef3c7;
		border-radius: 12px;
		margin-bottom: 24px;
	}

	.reported-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		font-size: 14px;
	}

	.reported-time {
		color: #666;
		font-size: 12px;
	}

	.reported-text {
		color: #333;
		line-height: 1.5;
		word-wrap: break-word;
	}

	.report-reasons h4 {
		margin: 0 0 16px;
		font-size: 1rem;
		color: #333;
	}

	.radio-option {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		margin-bottom: 8px;
		border: 2px solid #e5e7eb;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.radio-option:hover {
		border-color: #667eea;
		background: #f8f9fa;
	}

	.radio-option input[type='radio'] {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.radio-option input[type='radio']:checked + span {
		color: #667eea;
		font-weight: 600;
	}

	.radio-option:has(input:checked) {
		border-color: #667eea;
		background: #f0f4ff;
	}

	.modal-footer {
		display: flex;
		gap: 12px;
		padding: 20px 24px;
		border-top: 1px solid #eee;
	}

	.btn-cancel {
		flex: 1;
		padding: 12px 24px;
		border: 2px solid #ddd;
		background: white;
		color: #666;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-cancel:hover {
		background: #f5f5f5;
		border-color: #ccc;
	}

	.btn-submit {
		flex: 1;
		padding: 12px 24px;
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
		border: none;
		border-radius: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-submit:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
