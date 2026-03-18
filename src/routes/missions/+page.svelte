<script>
	import { onMount } from 'svelte';
	import MissionCard from '$lib/components/MissionCard.svelte';
	import StreakDisplay from '$lib/components/StreakDisplay.svelte';

	let missions = [];
	let streak = null;
	let loading = true;
	let claiming = false;

	onMount(async () => {
		await fetchMissions();
	});

	async function fetchMissions() {
		try {
			const response = await fetch('/api/missions');
			const data = await response.json();

			if (data.success) {
				missions = data.data.missions;
				streak = data.data.streak;
			}
		} catch (error) {
			console.error('Error fetching missions:', error);
		} finally {
			loading = false;
		}
	}

	async function handleClaimMission(missionId) {
		if (claiming) return;

		claiming = true;
		try {
			const response = await fetch('/api/missions/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ missionId })
			});

			const data = await response.json();

			if (data.success) {
				alert(data.message);
				await fetchMissions(); // Refresh to update UI
			} else {
				alert(data.error || '보상 수령에 실패했습니다.');
			}
		} catch (error) {
			console.error('Error claiming mission:', error);
			alert('오류가 발생했습니다.');
		} finally {
			claiming = false;
		}
	}
</script>

<svelte:head>
	<title>일일 미션 - LuckyMesh Casino</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<div class="mb-6">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">📋 일일 미션</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-2">
				매일 새로운 미션을 완료하고 보상을 받으세요!
			</p>
		</div>

		{#if loading}
			<div class="text-center py-12">
				<div
					class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
					role="status"
				>
					<span
						class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
						>Loading...</span
					>
				</div>
			</div>
		{:else}
			<!-- Streak Display -->
			{#if streak}
				<div class="mb-6">
					<StreakDisplay {streak} />
				</div>
			{/if}

			<!-- Missions List -->
			<div class="space-y-4">
				{#if missions.length === 0}
					<div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
						<p class="text-gray-600 dark:text-gray-400">
							오늘의 미션을 불러오는 중입니다...
						</p>
					</div>
				{:else}
					{#each missions as mission (mission.id)}
						<MissionCard {mission} onClaim={handleClaimMission} />
					{/each}
				{/if}
			</div>

			<!-- Missions Info -->
			<div class="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
				<h3 class="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 미션 안내</h3>
				<ul class="text-sm text-blue-700 dark:text-blue-400 space-y-1">
					<li>• 매일 자정에 새로운 미션이 생성됩니다.</li>
					<li>• 미션 난이도에 따라 보상이 다릅니다.</li>
					<li>• 연속으로 미션을 완료하면 스트릭 보너스를 받을 수 있습니다.</li>
					<li>• 완료한 미션의 보상은 자정 이전에 수령해야 합니다.</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
