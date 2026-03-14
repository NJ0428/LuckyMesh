<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  // 토너먼트 데이터
  let tournament = null;
  let leaderboard = [];
  let myPerformance = null;
  let loading = true;
  let error = null;

  // 카운트다운 타이머
  let countdown = null;
  let countdownInterval = null;

  // 토너먼트 ID
  let tournamentId = null;

  // 토너먼트 데이터 불러오기
  async function loadTournament() {
    loading = true;
    error = null;

    try {
      const response = await fetch(`/api/tournaments/${$page.params.id}`);
      const data = await response.json();

      if (data.success) {
        tournament = data.data;
        loadLeaderboard();
        loadMyPerformance();
        startCountdown();
      } else {
        error = data.error || '토너먼트 정보를 불러오는데 실패했습니다.';
      }
    } catch (err) {
      error = '서버 오류가 발생했습니다.';
      console.error('Load tournament error:', err);
    } finally {
      loading = false;
    }
  }

  // 랭킹보드 불러오기
  async function loadLeaderboard() {
    try {
      const response = await fetch(`/api/tournaments/${$page.params.id}/leaderboard`);
      const data = await response.json();

      if (data.success) {
        leaderboard = data.data.leaderboard || [];
      }
    } catch (err) {
      console.error('Load leaderboard error:', err);
    }
  }

  // 내 성적 불러오기
  async function loadMyPerformance() {
    try {
      const response = await fetch(`/api/tournaments/${$page.params.id}/my-performance`);
      const data = await response.json();

      if (data.success) {
        myPerformance = data.data;
      }
    } catch (err) {
      console.error('Load my performance error:', err);
    }
  }

  // 카운트다운 시작
  function startCountdown() {
    if (!tournament) return;

    updateCountdown();

    if (countdownInterval) {
      clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(() => {
      updateCountdown();
    }, 1000);
  }

  function updateCountdown() {
    if (!tournament) return;

    const now = new Date();
    let endTime;

    if (tournament.status === 'registration') {
      endTime = new Date(tournament.registrationEnd);
    } else if (tournament.status === 'ongoing') {
      endTime = new Date(tournament.tournamentEnd);
    } else {
      countdown = null;
      return;
    }

    const diff = endTime - now;

    if (diff <= 0) {
      countdown = null;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdown = { days, hours, minutes, seconds };
  }

  // 참가하기
  async function handleJoin() {
    try {
      const response = await fetch(`/api/tournaments/${$page.params.id}/join`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert('토너먼트에 참가했습니다!');
        loadTournament();
      } else {
        alert(data.error || '참가에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.');
      console.error('Join tournament error:', err);
    }
  }

  // 탈퇴하기
  async function handleLeave() {
    if (!confirm('정말로 토너먼트에서 탈퇴하시겠습니까? 참가비는 환불됩니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tournaments/${$page.params.id}/leave`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert('토너먼트에서 탈퇴했습니다.');
        loadTournament();
      } else {
        alert(data.error || '탈퇴에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.');
      console.error('Leave tournament error:', err);
    }
  }

  // 상태 뱃지 스타일
  function getStatusBadge(status) {
    switch (status) {
      case 'registration':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ongoing':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case 'registration': return '참가 신청중';
      case 'ongoing': return '진행 중';
      case 'completed': return '완료';
      case 'cancelled': return '취소됨';
      default: return status;
    }
  }

  function getGameTypeLabel(gameType) {
    switch (gameType) {
      case 'blackjack': return '블랙잭';
      case 'baccarat': return '바카라';
      case 'roulette': return '룰렛';
      case 'slots': return '슬롯';
      case 'poker': return '포커';
      case 'sicbo': return '식보';
      case 'all': return '모든 게임';
      default: return gameType;
    }
  }

  function getPrizeTypeLabel(prizeType) {
    switch (prizeType) {
      case 'cash': return '현금';
      case 'bonus': return '보너스';
      case 'points': return 'VIP 포인트';
      default: return prizeType;
    }
  }

  onMount(() => {
    loadTournament();

    // Lucide 아이콘 초기화
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }

    // 진행 중인 토너먼트는 10초마다 자동 새로고침
    const interval = setInterval(() => {
      if (tournament && tournament.status === 'ongoing') {
        loadLeaderboard();
        loadMyPerformance();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  });
</script>

<svelte:head>
  <title>{tournament ? tournament.name : '토너먼트'} - LuckyMesh Casino</title>
  <meta name="description" content="실시간 토너먼트 랭킹보드" />
</svelte:head>

<div class="min-h-screen" style="background: oklch(0.0500 0 0); color: oklch(0.9800 0.0200 45); font-family: 'Playfair Display', serif;">
  <!-- 로딩 상태 -->
  {#if loading}
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl text-center">
        <div class="text-2xl text-yellow-400">⏳</div>
        <p class="text-xl mt-4 opacity-80">토너먼트 정보를 불러오는 중...</p>
      </div>
    </section>
  {:else if error}
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl text-center">
        <div class="text-6xl mb-6">⚠️</div>
        <p class="text-xl text-red-400">{error}</p>
      </div>
    </section>
  {:else if !tournament}
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl text-center">
        <div class="text-6xl mb-6">🏆</div>
        <p class="text-xl opacity-80">토너먼트를 찾을 수 없습니다.</p>
      </div>
    </section>
  {:else}
    <!-- 토너먼트 헤더 -->
    <header class="py-16 text-center relative" style="background: linear-gradient(135deg, oklch(0.1000 0.0200 45) 0%, oklch(0.0500 0 0) 50%, oklch(0.1000 0.0200 45) 100%);">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-center mb-6">
          <div class="w-16 h-16 mr-4 text-yellow-400">🏆</div>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            {tournament.name}
          </h1>
          <div class="w-16 h-16 ml-4 text-yellow-400">🏆</div>
        </div>

        <!-- 상태 뱃지 -->
        <div class="flex items-center justify-center gap-4 mb-6">
          <span class="px-4 py-2 rounded-full text-sm font-semibold border {getStatusBadge(tournament.status)}">
            {getStatusLabel(tournament.status)}
          </span>
          {#if countdown}
            <div class="flex items-center gap-2 text-lg">
              <span class="text-yellow-400">⏰</span>
              {#if countdown.days > 0}
                <span>{countdown.days}일 </span>
              {/if}
              <span>{countdown.hours}시간 </span>
              <span>{countdown.minutes}분 </span>
              <span>{countdown.seconds}초</span>
            </div>
          {/if}
        </div>

        <p class="text-lg opacity-80 max-w-2xl mx-auto">
          {tournament.description || '실시간 토너먼트에 참가하고 상금을 획득하세요!'}
        </p>
      </div>
    </header>

    <!-- 토너먼트 정보 섹션 -->
    <section class="py-12 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <!-- 게임 타입 -->
          <div class="rounded-xl p-6 text-center backdrop-filter backdrop-blur-lg border"
               style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);">
            <div class="text-sm opacity-70 mb-2">게임</div>
            <div class="text-xl font-bold text-yellow-400">{getGameTypeLabel(tournament.gameType)}</div>
          </div>

          <!-- 참가비 -->
          <div class="rounded-xl p-6 text-center backdrop-filter backdrop-blur-lg border"
               style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);">
            <div class="text-sm opacity-70 mb-2">참가비</div>
            <div class="text-xl font-bold">
              {tournament.entryFee > 0 ? `₩${tournament.entryFee.toLocaleString()}` : '무료'}
            </div>
          </div>

          <!-- 상금풀 -->
          <div class="rounded-xl p-6 text-center backdrop-filter backdrop-blur-lg border"
               style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);">
            <div class="text-sm opacity-70 mb-2">상금풀</div>
            <div class="text-xl font-bold text-yellow-400">₩{tournament.prizePool.toLocaleString()}</div>
          </div>

          <!-- 참가자 수 -->
          <div class="rounded-xl p-6 text-center backdrop-filter backdrop-blur-lg border"
               style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);">
            <div class="text-sm opacity-70 mb-2">참가자</div>
            <div class="text-xl font-bold">{tournament.currentParticipants} / {tournament.maxParticipants}</div>
          </div>
        </div>

        <!-- 보상 구성 -->
        {#if tournament.prizes && tournament.prizes.length > 0}
          <div class="rounded-2xl p-8 backdrop-filter backdrop-blur-lg border mb-12"
               style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);">
            <h2 class="text-3xl font-bold mb-6 text-center">🎁 보상 구성</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each tournament.prizes as prize}
                <div class="text-center p-4 rounded-lg" style="background: oklch(0.0600 0.0100 45 / 0.5);">
                  <div class="text-lg font-bold mb-2">
                    {prize.rankFrom === prize.rankTo ? `${prize.rankFrom}등` : `${prize.rankFrom}-${prize.rankTo}등`}
                  </div>
                  <div class="text-sm text-yellow-400 font-semibold">
                    {getPrizeTypeLabel(prize.prizeType)} ₩{prize.prizeAmount.toLocaleString()}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- 액션 버튼 -->
        {#if myPerformance && myPerformance.isParticipant && tournament.status === 'registration'}
          <div class="text-center mb-12">
            <div class="inline-flex gap-4">
              <button
                on:click={handleLeave}
                class="px-8 py-4 rounded-lg font-semibold transition-all duration-300 border-2 border-red-500 text-red-400 hover:bg-red-500/10"
                style="text-transform: uppercase; letter-spacing: 0.1em;">
                탈퇴하기
              </button>
            </div>
            <p class="mt-4 text-sm opacity-70">탈퇴하시면 참가비가 환불됩니다.</p>
          </div>
        {:else if !myPerformance?.isParticipant && tournament.status === 'registration'}
          <div class="text-center mb-12">
            <button
              on:click={handleJoin}
              class="px-12 py-4 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 relative overflow-hidden"
              style="background: linear-gradient(135deg, oklch(0.8500 0.3000 45) 0%, oklch(0.6500 0.2000 35) 100%); border: none; color: oklch(0.0500 0 0); text-transform: uppercase; letter-spacing: 0.1em; font-size: 1.2rem;">
              🏆 참가하기
            </button>
            {#if tournament.vipTierRequired !== 'all' && tournament.vipTierRequired}
              <p class="mt-4 text-sm text-yellow-400">
                👑 {tournament.vipTierRequired.toUpperCase()} 등급 이상 참가 가능
              </p>
            {/if}
          </div>
        {/if}

        <!-- 내 성적 -->
        {#if myPerformance && myPerformance.isParticipant && tournament.status === 'ongoing'}
          <div class="rounded-2xl p-8 backdrop-filter backdrop-blur-lg border mb-12"
               style="background: linear-gradient(135deg, oklch(0.0800 0.0150 45 / 0.9) 0%, oklch(0.0600 0.0100 45 / 0.9) 100%); border-color: oklch(0.2000 0.0200 45 / 0.3);">
            <h2 class="text-3xl font-bold mb-6 text-center">📊 내 성적</h2>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <div class="text-sm opacity-70 mb-1">순위</div>
                <div class="text-3xl font-bold text-yellow-400">#{myPerformance.performance.rank || '-'}</div>
              </div>
              <div>
                <div class="text-sm opacity-70 mb-1">총 베팅</div>
                <div class="text-xl font-bold">₩{myPerformance.performance.totalBetAmount.toLocaleString()}</div>
              </div>
              <div>
                <div class="text-sm opacity-70 mb-1">총 당첨</div>
                <div class="text-xl font-bold">₩{myPerformance.performance.totalWinAmount.toLocaleString()}</div>
              </div>
              <div>
                <div class="text-sm opacity-70 mb-1">순이익</div>
                <div class="text-xl font-bold" class:text-green-400={myPerformance.performance.netProfit > 0} class:text-red-400={myPerformance.performance.netProfit < 0}>
                  ₩{myPerformance.performance.netProfit.toLocaleString()}
                </div>
              </div>
              <div>
                <div class="text-sm opacity-70 mb-1">게임 수</div>
                <div class="text-xl font-bold">{myPerformance.performance.gamesPlayed}</div>
              </div>
            </div>
            {#if myPerformance.potentialPrize}
              <div class="mt-6 text-center p-4 rounded-lg" style="background: oklch(0.0600 0.0100 45 / 0.5);">
                <span class="text-sm opacity-70">현재 예상 상금: </span>
                <span class="text-lg font-bold text-yellow-400">
                  {getPrizeTypeLabel(myPerformance.potentialPrize.type)} ₩{myPerformance.potentialPrize.amount.toLocaleString()}
                </span>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </section>

    <!-- 랭킹보드 -->
    <section class="py-12 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="rounded-2xl p-8 backdrop-filter backdrop-blur-lg border"
             style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);">
          <h2 class="text-3xl font-bold mb-8 text-center flex items-center justify-center">
            <span class="w-10 h-10 mr-4 text-yellow-400">🏆</span>
            랭킹보드
            {#if tournament.status === 'ongoing'}
              <span class="ml-4 text-sm font-normal opacity-70">(실시간 업데이트)</span>
            {/if}
          </h2>

          {#if leaderboard.length === 0}
            <div class="text-center py-12">
              <div class="text-6xl mb-4">🎮</div>
              <p class="text-lg opacity-70">아직 참가자가 없습니다.</p>
            </div>
          {:else}
            <!-- 테이블 헤더 -->
            <div class="grid grid-cols-12 gap-4 mb-4 text-sm font-semibold opacity-70 pb-4 border-b"
                 style="border-color: oklch(0.2000 0.0200 45 / 0.2);">
              <div class="col-span-1 text-center">순위</div>
              <div class="col-span-3">플레이어</div>
              <div class="col-span-2 text-right">총 베팅</div>
              <div class="col-span-2 text-right">총 당첨</div>
              <div class="col-span-2 text-right">순이익</div>
              <div class="col-span-2 text-center">게임 수</div>
            </div>

            <!-- 랭킹 리스트 -->
            <div class="space-y-2">
              {#each leaderboard as player, index}
                <div class="grid grid-cols-12 gap-4 p-4 rounded-lg transition-all duration-200"
                     style="background: {myPerformance?.performance?.userId === player.userId ? oklch(0.6500 0.2000 35 / 0.3) : oklch(0.0600 0.0100 45 / 0.3)}; border: {myPerformance?.performance?.userId === player.userId ? '2px solid oklch(0.7500 0.2500 45)' : 'none'};">
                  <!-- 순위 -->
                  <div class="col-span-1 flex items-center justify-center">
                    {#if player.rank === 1}
                      <span class="text-2xl">🥇</span>
                    {:else if player.rank === 2}
                      <span class="text-2xl">🥈</span>
                    {:else if player.rank === 3}
                      <span class="text-2xl">🥉</span>
                    {:else}
                      <span class="text-lg font-bold">#{player.rank}</span>
                    {/if}
                  </div>

                  <!-- 플레이어 -->
                  <div class="col-span-3 flex items-center">
                    <div class="flex items-center">
                      <div class="w-8 h-8 mr-3 rounded-full flex items-center justify-center text-sm"
                           style="background: linear-gradient(135deg, oklch(0.7500 0.2500 45) 0%, oklch(0.6500 0.2000 35) 100%);">
                        {player.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div class="font-semibold">{player.username}</div>
                        <div class="text-xs opacity-70">{player.vipTier.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>

                  <!-- 총 베팅 -->
                  <div class="col-span-2 flex items-center justify-end text-sm">
                    ₩{player.totalBetAmount.toLocaleString()}
                  </div>

                  <!-- 총 당첨 -->
                  <div class="col-span-2 flex items-center justify-end text-sm">
                    ₩{player.totalWinAmount.toLocaleString()}
                  </div>

                  <!-- 순이익 -->
                  <div class="col-span-2 flex items-center justify-end text-sm font-bold"
                       class:text-green-400={player.netProfit > 0}
                       class:text-red-400={player.netProfit < 0}>
                    ₩{player.netProfit.toLocaleString()}
                  </div>

                  <!-- 게임 수 -->
                  <div class="col-span-2 flex items-center justify-center text-sm">
                    {player.gamesPlayed}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}
</div>
