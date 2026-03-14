<script>
	import { friends, onlineStatus } from '$lib/stores/friends.js';
	import { onMount } from 'svelte';

	let showSearch = false;
	let searchQuery = '';
	let searchResults = [];
	let searching = false;

	onMount(() => {
		friends.load();
		onlineStatus.startPolling(30000); // 30초마다 폴링

		return () => {
			onlineStatus.stopPolling();
		};
	});

	async function handleSearch() {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		searching = true;
		const result = await friends.searchUsers(searchQuery);
		searching = false;

		if (result.success) {
			searchResults = result.users;
		}
	}

	async function sendFriendRequest(userId) {
		const result = await friends.sendRequest(userId);
		if (result.success) {
			alert('친구 요청을 보냈습니다!');
			searchResults = [];
			searchQuery = '';
			showSearch = false;
		} else {
			alert(result.error);
		}
	}

	async function acceptRequest(requestId) {
		const result = await friends.acceptRequest(requestId);
		if (!result.success) {
			alert(result.error);
		}
	}

	async function rejectRequest(requestId) {
		if (confirm('친구 요청을 거절하시겠습니까?')) {
			const result = await friends.rejectRequest(requestId);
			if (!result.success) {
				alert(result.error);
			}
		}
	}

	async function removeFriend(friendId) {
		if (confirm('친구를 삭제하시겠습니까?')) {
			const result = await friends.removeFriend(friendId);
			if (!result.success) {
				alert(result.error);
			}
		}
	}

	function getOnlineStatusText(lastSeen) {
		if (!lastSeen) return '알 수 없음';

		const now = new Date();
		const lastSeenDate = new Date(lastSeen);
		const diffMinutes = (now - lastSeenDate) / 1000 / 60;

		if (diffMinutes < 1) return '온라인';
		if (diffMinutes < 60) return `${Math.floor(diffMinutes)}분 전`;
		if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
		return `${Math.floor(diffMinutes / 1440)}일 전`;
	}

	$: onlineStatuses = {};
	$onlineStatus.statuses.forEach((status) => {
		onlineStatuses[status.userId] = status;
	});
</script>

<div class="space-y-6">
	<!-- 헤더 및 검색 버튼 -->
	<div class="flex justify-between items-center">
		<h2 class="text-2xl font-bold font-playfair">친구 목록</h2>
		<button
			on:click={() => (showSearch = !showSearch)}
			class="px-4 py-2 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple text-white rounded-full hover:shadow-lg transition-all font-poppins font-semibold"
		>
			{showSearch ? '닫기' : '친구 찾기'}
		</button>
	</div>

	<!-- 검색 영역 -->
	{#if showSearch}
		<div class="glass-card p-6 space-y-4">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="사용자명으로 검색..."
					class="flex-1 px-4 py-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-soft-purple font-poppins"
					on:keypress={(e) => e.key === 'Enter' && handleSearch()}
				/>
				<button
					on:click={handleSearch}
					disabled={searching || !searchQuery.trim()}
					class="px-6 py-2 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple text-white rounded-full hover:shadow-lg transition-all font-poppins font-semibold disabled:opacity-50"
				>
					{searching ? '검색 중...' : '검색'}
				</button>
			</div>

			<!-- 검색 결과 -->
			{#if searchResults.length > 0}
				<div class="space-y-2">
					<h3 class="text-lg font-semibold font-poppins">검색 결과</h3>
					{#each searchResults as user}
						<div class="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
							<div class="flex items-center gap-3">
								<div
									class="w-10 h-10 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple rounded-full flex items-center justify-center text-white font-bold"
								>
									{user.username.charAt(0).toUpperCase()}
								</div>
								<div>
									<div class="font-semibold font-poppins">{user.username}</div>
									<div class="text-sm text-gray-400">{user.fullName}</div>
								</div>
							</div>
							<button
								on:click={() => sendFriendRequest(user.id)}
								class="px-4 py-1 bg-primary-soft-purple text-white rounded-full hover:bg-primary-soft-purple/80 transition-colors text-sm font-poppins"
							>
								친구 요청
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- 대기 중인 친구 요청 -->
	{#if $friends.pending.length > 0}
		<div class="glass-card p-6 space-y-4">
			<h3 class="text-lg font-semibold font-poppins">친구 요청 ({$friends.pending.length})</h3>
			<div class="space-y-3">
				{#each $friends.pending as request}
					<div
						class="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-12 h-12 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple rounded-full flex items-center justify-center text-white font-bold"
							>
								{request.username.charAt(0).toUpperCase()}
							</div>
							<div>
								<div class="font-semibold font-poppins">{request.username}</div>
								<div class="text-sm text-gray-400">{request.fullName}</div>
							</div>
						</div>
						<div class="flex gap-2">
							<button
								on:click={() => acceptRequest(request.id)}
								class="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-poppins font-semibold"
							>
								수락
							</button>
							<button
								on:click={() => rejectRequest(request.id)}
								class="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors font-poppins"
							>
								거절
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- 친구 목록 -->
	<div class="glass-card p-6 space-y-4">
		<h3 class="text-lg font-semibold font-poppins">
			내 친구 ({$friends.accepted.length})
		</h3>

		{#if $friends.accepted.length === 0}
			<div class="text-center py-8 text-gray-400">
				<div class="text-4xl mb-2">👥</div>
				<p>아직 친구가 없습니다.</p>
				<p class="text-sm">친구 찾기 버튼을 눌러 친구를 추가해보세요!</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each $friends.accepted as friend}
					<div
						class="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
					>
						<div class="flex items-center gap-3">
							<div class="relative">
								<div
									class="w-12 h-12 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple rounded-full flex items-center justify-center text-white font-bold"
								>
									{friend.username.charAt(0).toUpperCase()}
								</div>
								{#if onlineStatuses[friend.userId]?.isOnline}
									<div
										class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
									></div>
								{/if}
							</div>
							<div>
								<div class="font-semibold font-poppins">{friend.username}</div>
								<div class="text-sm text-gray-400">
									{#if onlineStatuses[friend.userId]?.isOnline}
										<span class="text-green-500">온라인</span>
									{:else}
										{getOnlineStatusText(onlineStatuses[friend.userId]?.lastSeen)}
									{/if}
								</div>
							</div>
						</div>
						<div class="flex gap-2">
							<button
								on:click={() => removeFriend(friend.userId)}
								class="px-4 py-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/30 transition-colors font-poppins"
							>
								삭제
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
