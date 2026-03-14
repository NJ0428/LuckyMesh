<script>
	import Navigation from '$lib/components/Navigation.svelte';
	import FriendList from '$lib/components/FriendList.svelte';
	import { user, isAuthenticated } from '$lib/stores/auth.js';
</script>

{#if !$isAuthenticated}
	<div class="min-h-screen bg-gradient-to-br from-primary-soft-pink/20 via-primary-soft-purple/20 to-primary-soft-blue/20">
		<Navigation />
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="glass-card p-12 text-center">
				<div class="text-6xl mb-4">🔒</div>
				<h1 class="text-3xl font-bold font-playfair mb-4">로그인이 필요합니다</h1>
				<p class="text-gray-600 mb-8">친구 기능을 사용하려면 로그인해주세요.</p>
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
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-4xl font-bold font-playfair mb-2">친구 관리</h1>
						<p class="text-gray-600 font-poppins">
							친구를 추가하고 함께 게임을 즐겨보세요!
						</p>
					</div>
					<div class="text-right">
						<div class="text-sm text-gray-500 font-poppins">내 잔액</div>
						<div class="text-2xl font-bold text-primary-soft-purple font-poppins">
							₩{$user.balance.toLocaleString()}
						</div>
					</div>
				</div>
			</div>

			<!-- 친구 목록 컴포넌트 -->
			<FriendList />
		</div>
	</div>
{/if}

<style>
	.glass-card {
		@apply bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl;
	}
</style>
