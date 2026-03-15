<script>
	import { onMount } from 'svelte';
	import AchievementCard from '$lib/components/AchievementCard.svelte';
	import TierProgressBar from '$lib/components/TierProgressBar.svelte';

	let achievements = [];
	let userAchievements = [];
	let stats = null;
	let loading = true;
	let error = null;

	// 필터링
	let selectedGame = 'all';
	let selectedCategory = 'all';
	let selectedTier = 'all';

	const games = [
		{ value: 'all', label: '전체' },
		{ value: 'blackjack', label: '블랙잭' },
		{ value: 'roulette', label: '룰렛' },
		{ value: 'baccarat', label: '바카라' },
		{ value: 'poker', label: '포커' },
		{ value: 'slots', label: '슬롯' },
		{ value: 'sicbo', label: '다이사이' }
	];

	const categories = [
		{ value: 'all', label: '전체' },
		{ value: 'wins', label: '승리' },
		{ value: 'games', label: '게임 수' },
		{ value: 'streak', label: '연승' },
		{ value: 'money', label: '수익' },
		{ value: 'special', label: '특별' },
		{ value: 'hand', label: '핸드' },
		{ value: 'sidebet', label: '사이드벳' }
	];

	const tiers = [
		{ value: 'all', label: '전체' },
		{ value: 'bronze', label: '브론즈' },
		{ value: 'silver', label: '실버' },
		{ value: 'gold', label: '골드' },
		{ value: 'diamond', label: '다이아' }
	];

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		error = null;

		try {
			// 업적 목록 조회
			const achievementsRes = await fetch('/api/achievements');
			const achievementsData = await achievementsRes.json();

			if (achievementsData.success) {
				achievements = achievementsData.achievements;
			}

			// 사용자 진행률 조회
			const progressRes = await fetch('/api/achievements/progress');
			const progressData = await progressRes.json();

			if (progressData.success) {
				userAchievements = progressData.achievements;
			}

			// 통계 조회
			const statsRes = await fetch('/api/achievements/stats');
			const statsData = await statsRes.json();

			if (statsData.success) {
				stats = statsData;
			}
		} catch (err) {
			error = err.message;
			console.error('Error loading achievements:', err);
		} finally {
			loading = false;
		}
	}

	async function handleClaim(userAchievementId) {
		try {
			const res = await fetch('/api/achievements/claim', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ userAchievementId })
			});

			const data = await res.json();

			if (data.success) {
				// 데이터 재로드
				await loadData();
				alert(`보상 ${data.rewardAmount?.toLocaleString()}칩을 수령했습니다!`);
			} else {
				alert(`보상 수령 실패: ${data.error}`);
			}
		} catch (err) {
			console.error('Error claiming reward:', err);
			alert('보상 수령 중 오류가 발생했습니다.');
		}
	}

	$: filteredAchievements = achievements
		.filter((a) => selectedGame === 'all' || a.game_type === selectedGame)
		.filter((a) => selectedCategory === 'all' || a.category === selectedCategory)
		.filter((a) => selectedTier === 'all' || a.tier === selectedTier)
		.map((achievement) => {
			const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id);
			const progress = userAchievement
				? Math.min((userAchievement.progress / achievement.requirements_value) * 100, 100)
				: 0;
			const completed = !!userAchievement?.completed_at;
			const claimed = !!userAchievement?.reward_claimed;

			return {
				...achievement,
				progress,
				completed,
				claimed,
				userAchievementId: userAchievement?.id
			};
		});

	$: inProgressAchievements = filteredAchievements.filter((a) => !a.completed);
	$: completedAchievements = filteredAchievements.filter((a) => a.completed && !a.claimed);
	$: claimedAchievements = filteredAchievements.filter((a) => a.claimed);

	$: currentTier = calculateCurrentTier();

	function calculateCurrentTier() {
		if (!stats) return 'bronze';

		const tierCounts = {
			bronze: 0,
			silver: 0,
			gold: 0,
			diamond: 0
		};

		// 완료된 업적 수 집계
		userAchievements.forEach((ua) => {
			if (ua.completed_at) {
				const achievement = achievements.find((a) => a.id === ua.achievement_id);
				if (achievement) {
					tierCounts[achievement.tier]++;
				}
			}
		});

		// 다이아몬드 5개 이상 = 다이아
		if (tierCounts.diamond >= 5) return 'diamond';
		// 골드 10개 이상 = 골드
		if (tierCounts.gold >= 10) return 'gold';
		// 실버 15개 이상 = 실버
		if (tierCounts.silver >= 15) return 'silver';
		// 브론즈 20개 이상 = 브론즈
		if (tierCounts.bronze >= 20) return 'bronze';

		return 'bronze';
	}

	function getCompletionRate() {
		if (!stats || !stats.stats) return 0;
		return stats.stats.completionRate || 0;
	}
