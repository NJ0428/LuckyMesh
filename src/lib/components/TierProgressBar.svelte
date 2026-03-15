<script>
	export let currentTier = 'bronze';
	export let progress = 0;
	export let showNext = true;

	const tiers = ['bronze', 'silver', 'gold', 'diamond'];

	function getTierInfo(tier) {
		const info = {
			bronze: { name: '브론즈', color: '#cd7f32', bgColor: 'from-amber-600 to-amber-800' },
			silver: { name: '실버', color: '#c0c0c0', bgColor: 'from-gray-300 to-gray-500' },
			gold: { name: '골드', color: '#ffd700', bgColor: 'from-yellow-400 to-yellow-600' },
			diamond: { name: '다이아몬드', color: '#00ffff', bgColor: 'from-cyan-400 to-blue-600' }
		};
		return info[tier];
	}

	$: currentTierIndex = tiers.indexOf(currentTier);
	$: currentTierInfo = getTierInfo(currentTier);
	$: nextTier = showNext && currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
	$: nextTierInfo = nextTier ? getTierInfo(nextTier) : null;
</script>

<div class="tier-progress-container">
	<div class="tier-icons">
		{#each tiers as tier, index}
			{@const isActive = tier === currentTier}
			{@const isPast = index < currentTierIndex}
			{@const isFuture = index > currentTierIndex}
			<div class="tier-icon" class:active={isActive} class:past={isPast} class:future={isFuture}>
				<div class="tier-circle">
					{#if isPast}
						<span class="tier-check">✓</span>
					{:else}
						<span class="tier-emoji">{getTierInfo(tier).emoji || '🏆'}</span>
					{/if}
				</div>
				<span class="tier-name">{getTierInfo(tier).name}</span>
			</div>
			{#if index < tiers.length - 1}
				<div class="tier-connector" class:completed={index < currentTierIndex}></div>
			{/if}
		{/each}
	</div>

	<div class="progress-section">
		<div class="progress-header">
			<span class="current-tier-label" style="color: {currentTierInfo.color}">
				{currentTierInfo.name} 등급
			</span>
			{#if nextTierInfo}
				<span class="next-tier-label">
					{nextTierInfo.name}까지 {progress.toFixed(0)}%
				</span>
			{/if}
		</div>

		<div class="progress-bar-container">
			<div
				class="progress-bar-fill"
				style="width: {Math.min(progress, 100)}%; background: linear-gradient(90deg, {currentTierInfo.color}, {nextTierInfo?.color || currentTierInfo.color})"
			></div>
		</div>
	</div>
</div>

<style>
	.tier-progress-container {
		padding: 1.5rem;
		background: rgba(20, 20, 40, 0.8);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.tier-icons {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.tier-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		position: relative;
		z-index: 1;
	}

	.tier-circle {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
		position: relative;
	}

	.tier-icon.active .tier-circle {
		background: rgba(255, 215, 0, 0.2);
		border-color: #ffd700;
		box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
		transform: scale(1.1);
	}

	.tier-icon.past .tier-circle {
		background: rgba(0, 255, 0, 0.2);
		border-color: #00ff00;
	}

	.tier-icon.future .tier-circle {
		opacity: 0.5;
	}

	.tier-check {
		font-size: 1.5rem;
		color: #00ff00;
		font-weight: bold;
	}

	.tier-emoji {
		font-size: 1.5rem;
	}

	.tier-name {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.tier-icon.active .tier-name {
		color: #ffd700;
		font-weight: 700;
	}

	.tier-connector {
		flex: 1;
		height: 2px;
		background: rgba(255, 255, 255, 0.2);
		margin: 0 0.5rem;
		position: relative;
		top: -1rem;
	}

	.tier-connector.completed {
		background: linear-gradient(90deg, #00ff00, #ffd700);
	}

	.progress-section {
		margin-top: 1rem;
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.current-tier-label {
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.next-tier-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
	}

	.progress-bar-container {
		width: 100%;
		height: 12px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		overflow: hidden;
		position: relative;
	}

	.progress-bar-fill {
		height: 100%;
		border-radius: 6px;
		transition: width 0.5s ease;
		position: relative;
	}

	.progress-bar-fill::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	@media (max-width: 640px) {
		.tier-circle {
			width: 40px;
			height: 40px;
		}

		.tier-check,
		.tier-emoji {
			font-size: 1.25rem;
		}

		.tier-name {
			font-size: 0.625rem;
		}

		.current-tier-label {
			font-size: 0.875rem;
		}

		.next-tier-label {
			font-size: 0.75rem;
		}
	}
</style>
