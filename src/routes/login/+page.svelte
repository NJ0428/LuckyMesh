<script>
  import { login, isLoading } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let errorMessage = '';
  let successMessage = '';
  let formErrors = {};

  function validateForm() {
    formErrors = {};

    // 이메일 검증
    if (!email) {
      formErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    if (!password) {
      formErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 8) {
      formErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    }

    return Object.keys(formErrors).length === 0;
  }

  async function handleLogin() {
    if (!validateForm()) return;

    errorMessage = '';
    successMessage = '';

    const result = await login(email, password);

    if (result.success) {
      successMessage = result.message;
      setTimeout(() => {
        goto('/');
      }, 1500);
    } else {
      errorMessage = result.error;
    }
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<svelte:head>
  <title>로그인 - LuckyMesh Casino</title>
  <meta name="description" content="LuckyMesh Casino에 로그인하여 최고의 카지노 게임을 즐겨보세요." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-casino-dark via-gray-900 to-black">
  <div class="flex min-h-screen">
    <!-- 왼쪽 그림 영역 -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-casino-gold/20 via-purple-900/30 to-red-900/20"></div>
      <div class="relative z-10 flex items-center justify-center w-full">
        <div class="text-center space-y-8 p-12">
          <!-- 카지노 아이콘들 -->
          <div class="text-8xl mb-8 animate-bounce">🎰</div>
          <h1 class="text-6xl font-bold text-casino-gold text-glow mb-6">
            LuckyMesh
          </h1>
          <p class="text-2xl text-white font-light mb-8">
            최고의 온라인 카지노 경험
          </p>
          <div class="flex justify-center space-x-8 text-5xl">
            <span class="animate-pulse">♠️</span>
            <span class="animate-pulse delay-75">♥️</span>
            <span class="animate-pulse delay-150">♦️</span>
            <span class="animate-pulse delay-300">♣️</span>
          </div>
          <div class="grid grid-cols-3 gap-4 mt-12 text-3xl">
            <div class="bg-black/30 p-4 rounded-lg backdrop-blur-sm">🃏</div>
            <div class="bg-black/30 p-4 rounded-lg backdrop-blur-sm">🎲</div>
            <div class="bg-black/30 p-4 rounded-lg backdrop-blur-sm">🎯</div>
          </div>
        </div>
      </div>
      <!-- 부유하는 요소들 -->
      <div class="absolute top-20 left-10 text-3xl animate-float">💰</div>
      <div class="absolute top-40 right-20 text-2xl animate-float-delay">🎪</div>
      <div class="absolute bottom-32 left-16 text-4xl animate-float-slow">🎮</div>
      <div class="absolute bottom-20 right-12 text-3xl animate-float-delay-slow">⭐</div>
    </div>

    <!-- 오른쪽 폼 영역 -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="max-w-md w-full space-y-8">
    <!-- 로고 및 헤더 -->
    <div class="text-center">
      <a href="/" class="text-4xl font-bold text-casino-gold text-glow">
        🎰 LuckyMesh
      </a>
      <h2 class="mt-6 text-3xl font-bold text-white">
        계정에 로그인하세요
      </h2>
      <p class="mt-2 text-sm text-gray-400">
        아직 계정이 없으신가요?
        <a href="/signup" class="text-casino-gold hover:text-yellow-400 transition-colors duration-200">
          회원가입하기
        </a>
      </p>
    </div>

    <!-- 로그인 폼 -->
    <div class="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-casino-gold/20">
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        <!-- 전역 메시지 -->
        {#if errorMessage}
          <div class="bg-casino-red/20 border border-casino-red/50 rounded-lg p-4">
            <div class="flex items-center">
              <span class="text-casino-red mr-2">❌</span>
              <span class="text-casino-red text-sm">{errorMessage}</span>
            </div>
          </div>
        {/if}

        {#if successMessage}
          <div class="bg-casino-green/20 border border-casino-green/50 rounded-lg p-4">
            <div class="flex items-center">
              <span class="text-casino-green mr-2">✅</span>
              <span class="text-casino-green text-sm">{successMessage}</span>
            </div>
          </div>
        {/if}

        <!-- 이메일 입력 -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
            이메일 주소
          </label>
          <input
            id="email"
            type="email"
            bind:value={email}
            on:keypress={handleKeyPress}
            class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
            placeholder="example@email.com"
            required
          />
          {#if formErrors.email}
            <p class="mt-1 text-sm text-casino-red">{formErrors.email}</p>
          {/if}
        </div>

        <!-- 비밀번호 입력 -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            bind:value={password}
            on:keypress={handleKeyPress}
            class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
            placeholder="••••••••"
            required
          />
          {#if formErrors.password}
            <p class="mt-1 text-sm text-casino-red">{formErrors.password}</p>
          {/if}
        </div>

        <!-- 추가 옵션 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-casino-gold border-gray-600 rounded bg-gray-900 focus:ring-casino-gold"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-300">
              로그인 상태 유지
            </label>
          </div>

          <div class="text-sm">
            <a href="/forgot-password" class="text-casino-gold hover:text-yellow-400 transition-colors duration-200">
              비밀번호를 잊으셨나요?
            </a>
          </div>
        </div>

        <!-- 로그인 버튼 -->
        <button
          type="submit"
          disabled={$isLoading}
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-casino-gold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-casino-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {#if $isLoading}
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              로그인 중...
            </div>
          {:else}
            로그인
          {/if}
        </button>

        <!-- 소셜 로그인 (미래 확장용) -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-black text-gray-400">또는</span>
            </div>
          </div>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-400">
              소셜 로그인 기능은 곧 제공될 예정입니다.
            </p>
          </div>
        </div>
      </form>
    </div>

    <!-- 안전성 알림 -->
    <div class="text-center">
      <div class="flex items-center justify-center space-x-4 text-sm text-gray-400">
        <div class="flex items-center">
          <span class="mr-1">🛡️</span>
          <span>SSL 보안</span>
        </div>
        <div class="flex items-center">
          <span class="mr-1">🔒</span>
          <span>개인정보 보호</span>
        </div>
      </div>
        <p class="mt-2 text-xs text-gray-500">
          18세 이상 이용 가능 | 책임감 있는 게임 문화를 만들어갑니다.
        </p>
      </div>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

  @keyframes float-delay {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(-3deg); }
  }

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-25px) rotate(8deg); }
  }

  :global(.animate-float) {
    animation: float 3s ease-in-out infinite;
  }

  :global(.animate-float-delay) {
    animation: float-delay 4s ease-in-out infinite;
  }

  :global(.animate-float-slow) {
    animation: float-slow 5s ease-in-out infinite;
  }

  :global(.animate-float-delay-slow) {
    animation: float-delay 6s ease-in-out infinite;
  }
</style>