</script>

<div class="achievements-page">
	<div class="page-header">
		<h1>🏆 업적</h1>
		<p>게임별 업적을 달성하고 보상을 받으세요!</p>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
			<p>업적을 불러오는 중...</p>
		</div>
	{:else if error}
		<div class="error-container">
			<p>오류가 발생했습니다: {error}</p>
			<button on:click={loadData}>다시 시도</button>
		</div>
	{:else}
		<!-- 통계 카드 -->
		{#if stats}
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">📊</div>
					<div class="stat-content">
						<div class="stat-label">완료율</div>
						<div class="stat-value">{getCompletionRate()}%</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">✅</div>
					<div class="stat-content">
						<div class="stat-label">완료된 업적</div>
						<div class="stat-value">{stats.stats?.completed_achievements || 0}</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">⏳</div>
					<div class="stat-content">
						<div class="stat-label">진행 중</div>
						<div class="stat-value">{inProgressAchievements.length}</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">💰</div>
					<div class="stat-content">
						<div class="stat-label">미청구 보상</div>
						<div class="stat-value">{stats.pendingClaims?.length || 0}</div>
					</div>
				</div>
			</div>

			<!-- 등급 진행률 -->
			<div class="tier-progress-section">
				<TierProgressBar currentTier={currentTier} progress={getCompletionRate()} />
			</div>
		{/if}

		<!-- 필터 -->
		<div class="filters-section">
			<div class="filter-group">
				<label>게임</label>
				<select bind:value={selectedGame}>
					{#each games as game}
						<option value={game.value}>{game.label}</option>
					{/each}
				</select>
			</div>

			<div class="filter-group">
				<label>카테고리</label>
				<select bind:value={selectedCategory}>
					{#each categories as category}
						<option value={category.value}>{category.label}</option>
					{/each}
				</select>
			</div>

			<div class="filter-group">
				<label>등급</label>
				<select bind:value={selectedTier}>
					{#each tiers as tier}
						<option value={tier.value}>{tier.label}</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- 진행 중 업적 -->
		{#if completedAchievements.length > 0}
			<div class="achievements-section">
				<h2 class="section-title">🎁 수령 가능한 보상</h2>
				<div class="achievements-grid">
					{#each completedAchievements as achievement}
						<AchievementCard
							{achievement}
							progress={achievement.progress}
							completed={achievement.completed}
							claimed={achievement.claimed}
							on:claim={() => handleClaim(achievement.userAchievementId)}
						/>
					{/each}
				</div>
			</div>
		{/if}

		<!-- 진행 중 업적 -->
		{#if inProgressAchievements.length > 0}
			<div class="achievements-section">
				<h2 class="section-title">⏳ 진행 중</h2>
				<div class="achievements-grid">
					{#each inProgressAchievements as achievement}
						<AchievementCard
							{achievement}
							progress={achievement.progress}
							completed={achievement.completed}
							locked={false}
						/>
					{/each}
				</div>
			</div>
		{/if}

		<!-- 완료된 업적 -->
		{#if claimedAchievements.length > 0}
			<div class="achievements-section">
				<h2 class="section-title">✅ 완료됨</h2>
				<div class="achievements-grid">
					{#each claimedAchievements as achievement}
						<AchievementCard
							{achievement}
							progress={100}
							completed={true}
							claimed={true}
						/>
					{/each}
				</div>
			</div>
		{/if}

		<!-- 업적 없음 -->
		{#if filteredAchievements.length === 0}
			<div class="empty-state">
				<p>해당 조건의 업적이 없습니다.</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.achievements-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
		background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.page-header p {
		font-size: 1.125rem;
		color: rgba(255, 255, 255, 0.8);
	}

	.loading-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		gap: 1rem;
	}

	.spinner {
		width: 50px;
		height: 50px;
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-top-color: #ffd700;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error-container button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.error-container button:hover {
		transform: scale(1.05);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: rgba(30, 30, 50, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
	}

	.stat-icon {
		font-size: 2rem;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
	}

	.tier-progress-section {
		margin-bottom: 2rem;
	}

	.filters-section {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		min-width: 150px;
	}

	.filter-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
	}

	.filter-group select {
		padding: 0.75rem;
		background: rgba(30, 30, 50, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		color: white;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-group select:hover {
		border-color: rgba(255, 215, 0, 0.3);
	}

	.filter-group select:focus {
		outline: none;
		border-color: #ffd700;
		box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
	}

	.achievements-section {
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
		color: white;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.achievements-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: rgba(255, 255, 255, 0.6);
	}

	@media (max-width: 768px) {
		.achievements-page {
			padding: 1rem;
		}

		.page-header h1 {
			font-size: 2rem;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.achievements-grid {
			grid-template-columns: 1fr;
		}

		.filters-section {
			flex-direction: column;
		}
	}
</style>
