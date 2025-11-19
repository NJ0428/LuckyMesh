<script>
  import { page } from '$app/stores';
  import { user, isAuthenticated, logout } from '$lib/stores/auth.js';

  let mobileMenuOpen = false;
  let userMenuOpen = false;

  const navItems = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/blackjack', label: '블랙잭', icon: '🃏' },
    { href: '/baccarat', label: '바카라', icon: '♠️' },
    { href: '/roulette', label: '룰렛', icon: '🎰' },
    { href: '/slots', label: '슬롯', icon: '🍒' }
  ];

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    userMenuOpen = false;
  }

  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
    mobileMenuOpen = false;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function closeUserMenu() {
    userMenuOpen = false;
  }

  async function handleLogout() {
    const result = await logout();
    if (result.success) {
      closeUserMenu();
      closeMobileMenu();
    }
  }

  // 클릭 외부 영역에서 메뉴 닫기
  function handleClickOutside(event) {
    if (!event.target.closest('.user-menu-container')) {
      closeUserMenu();
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<nav class="glass-card sticky top-0 z-50 border-b border-white/20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- 로고 -->
      <div class="flex items-center space-x-2">
        <span class="text-2xl">🌸</span>
        <a href="/" class="font-playfair font-bold text-xl pastel-gradient-text">
          럭키메시 카지노
        </a>
      </div>

      <!-- 데스크톱 네비게이션 -->
      <div class="hidden md:flex items-center space-x-8">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-gray-700 hover:text-primary-soft-purple transition-colors duration-200 font-poppins font-medium flex items-center gap-2
                   {$page.url.pathname === item.href
                     ? 'text-primary-soft-pink font-semibold'
                     : ''}"
            on:click={closeMobileMenu}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        {/each}
      </div>

      <!-- 로그인/가입 버튼 또는 사용자 메뉴 -->
      <div class="hidden md:flex items-center space-x-4">
        {#if $isAuthenticated && $user}
          <!-- 로그인된 사용자 메뉴 -->
          <div class="relative user-menu-container">
            <button
              on:click={toggleUserMenu}
              class="flex items-center space-x-3 text-gray-700 hover:text-primary-soft-purple transition-colors duration-200 glass-card px-4 py-2"
            >
              <div class="w-8 h-8 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
                {$user.username.charAt(0).toUpperCase()}
              </div>
              <div class="text-left">
                <div class="text-sm font-semibold font-poppins">{$user.username}</div>
                <div class="text-xs text-gray-500">₩{$user.balance.toLocaleString()}</div>
              </div>
              <svg class="w-4 h-4 transition-transform duration-200 {userMenuOpen ? 'rotate-180' : ''}" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </button>

            <!-- 드롭다운 메뉴 -->
            {#if userMenuOpen}
              <div class="absolute right-0 mt-2 w-64 glass-card shadow-xl z-50">
                <div class="px-4 py-3 border-b border-white/20">
                  <div class="text-primary-soft-pink font-semibold font-poppins">{$user.fullName}</div>
                  <div class="text-gray-500 text-sm">{$user.email}</div>
                </div>

                <div class="py-2">
                  <a href="/profile" class="block px-4 py-2 text-sm text-gray-600 hover:bg-white/20 hover:text-primary-soft-purple transition-colors duration-200 font-poppins">
                    👤 내 프로필
                  </a>
                  <a href="/balance" class="block px-4 py-2 text-sm text-gray-600 hover:bg-white/20 hover:text-primary-soft-purple transition-colors duration-200 font-poppins">
                    💰 잔액 관리
                  </a>
                  <a href="/payment" class="block px-4 py-2 text-sm text-gray-600 hover:bg-white/20 hover:text-primary-soft-purple transition-colors duration-200 font-poppins">
                    💳 결제/충전
                  </a>
                  <a href="/history" class="block px-4 py-2 text-sm text-gray-600 hover:bg-white/20 hover:text-primary-soft-purple transition-colors duration-200 font-poppins">
                    📊 게임 기록
                  </a>
                  <a href="/settings" class="block px-4 py-2 text-sm text-gray-600 hover:bg-white/20 hover:text-primary-soft-purple transition-colors duration-200 font-poppins">
                    ⚙️ 설정
                  </a>
                </div>

                <div class="border-t border-white/20 py-2">
                  <button
                    on:click={handleLogout}
                    class="block w-full text-left px-4 py-2 text-sm text-accent-coral hover:bg-accent-coral/20 transition-colors duration-200 font-poppins"
                  >
                    🚪 로그아웃
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- 비로그인 상태 -->
          <a href="/login" class="px-4 py-2 text-gray-700 hover:text-primary-soft-purple transition-colors font-poppins">로그인</a>
          <a href="/signup" class="px-6 py-2 bg-gradient-to-r from-primary-soft-pink to-primary-soft-purple text-white rounded-full hover:shadow-lg transition-all hover:scale-105 font-poppins font-semibold">
            회원가입
          </a>
        {/if}
      </div>

      <!-- 모바일 메뉴 버튼 -->
      <div class="md:hidden">
        <button
          on:click={toggleMobileMenu}
          class="text-white hover:text-casino-gold focus:outline-none focus:text-casino-gold transition-colors duration-200"
        >
          <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
            {#if !mobileMenuOpen}
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            {:else}
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- 모바일 메뉴 -->
  {#if mobileMenuOpen}
    <div class="md:hidden bg-black/95 backdrop-blur-sm">
      <div class="px-2 pt-2 pb-3 space-y-1">
        {#each navItems as item}
          <a
            href={item.href}
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                   {$page.url.pathname === item.href
                     ? 'bg-casino-gold text-black'
                     : 'text-white hover:bg-casino-gold/20 hover:text-casino-gold'}"
            on:click={closeMobileMenu}
          >
            <span class="mr-2">{item.icon}</span>
            {item.label}
          </a>
        {/each}

        <div class="pt-4 pb-2 border-t border-casino-gold/20">
          {#if $isAuthenticated && $user}
            <!-- 로그인된 사용자 - 모바일 -->
            <div class="mx-3 mb-4">
              <div class="flex items-center space-x-3 bg-gray-900/50 rounded-lg p-3">
                <div class="w-10 h-10 bg-casino-gold rounded-full flex items-center justify-center text-black font-bold">
                  {$user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="text-white font-semibold">{$user.username}</div>
                  <div class="text-casino-gold text-sm">₩{$user.balance.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div class="space-y-1 mx-3">
              <a href="/profile" class="block px-3 py-2 rounded-md text-white hover:bg-casino-gold/20 hover:text-casino-gold transition-colors duration-200">
                👤 내 프로필
              </a>
              <a href="/balance" class="block px-3 py-2 rounded-md text-white hover:bg-casino-gold/20 hover:text-casino-gold transition-colors duration-200">
                💰 잔액 관리
              </a>
              <a href="/payment" class="block px-3 py-2 rounded-md text-white hover:bg-casino-gold/20 hover:text-casino-gold transition-colors duration-200">
                💳 결제/충전
              </a>
              <a href="/history" class="block px-3 py-2 rounded-md text-white hover:bg-casino-gold/20 hover:text-casino-gold transition-colors duration-200">
                📊 게임 기록
              </a>
              <a href="/settings" class="block px-3 py-2 rounded-md text-white hover:bg-casino-gold/20 hover:text-casino-gold transition-colors duration-200">
                ⚙️ 설정
              </a>
              <button
                on:click={handleLogout}
                class="block w-full text-left px-3 py-2 rounded-md text-casino-red hover:bg-casino-red/20 transition-colors duration-200"
              >
                🚪 로그아웃
              </button>
            </div>
          {:else}
            <!-- 비로그인 상태 - 모바일 -->
            <div class="flex flex-col space-y-2 mx-3">
              <a href="/login" class="btn-secondary text-sm text-center">로그인</a>
              <a href="/signup" class="btn-primary text-sm text-center">회원가입</a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</nav>