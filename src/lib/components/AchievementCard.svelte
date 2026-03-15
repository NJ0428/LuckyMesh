<script>
	import { createEventDispatcher } from 'svelte';
	import PastelCard from './PastelCard.svelte';

	export let achievement;
	export let progress = 0;
	export let completed = false;
	export let claimed = false;
	export let locked = false;

	const dispatch = createEventDispatcher();

	function getTierColor(tier) {
		const colors = {
			bronze: 'from-amber-600 to-amber-800',
			silver: 'from-gray-300 to-gray-500',
			gold: 'from-yellow-400 to-yellow-600',
			diamond: 'from-cyan-400 to-blue-600'
		};
		return colors[tier] || 'from-gray-400 to-gray-600';
	}

	function getTierBgColor(tier) {
		const colors = {
			bronze: 'bg-amber-900/30',
			silver: 'bg-gray-400/30',
			gold: 'bg-yellow-500/30',
			diamond: 'bg-cyan-500/30'
		};
		return colors[tier] || 'bg-gray-500/30';
	}

	function getTierTextColor(tier) {
		const colors = {
			bronze: 'text-amber-400',
			silver: 'text-gray-300',
			gold: 'text-yellow-400',
			diamond: 'text-cyan-400'
		};
		return colors[tier] || 'text-gray-400';
	}

	function claimReward() {
		dispatch('claim');
	}
</script>

<PastelCard
	class="achievement-card {completed ? 'completed' : ''} {locked ? 'locked' : ''}"
	variant={completed ? 'success' : 'default'}
>
	<div class="achievement-content">
		<div class="achievement-header">
			<div class="achievement-icon" class:locked={locked}>{achievement.icon}</div>
			<div class="achievement-info">
				<h3 class="achievement-title">{achievement.title}</h3>
				<div class="achievement-meta">
					<span class="achievement-tier {getTierTextColor(achievement.tier)}">
						{achievement.tier.toUpperCase()}
					</span>
					<span class="achievement-category">{achievement.category}</span>
				</div>
			</div>
		</div>

		<p class="achievement-description">{achievement.description}</p>

		{#if !locked}
			<div class="achievement-progress">
				<div class="progress-bar-container">
					<div
						class="progress-bar {getTierBgColor(achievement.tier)}"
						style="width: {Math.min(progress, 100)}%"
					></div>
				</div>
				<div class="progress-text">
					{completed ? '완료!' : `${progress.toFixed(0)}%`}
				</div>
			</div>

			{#if completed && !claimed}
				<div class="achievement-reward">
					<span class="reward-amount">+{achievement.reward_amount.toLocaleString()}칩</span>
					<button class="claim-button" on:click={claimReward}>수령</button>
				</div>
			{:else if claimed}
				<div class="achievement-reward claimed">
					<span class="reward-status">보상 수령 완료</span>
				</div>
			{/if}
		{:else}
			<div class="achievement-locked">
				<span class="lock-icon">🔒</span>
				<span>잠김</span>
			</div>
		{/if}
	</div>
</PastelCard>

<style>
	.achievement-card {
		transition: all 0.3s ease;
	}

	.achievement-card:hover {
		transform: translateY(-2px);
	}

	.achievement-card.locked {
		opacity: 0.6;
		filter: grayscale(50%);
	}

	.achievement-card.locked:hover {
		transform: none;
	}

	.achievement-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.achievement-header {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.achievement-icon {
		font-size: 3rem;
		line-height: 1;
		transition: all 0.3s ease;
	}

	.achievement-icon.locked {
		filter: grayscale(100%);
		opacity: 0.5;
	}

	.achievement-info {
		flex: 1;
	}

	.achievement-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		margin: 0;
	}

	.achievement-meta {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.achievement-tier {
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.achievement-category {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		text-transform: capitalize;
	}

	.achievement-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		line-height: 1.4;
	}

	.achievement-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.progress-bar-container {
		flex: 1;
		height: 8px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		border-radius: 4px;
		transition: width 0.5s ease;
	}

	.progress-text {
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
		min-width: 3rem;
		text-align: right;
	}

	.achievement-reward {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: rgba(255, 215, 0, 0.1);
		border: 1px solid rgba(255, 215, 0, 0.3);
		border-radius: 8px;
	}

	.achievement-reward.claimed {
		background: rgba(0, 255, 0, 0.1);
		border-color: rgba(0, 255, 0, 0.3);
	}

	.reward-amount {
		font-size: 1rem;
		font-weight: 700;
		color: #ffd700;
	}

	.reward-status {
		font-size: 0.875rem;
		color: #00ff00;
		font-weight: 600;
	}

	.claim-button {
		padding: 0.5rem 1.5rem;
		background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
		border: none;
		border-radius: 6px;
		color: #000;
		font-weight: 700;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.claim-button:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
	}

	.achievement-locked {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: center;
		padding: 0.5rem;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.875rem;
	}

	.lock-icon {
		font-size: 1.25rem;
	}
</style>
