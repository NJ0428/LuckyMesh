<script>
	export let streak;

	$: streakLabel = streak.bonus_tier?.label || '첫 번째 날';
	$: bonusPercent = streak.bonus_tier?.bonus_percent || 0;
	$: bonusChips = streak.bonus_tier?.bonus_chips || 0;
	$: nextBonus = getNextBonus(streak.current_streak);
</script>

<div
	class="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-6 text-white"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<div class="text-5xl">🔥</div>
			<div>
				<h2 class="text-2xl font-bold">연속 완료</h2>
				<p class="text-orange-100">
					{streak.current_streak}일 연속 미션 완료 중!
				</p>
			</div>
		</div>
		<div class="text-right">
			<div class="text-4xl font-bold">{streak.current_streak}</div>
			<div class="text-sm text-orange-100">일</div>
		</div>
	</div>

	<!-- Streak Stats -->
	<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
		<div class="bg-white/10 rounded-lg p-3">
			<div class="text-orange-100">최장 기록</div>
			<div class="text-xl font-bold">{streak.longest_streak}일</div>
		</div>
		<div class="bg-white/10 rounded-lg p-3">
			<div class="text-orange-100">총 완료일</div>
			<div class="text-xl font-bold">{streak.total_completed_days}일</div>
		</div>
	</div>

	<!-- Current Bonus -->
	<div class="mt-4 bg-white/10 rounded-lg p-3">
		<div class="flex items-center justify-between">
			<div>
				<div class="text-sm text-orange-100">현재 보너스 ({streakLabel})</div>
				<div class="text-lg font-semibold">
					{bonusPercent > 0 ? `+${bonusPercent}% 보너스` : '기본 보상'}
					{bonusChips > 0 ? ` + ${bonusChips.toLocaleString()} 칩` : ''}
				</div>
			</div>
			{#if nextBonus}
				<div class="text-right text-sm">
					<div class="text-orange-100">다음 보너스</div>
					<div class="font-semibold">{nextBonus.days}일: +{nextBonus.bonus_percent}%</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<script>
	function getNextBonus(currentStreak) {
		const bonusTiers = [
			{ days: 1, bonus_percent: 0, bonus_chips: 0, label: '첫 번째 날' },
			{ days: 2, bonus_percent: 10, bonus_chips: 100, label: '2일 연속' },
			{ days: 3, bonus_percent: 20, bonus_chips: 250, label: '3일 연속' },
			{ days: 7, bonus_percent: 50, bonus_chips: 1000, label: '일주일 완주!' },
			{ days: 14, bonus_percent: 100, bonus_chips: 2500, label: '2주 달성!' },
			{ days: 30, bonus_percent: 200, bonus_chips: 10000, label: '한 달 완주!' },
			{ days: 100, bonus_percent: 500, bonus_chips: 50000, label: '100일 달성!' }
		];

		for (const tier of bonusTiers) {
			if (currentStreak < tier.days) {
				return tier;
			}
		}
		return null;
	}
</script>
