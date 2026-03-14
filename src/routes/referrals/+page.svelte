<script>
	import Navigation from '$lib/components/Navigation.svelte';
	import { referrals } from '$lib/stores/friends.js';
	import { user, isAuthenticated } from '$lib/stores/auth.js';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($isAuthenticated) {
			referrals.loadCode();
			referrals.loadStats();
		}
	});

	function copyCode() {
		if ($referrals.code) {
			navigator.clipboard.writeText($referrals.code);
			alert('추천 코드가 복사되었습니다!');
		}
	}
</script>

{#if !$isAuthenticated}
	<div class="min-h-screen bg-gradient-to-br from-primary-soft-pink/20 via-primary-soft-purple/20 to-primary-soft-blue/20">
		<Navigation />
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="glass-card p-12 text-center">
				<div class="text-6xl mb-4">🔒</div>
				<h1 class="text-3xl font-bold font-playfair mb-4">로그인이 필요합니다</h1>
				<p class="text-gray-600 mb-8">추천인 시스템을 사용하려면 로그인해주세요.</p>
				<a
					href="/login"
					class="inline-block px-8 py-3 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple text-white rounded-full hover:shadow-lg transition-all font-poppins font-semibold"
				>
					로그인
				</a>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-gradient-to-br from-primary-soft-pink/20 via-primary-soft-purple/20 to-primary-soft-blue/20">
		<Navigation />
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<!-- 페이지 헤더 -->
			<div class="glass-card p-8 mb-8">
				<div class="text-center">
					<div class="text-5xl mb-4">🎁</div>
					<h1 class="text-4xl font-bold font-playfair mb-2">친구 초대하고 보상받기</h1>
					<p class="text-gray-600 font-poppins">
						친구를 초대하면 50,000칩, 친구도 10,000칩을 받을 수 있어요!
					</p>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<!-- 추천 코드 -->
				<div class="glass-card p-8">
					<h2 class="text-2xl font-bold font-playfair mb-6">내 추천 코드</h2>

					{#if $referrals.loading}
						<div class="text-center py-8">
							<div class="animate-spin text-4xl">⏳</div>
							<p class="mt-2 text-gray-600">로딩 중...</p>
						</div>
					{:else}
						<div class="space-y-6">
							<div class="bg-white/10 rounded-lg p-6 text-center">
								<div class="text-sm text-gray-600 mb-2 font-poppins">추천 코드</div>
								<div class="text-4xl font-bold font-poppins text-primary-soft-purple mb-4">
									{$referrals.code || '로딩 중...'}
								</div>
								<button
									on:click={copyCode}
									disabled={!$referrals.code}
									class="w-full px-6 py-3 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple text-white rounded-full hover:shadow-lg transition-all font-poppins font-semibold disabled:opacity-50"
								>
									코드 복사하기
								</button>
							</div>

							<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<h3 class="font-semibold text-blue-900 mb-2">💡 사용 방법</h3>
								<ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
									<li>위 추천 코드를 복사하세요</li>
									<li>친구에게 코드를 공유하세요</li>
									<li>친구가 가입 시 코드를 입력하면 보상 지급!</li>
								</ol>
							</div>
						</div>
					{/if}
				</div>

				<!-- 추천 통계 -->
				<div class="glass-card p-8">
					<h2 class="text-2xl font-bold font-playfair mb-6">추천 통계</h2>

					{#if $referrals.loading}
						<div class="text-center py-8">
							<div class="animate-spin text-4xl">⏳</div>
							<p class="mt-2 text-gray-600">로딩 중...</p>
						</div>
					{:else if $referrals.stats}
						<div class="space-y-6">
							<div class="grid grid-cols-2 gap-4">
								<div class="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-4 text-center">
									<div class="text-3xl font-bold text-primary-soft-pink font-playfair">
										{$referrals.stats.totalReferrals}
									</div>
									<div class="text-sm text-gray-600 font-poppins">총 추천인</div>
								</div>
								<div class="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-4 text-center">
									<div class="text-3xl font-bold text-green-600 font-playfair">
										{$referrals.stats.totalRewards.toLocaleString()}
									</div>
									<div class="text-sm text-gray-600 font-poppins">받은 보상 (칩)</div>
								</div>
							</div>

							<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
								<h3 class="font-semibold text-yellow-900 mb-2">🎯 보상 안내</h3>
								<ul class="text-sm text-yellow-800 space-y-1">
									<li>• 추천인: 50,000칩 (친구 가입 완료 시)</li>
									<li>• 피추천인: 10,000칩 (가입 시 즉시 지급)</li>
								</ul>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- 추천한 사용자 목록 -->
			{#if $referrals.referrals.length > 0}
				<div class="glass-card p-8 mt-8">
					<h2 class="text-2xl font-bold font-playfair mb-6">추천한 사용자</h2>
					<div class="space-y-3">
						{#each $referrals.referrals as referral}
							<div
								class="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
							>
								<div class="flex items-center gap-3">
									<div
										class="w-10 h-10 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple rounded-full flex items-center justify-center text-white font-bold"
									>
										{referral.referredUsername.charAt(0).toUpperCase()}
									</div>
									<div>
										<div class="font-semibold font-poppins">
											{referral.referredUsername}
										</div>
										<div class="text-sm text-gray-400">
											{new Date(referral.createdAt).toLocaleDateString()}
										</div>
									</div>
								</div>
								<div class="text-right">
									{#if referral.rewardPaid}
										<div class="text-green-500 font-semibold">지급완료</div>
										<div class="text-sm text-gray-400">50,000칩</div>
									{:else}
										<div class="text-yellow-500 font-semibold">대기중</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.glass-card {
		@apply bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl;
	}
</style>
