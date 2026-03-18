<script>
	import { onMount } from 'svelte';
	import ChallengeCard from '$lib/components/ChallengeCard.svelte';

	let weeklyChallenges = [];
	let monthlyChallenges = [];
	let loading = true;
	let activeTab = 'weekly';
	let enrolling = false;
	let claiming = false;

	onMount(async () => {
		await fetchChallenges();
	});

	async function fetchChallenges() {
		try {
			const [weeklyResponse, monthlyResponse] = await Promise.all([
				fetch('/api/challenges?type=weekly&includeUserProgress=true'),
				fetch('/api/challenges?type=monthly&includeUserProgress=true')
			]);

			const weeklyData = await weeklyResponse.json();
			const monthlyData = await monthlyResponse.json();

			if (weeklyData.success) {
				weeklyChallenges = weeklyData.data.challenges;
			}

			if (monthlyData.success) {
				monthlyChallenges = monthlyData.data.challenges;
			}
		} catch (error) {
			console.error('Error fetching challenges:', error);
		} finally {
			loading = false;
		}
	}

	async function handleEnroll(challengeId) {
		if (enrolling) return;

		enrolling = true;
		try {
			const response = await fetch('/api/challenges/enroll', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ challengeId })
			});

			const data = await response.json();

			if (data.success) {
				alert(data.message);
				await fetchChallenges(); // Refresh to update UI
			} else {
				alert(data.error || '챌린지 참여에 실패했습니다.');
			}
		} catch (error) {
			console.error('Error enrolling in challenge:', error);
			alert('오류가 발생했습니다.');
		} finally {
			enrolling = false;
		}
	}

	async function handleClaim(userChallengeId) {
		if (claiming) return;

		claiming = true;
		try {
			const response = await fetch('/api/challenges/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ challengeId: userChallengeId })
			});

			const data = await response.json();

			if (data.success) {
				alert(data.message);
				await fetchChallenges(); // Refresh to update UI
			} else {
				alert(data.error || '보상 수령에 실패했습니다.');
			}
		} catch (error) {
			console.error('Error claiming challenge:', error);
			alert('오류가 발생했습니다.');
		} finally {
			claiming = false;
		}
	}

	$: activeChallenges = activeTab === 'weekly' ? weeklyChallenges : monthlyChallenges;
</script>

<svelte:head>
	<title>챌린지 - LuckyMesh Casino</title>
</svelte:head>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
	<div class="max-w-4xl mx-auto">
		<div class="mb-6">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">🏆 챌린지</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-2">
				주간/월간 챌린지에 참여하고 특별 보상을 받으세요!
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
			<!-- Tab Buttons -->
			<div class="flex space-x-4 mb-6">
				<button
					on:click={() => (activeTab = 'weekly')}
					class="px-6 py-3 rounded-lg font-semibold transition-colors {activeTab === 'weekly'
						? 'bg-purple-500 text-white'
						: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
				>
					주간 챌린지
				</button>
				<button
					on:click={() => (activeTab = 'monthly')}
					class="px-6 py-3 rounded-lg font-semibold transition-colors {activeTab === 'monthly'
						? 'bg-purple-500 text-white'
						: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
				>
					월간 챌린지
				</button>
			</div>

			<!-- Challenges List -->
			<div class="space-y-4">
				{#if activeChallenges.length === 0}
					<div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
						<p class="text-gray-600 dark:text-gray-400">
							현재 활성화된 {activeTab === 'weekly' ? '주간' : '월간'} 챌린지가 없습니다.
						</p>
					</div>
				{:else}
					{#each activeChallenges as challenge (challenge.id)}
						<ChallengeCard
							{challenge}
							onEnroll={handleEnroll}
							onClaim={handleClaim}
						/>
					{/each}
				{/if}
			</div>

			<!-- Challenges Info -->
			<div class="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
				<h3 class="font-semibold text-purple-800 dark:text-purple-300 mb-2">💡 챌린지 안내</h3>
				<ul class="text-sm text-purple-700 dark:text-purple-400 space-y-1">
					<li>• 주간 챌린지는 매주 월요일에 초기화됩니다.</li>
					<li>• 월간 챌린지는 매월 1일에 초기화됩니다.</li>
					<li>• 챌린지에 참여하면 기간 내에 진행률이 축적됩니다.</li>
					<li>• 챌린지 완료 시 특별 보상과 추가 혜택을 받을 수 있습니다.</li>
					<li>• 마일스톤(25%, 50%, 75%)을 달성할 때마다 진행 상황을 확인할 수 있습니다.</li>
				</ul>
			</div>
		{/if}
	</div>
</div>
