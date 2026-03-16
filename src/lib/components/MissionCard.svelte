<script>
	export let mission;
	export let onClaim;

	$: progress = mission.progress || 0;
	$: progressPercent = Math.min((progress / mission.requirement_value) * 100, 100);
	$: isCompleted = mission.completed_at !== null;
	$: canClaim = isCompleted && !mission.reward_claimed;
	$: difficultyColor =
		mission.difficulty === 'easy'
			? 'bg-green-500'
			: mission.difficulty === 'medium'
				? 'bg-yellow-500'
				: 'bg-red-500';
</script>

<div
	class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all hover:shadow-lg {canClaim
		? 'ring-2 ring-yellow-400'
		: ''}"
>
	<div class="flex items-start justify-between">
		<div class="flex items-center space-x-3">
			<span class="text-3xl">{mission.icon}</span>
			<div>
				<h3 class="font-semibold text-gray-800 dark:text-white">{mission.title}</h3>
				<p class="text-sm text-gray-600 dark:text-gray-400">{mission.description}</p>
			</div>
		</div>
		<span
			class="px-2 py-1 text-xs font-semibold text-white rounded-full {difficultyColor}"
		>
			{mission.difficulty === 'easy' ? '쉬움' : mission.difficulty === 'medium' ? '보통' : '어려움'}
		</span>
	</div>

	<!-- Progress Bar -->
	<div class="mt-4">
		<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
			<span>진행률</span>
			<span>{progress} / {mission.requirement_value}</span>
		</div>
		<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
			<div
				class="bg-blue-500 h-2 rounded-full transition-all duration-300"
				style="width: {progressPercent}%"
			></div>
		</div>
	</div>

	<!-- Reward Info -->
	<div class="mt-3 flex items-center justify-between">
		<div class="flex items-center space-x-2 text-sm">
			<span class="text-gray-600 dark:text-gray-400">보상:</span>
			<span class="text-yellow-500 font-semibold">💰 {mission.reward_chips.toLocaleString()} 칩</span>
		</div>
		{#if canClaim}
			<button
				on:click={() => onClaim(mission.id)}
				class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors animate-pulse"
			>
				보상 수령
			</button>
		{:else if isCompleted}
			<span class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-lg text-sm">
				✓ 완료됨
			</span>
		{/if}
	</div>
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
