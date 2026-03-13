<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // 토너먼트 데이터
  let tournaments = [];
  let filteredTournaments = [];
  let loading = true;
  let error = null;

  // 필터 상태
  let statusFilter = 'all'; // all, registration, ongoing, completed
  let gameTypeFilter = 'all'; // all, blackjack, baccarat, roulette, slots, poker, sicbo
  let vipTierFilter = 'all'; // all, silver, gold, platinum

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'registration', label: '참가 신청중' },
    { value: 'ongoing', label: '진행 중' },
    { value: 'completed', label: '완료' }
  ];

  const gameTypeOptions = [
    { value: 'all', label: '전체 게임' },
    { value: 'blackjack', label: '블랙잭' },
    { value: 'baccarat', label: '바카라' },
    { value: 'roulette', label: '룰렛' },
    { value: 'slots', label: '슬롯' },
    { value: 'poker', label: '포커' },
    { value: 'sicbo', label: '식보' }
  ];

  // 토너먼트 데이터 불러오기
  async function loadTournaments() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/tournaments');
      const data = await response.json();

      if (data.success) {
        tournaments = data.data;
        applyFilters();
      } else {
        error = data.error || '토너먼트 목록을 불러오는데 실패했습니다.';
      }
    } catch (err) {
      error = '서버 오류가 발생했습니다.';
      console.error('Load tournaments error:', err);
    } finally {
      loading = false;
    }
  }

  // 필터 적용
  function applyFilters() {
    filteredTournaments = tournaments.filter(t => {
      const statusMatch = statusFilter === 'all' || t.status === statusFilter;
      const gameMatch = gameTypeFilter === 'all' || t.gameType === gameTypeFilter;
      const vipMatch = vipTierFilter === 'all' || t.vipTierRequired === 'all' || t.vipTierRequired === vipTierFilter;
      return statusMatch && gameMatch && vipMatch;
    });
  }

  // 카운트다운 타이머
  function getCountdownTime(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
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

  function getTournamentTypeLabel(tournamentType) {
    switch (tournamentType) {
      case 'daily': return '일일';
      case 'weekly': return '주간';
      case 'special': return '스페셜';
      default: return tournamentType;
    }
  }

  // 참가하기
  async function handleJoin(tournamentId) {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        alert('토너먼트에 참가했습니다!');
        loadTournaments();
      } else {
        alert(data.error || '참가에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 오류가 발생했습니다.');
      console.error('Join tournament error:', err);
    }
  }

  // 토너먼트 상세로 이동
  function goToTournament(tournamentId) {
    goto(`/tournaments/${tournamentId}`);
  }

  onMount(() => {
    loadTournaments();

    // Lucide 아이콘 초기화
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }

    // 30초마다 자동 새로고침
    const interval = setInterval(() => {
      loadTournaments();
    }, 30000);

    return () => clearInterval(interval);
  });

  $: applyFilters();
</script>

<svelte:head>
  <title>토너먼트 - LuckyMesh Casino</title>
  <meta name="description" content="실시간 게임 토너먼트에 참가하고 상금을 획득하세요" />
</svelte:head>

