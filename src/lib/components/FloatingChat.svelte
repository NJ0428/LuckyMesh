<script>
	import ChatSystem from './ChatSystem.svelte';
	import { onMount } from 'svelte';

	export let room = 'global';
	export let gameType = null;

	let isOpen = false;
	let unreadCount = 0;

	// 게임 타입에 따라 방 변경
	$: if (gameType) {
		room = gameType;
	}

	function toggleChat() {
		isOpen = !isOpen;
		if (isOpen) {
			unreadCount = 0;
		}
	}
</script>

<div class="floating-chat">
	{#if isOpen}
		<div class="chat-window">
			<button on:click={toggleChat} class="close-btn">×</button>
			<ChatSystem {room} position="floating" maxHeight="400px" />
		</div>
	{/if}

	<button
		on:click={toggleChat}
		class="chat-toggle-btn"
		class:with-badge={unreadCount > 0}
		title="채팅"
	>
		💬
		{#if unreadCount > 0}
			<span class="badge">{unreadCount}</span>
		{/if}
	</button>
</div>

<style>
	.floating-chat {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 1000;
	}

	.chat-window {
		position: absolute;
		bottom: 60px;
		right: 0;
		width: 380px;
		max-width: calc(100vw - 48px);
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		animation: slideUp 0.3s ease-out;
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

	.close-btn {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: none;
		background: rgba(0, 0, 0, 0.1);
		font-size: 20px;
		cursor: pointer;
		z-index: 10;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: rgba(0, 0, 0, 0.2);
		transform: scale(1.1);
	}

	.chat-toggle-btn {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		font-size: 24px;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
		transition: all 0.3s;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.chat-toggle-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
	}

	.chat-toggle-btn.with-badge {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
		}
		50% {
			box-shadow: 0 4px 20px rgba(102, 126, 234, 0.8);
		}
	}

	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		background: #ef4444;
		color: white;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid white;
	}

	@media (max-width: 480px) {
		.chat-window {
			width: calc(100vw - 32px);
			right: -16px;
			bottom: 64px;
		}

		.chat-toggle-btn {
			width: 48px;
			height: 48px;
			font-size: 20px;
		}
	}
</style>
