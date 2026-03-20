<script>
	import ChatSystem from '$lib/components/ChatSystem.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import { onMount } from 'svelte';

	let currentRoom = 'global';
	let isMobile = false;

	onMount(() => {
		// 모바일 감지
		isMobile = window.innerWidth < 768;
	});
</script>

<svelte:head>
	<title>채팅 - LuckyMesh Casino</title>
	<meta name="description" content="실시간 채팅으로 다른 플레이어들과 소통하세요" />
</svelte:head>

<div class="chat-page">
	<Navigation />

	<main class="main-content">
		<div class="page-header">
			<h1>💬 실시간 채팅</h1>
			<p>다른 플레이어들과 소통하고 게임 팁을 공유하세요!</p>
		</div>

		<div class="chat-layout">
			<!-- 방 선택 -->
			<div class="room-selector">
				<h3>채팅방</h3>
				<div class="rooms">
					<button
						class="room-btn {currentRoom === 'global' ? 'active' : ''}"
						on:click={() => (currentRoom = 'global')}
					>
						<span class="room-icon">🌍</span>
						<span class="room-name">전체 채팅</span>
						<span class="room-desc">모든 유저와 소통</span>
					</button>

					<button
						class="room-btn {currentRoom === 'korean' ? 'active' : ''}"
						on:click={() => (currentRoom = 'korean')}
					>
						<span class="room-icon">🇰🇷</span>
						<span class="room-name">한국어</span>
						<span class="room-desc">한국 유저 전용</span>
					</button>

					<button
						class="room-btn {currentRoom === 'english' ? 'active' : ''}"
						on:click={() => (currentRoom = 'english')}
					>
						<span class="room-icon">🇺🇸</span>
						<span class="room-name">English</span>
						<span class="room-desc">English Chat</span>
					</button>

					<button
						class="room-btn {currentRoom === 'blackjack' ? 'active' : ''}"
						on:click={() => (currentRoom = 'blackjack')}
					>
						<span class="room-icon">🃏</span>
						<span class="room-name">블랙잭</span>
						<span class="room-desc">블랙잭 전략 토론</span>
					</button>

					<button
						class="room-btn {currentRoom === 'poker' ? 'active' : ''}"
						on:click={() => (currentRoom = 'poker')}
					>
						<span class="room-icon">♠️</span>
						<span class="room-name">포커</span>
						<span class="room-desc">포커 전략 토론</span>
					</button>

					<button
						class="room-btn {currentRoom === 'roulette' ? 'active' : ''}"
						on:click={() => (currentRoom = 'roulette')}
					>
						<span class="room-icon">🎰</span>
						<span class="room-name">룰렛</span>
						<span class="room-desc">룰렛 전략 토론</span>
					</button>

					<button
						class="room-btn {currentRoom === 'vip' ? 'active' : ''}"
						on:click={() => (currentRoom = 'vip')}
					>
						<span class="room-icon">👑</span>
						<span class="room-name">VIP</span>
						<span class="room-desc">VIP 회원 전용</span>
					</button>
				</div>
			</div>

			<!-- 채팅 영역 -->
			<div class="chat-area">
				<ChatSystem room={currentRoom} position="default" />
			</div>
		</div>

		<!-- 채팅 가이드 -->
		<div class="chat-guide">
			<h3>📋 채팅 가이드</h3>
			<div class="guide-content">
				<div class="guide-item">
					<span class="guide-icon">🎯</span>
					<div class="guide-text">
						<h4>욕설 필터링</h4>
						<p>부적절한 언어는 자동으로 필터링됩니다.</p>
					</div>
				</div>
				<div class="guide-item">
					<span class="guide-icon">🌐</span>
					<div class="guide-text">
						<h4>다국어 지원</h4>
						<p>자동 번역 기능으로 다양한 언어의 사용자와 소통하세요.</p>
					</div>
				</div>
				<div class="guide-item">
					<span class="guide-icon">😊</span>
					<div class="guide-text">
						<h4>이모지 반응</h4>
						<p>메시지에 이모지로 반응을 남기세요.</p>
					</div>
				</div>
				<div class="guide-item">
					<span class="guide-icon">🚫</span>
					<div class="guide-text">
						<h4>사용자 차단</h4>
						<p>/ignore @username 명령어로 특정 사용자를 차단할 수 있습니다.</p>
					</div>
				</div>
				<div class="guide-item">
					<span class="guide-icon">⚡</span>
					<div class="guide-text">
						<h4>스팸 방지</h4>
						<p>너무 빠른 메시지 전송은 제한됩니다.</p>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	:global(body) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.chat-page {
		min-height: 100vh;
	}

	.main-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 80px 20px 40px;
	}

	.page-header {
		text-align: center;
		margin-bottom: 40px;
		color: white;
	}

	.page-header h1 {
		font-size: 2.5rem;
		margin-bottom: 12px;
	}

	.page-header p {
		font-size: 1.1rem;
		opacity: 0.9;
	}

	.chat-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 24px;
		margin-bottom: 32px;
	}

	@media (max-width: 1024px) {
		.chat-layout {
			grid-template-columns: 1fr;
		}
	}

	.room-selector {
		background: white;
		border-radius: 20px;
		padding: 24px;
		height: fit-content;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.room-selector h3 {
		margin: 0 0 20px;
		color: #333;
		font-size: 1.2rem;
	}

	.rooms {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.room-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border: 2px solid transparent;
		border-radius: 12px;
		background: #f8f9fa;
		cursor: pointer;
		transition: all 0.3s;
		text-align: left;
	}

	.room-btn:hover {
		background: #e9ecef;
		transform: translateX(4px);
	}

	.room-btn.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-color: #667eea;
	}

	.room-icon {
		font-size: 24px;
	}

	.room-info {
		display: flex;
		flex-direction: column;
	}

	.room-name {
		font-weight: 600;
		margin-bottom: 2px;
	}

	.room-desc {
		font-size: 12px;
		opacity: 0.8;
	}

	.chat-area {
		min-height: 600px;
	}

	.chat-guide {
		background: white;
		border-radius: 20px;
		padding: 32px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.chat-guide h3 {
		margin: 0 0 24px;
		color: #333;
		font-size: 1.5rem;
	}

	.guide-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
	}

	.guide-item {
		display: flex;
		gap: 16px;
		padding: 20px;
		background: #f8f9fa;
		border-radius: 12px;
	}

	.guide-icon {
		font-size: 32px;
	}

	.guide-text h4 {
		margin: 0 0 8px;
		color: #333;
	}

	.guide-text p {
		margin: 0;
		color: #666;
		font-size: 14px;
		line-height: 1.5;
	}
</style>