<div class="min-h-screen" style="background: oklch(0.0500 0 0); color: oklch(0.9800 0.0200 45); font-family: 'Playfair Display', serif;">
  <!-- 토너먼트 헤더 -->
  <header class="py-16 text-center relative" style="background: linear-gradient(135deg, oklch(0.1000 0.0200 45) 0%, oklch(0.0500 0 0) 50%, oklch(0.1000 0.0200 45) 100%); overflow: hidden;">
    <div class="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-transparent opacity-50"></div>
    <div class="container mx-auto px-4 relative z-10">
      <div class="flex items-center justify-center mb-6">
        <div class="w-16 h-16 mr-4 text-yellow-400">🏆</div>
        <h1 class="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
          TOURNAMENTS
        </h1>
        <div class="w-16 h-16 ml-4 text-yellow-400">🏆</div>
      </div>
      <p class="text-xl opacity-80 max-w-2xl mx-auto">
        실시간 게임 토너먼트에 참가하고 상금을 획득하세요
      </p>
    </div>
  </header>

  <!-- 필터 섹션 -->
  <section class="py-8 px-4">
    <div class="container mx-auto max-w-6xl">
      <div class="rounded-2xl p-6 backdrop-filter backdrop-blur-lg border"
           style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 상태 필터 -->
          <div>
            <label class="block text-sm font-semibold mb-2">상태</label>
            <select bind:value={statusFilter} class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400">
              {#each statusOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          <!-- 게임 타입 필터 -->
          <div>
            <label class="block text-sm font-semibold mb-2">게임 타입</label>
            <select bind:value={gameTypeFilter} class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400">
              {#each gameTypeOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>

          <!-- VIP 등급 필터 -->
          <div>
            <label class="block text-sm font-semibold mb-2">VIP 등급</label>
            <select bind:value={vipTierFilter} class="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400">
              <option value="all">전체</option>
              <option value="silver">실버 이상</option>
              <option value="gold">골드 이상</option>
              <option value="platinum">플래티넘</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 로딩 상태 -->
  {#if loading}
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl text-center">
        <div class="text-2xl text-yellow-400">⏳</div>
        <p class="text-xl mt-4 opacity-80">토너먼트 목록을 불러오는 중...</p>
      </div>
    </section>
  {:else if error}
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl text-center">
        <div class="text-6xl mb-6">⚠️</div>
        <p class="text-xl text-red-400">{error}</p>
        <button
          on:click={loadTournaments}
          class="mt-6 px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          style="background: linear-gradient(135deg, oklch(0.8500 0.3000 45) 0%, oklch(0.6500 0.2000 35) 100%); border: none; color: oklch(0.0500 0 0);">
          다시 시도
        </button>
      </div>
    </section>
  {:else if filteredTournaments.length === 0}
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl text-center">
        <div class="text-6xl mb-6">🎮</div>
        <p class="text-xl opacity-80">해당 조건의 토너먼트가 없습니다.</p>
      </div>
    </section>
  {:else}
    <!-- 토너먼트 카드 그리드 -->
    <section class="py-12 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredTournaments as tournament}
            <div class="rounded-2xl p-6 backdrop-filter backdrop-blur-lg border transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer"
                 style="background: oklch(0.0800 0.0150 45 / 0.8); border-color: oklch(0.2000 0.0200 45 / 0.3);"
                 on:click={() => goToTournament(tournament.id)}>

              <!-- 상태 뱃지 -->
              <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold border {getStatusBadge(tournament.status)}">
                  {getStatusLabel(tournament.status)}
                </span>
                <div class="text-xs opacity-60">
                  {getTournamentTypeLabel(tournament.tournamentType)}
                </div>
              </div>

              <!-- 토너먼트 이름 -->
              <h3 class="text-xl font-bold mb-3">{tournament.name}</h3>
              <p class="text-sm opacity-70 mb-4 line-clamp-2">{tournament.description || '설명 없음'}</p>

              <!-- 게임 타입 -->
              <div class="flex items-center mb-4">
                <span class="text-sm font-semibold mr-2">게임:</span>
                <span class="text-sm text-yellow-400">{getGameTypeLabel(tournament.gameType)}</span>
              </div>

              <!-- 참가비 & 상금풀 -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center p-3 rounded-lg" style="background: oklch(0.0600 0.0100 45 / 0.5);">
                  <div class="text-xs opacity-70 mb-1">참가비</div>
                  <div class="text-lg font-bold">
                    {tournament.entryFee > 0 ? `₩${tournament.entryFee.toLocaleString()}` : '무료'}
                  </div>
                </div>
                <div class="text-center p-3 rounded-lg" style="background: oklch(0.0600 0.0100 45 / 0.5);">
                  <div class="text-xs opacity-70 mb-1">상금풀</div>
                  <div class="text-lg font-bold text-yellow-400">
                    ₩{tournament.prizePool.toLocaleString()}
                  </div>
                </div>
              </div>

              <!-- 참가자 수 -->
              <div class="flex items-center justify-between mb-4 text-sm">
                <span class="opacity-70">참가자</span>
                <span class="font-semibold">{tournament.currentParticipants || 0} / {tournament.maxParticipants}</span>
              </div>

              <!-- VIP 요건 -->
              {#if tournament.vipTierRequired !== 'all'}
                <div class="flex items-center mb-4 text-sm">
                  <span class="text-yellow-400 mr-2">👑</span>
                  <span>{tournament.vipTierRequired.toUpperCase()} 등급 이상</span>
                </div>
              {/if}

              <!-- 버튼 -->
              {#if tournament.status === 'registration'}
                <button
                  on:click|stopPropagation={() => handleJoin(tournament.id)}
                  class="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:transform hover:-translate-y-1 relative overflow-hidden"
                  style="background: linear-gradient(135deg, oklch(0.8500 0.3000 45) 0%, oklch(0.6500 0.2000 35) 100%); border: none; color: oklch(0.0500 0 0); text-transform: uppercase; letter-spacing: 0.1em;">
                  참가하기
                </button>
              {:else if tournament.status === 'ongoing'}
                <button
                  on:click|stopPropagation={() => goToTournament(tournament.id)}
                  class="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 border-2 border-green-500 text-green-400 hover:bg-green-500/10"
                  style="text-transform: uppercase; letter-spacing: 0.1em;">
                  랭킹보드
                </button>
              {:else}
                <button
                  on:click|stopPropagation={() => goToTournament(tournament.id)}
                  class="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 border-2 border-gray-600 text-gray-400 hover:bg-gray-600/10"
                  style="text-transform: uppercase; letter-spacing: 0.1em;">
                  결과 보기
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </section>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
