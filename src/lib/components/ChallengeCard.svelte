<script>
	export let challenge;
	export let onEnroll;
	export let onClaim;

	$: userProgress = challenge.user_progress;
	$: isEnrolled = userProgress !== null;
	$: progress = userProgress?.progress || 0;
	$: progressPercent = Math.min((progress / challenge.requirement_value) * 100, 100);
	$: isCompleted = userProgress?.completed_at !== null;
	$: canClaim = isCompleted && !userProgress?.reward_claimed;
	$: challengeType = challenge.challenge_type === 'weekly' ? '주간' : '월간';
	$: endDate = new Date(challenge.end_date).toLocaleDateString('ko-KR', {
		month: 'long',
		day: 'numeric'
	});
	$: categoryColor =
		challenge.category === 'winning'
			? 'bg-yellow-500'
			: challenge.category === 'betting'
				? 'bg-green-500'
				: 'bg-blue-500';
</script>

<div
	class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all hover:shadow-lg {canClaim
		? 'ring-2 ring-yellow-400'
		: ''}"
>
	<div class="flex items-start justify-between">
		<div class="flex items-center space-x-3">
			<span class="text-3xl">{challenge.icon}</span>
			<div>
				<div class="flex items-center space-x-2">
					<span
						class="px-2 py-1 text-xs font-semibold text-white rounded-full {categoryColor}"
					>
						{challengeType}
					</span>
					<h3 class="font-semibold text-gray-800 dark:text-white">{challenge.title}</h3>
				</div>
				<p class="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
				<p class="text-xs text-gray-500 mt-1">
					종료: {endDate}
				</p>
			</div>
		</div>
	</div>

	{#if isEnrolled}
		<!-- Progress Bar -->
		<div class="mt-4">
			<div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
				<span>진행률</span>
				<span>{progress.toLocaleString()} / {challenge.requirement_value.toLocaleString()}</span>
			</div>
			<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
				<div
					class="bg-purple-500 h-2 rounded-full transition-all duration-300"
					style="width: {progressPercent}%"
				></div>
			</div>
			<!-- Milestones -->
			<div class="flex justify-between mt-2 text-xs text-gray-500">
				<span>25%</span>
				<span>50%</span>
				<span>75%</span>
				<span>100%</span>
			</div>
		</div>

		<!-- Reward Info -->
		<div class="mt-3 flex items-center justify-between">
			<div class="flex items-center space-x-2 text-sm">
				<span class="text-gray-600 dark:text-gray-400">보상:</span>
				<span class="text-yellow-500 font-semibold">💰 {challenge.reward_chips.toLocaleString()} 칩</span>
				{#if challenge.reward_exp > 0}
					<span class="text-purple-500 font-semibold">⭐ +{challenge.reward_exp} EXP</span>
				{/if}
			</div>
			{#if canClaim}
				<button
					on:click={() => onClaim(userProgress.id)}
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
	{:else}
		<!-- Not Enrolled -->
		<div class="mt-4 flex items-center justify-between">
			<div class="flex items-center space-x-2 text-sm">
				<span class="text-gray-600 dark:text-gray-400">보상:</span>
				<span class="text-yellow-500 font-semibold">💰 {challenge.reward_chips.toLocaleString()} 칩</span>
				{#if challenge.reward_exp > 0}
					<span class="text-purple-500 font-semibold">⭐ +{challenge.reward_exp} EXP</span>
				{/if}
			</div>
			<button
				on:click={() => onEnroll(challenge.id)}
				class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
			>
				참여하기
			</button>
		</div>
	{/if}
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
