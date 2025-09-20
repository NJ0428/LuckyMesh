<script>
  import { register, isLoading } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';

  let formData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    dateOfBirth: ''
  };

  let errorMessage = '';
  let successMessage = '';
  let formErrors = {};
  let agreeToTerms = false;
  let agreeToPrivacy = false;
  let agreeToMarketing = false;

  function validateForm() {
    formErrors = {};

    // 사용자명 검증
    if (!formData.username) {
      formErrors.username = '사용자명을 입력해주세요.';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      formErrors.username = '사용자명은 3-20자 사이여야 합니다.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      formErrors.username = '사용자명은 영문, 숫자, 밑줄(_)만 사용 가능합니다.';
    }

    // 이메일 검증
    if (!formData.email) {
      formErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 비밀번호 검증
    if (!formData.password) {
      formErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      formErrors.password = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      formErrors.password = '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.';
    }

    // 비밀번호 확인
    if (!formData.confirmPassword) {
      formErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    // 이름 검증
    if (!formData.fullName) {
      formErrors.fullName = '이름을 입력해주세요.';
    } else if (formData.fullName.length < 2 || formData.fullName.length > 50) {
      formErrors.fullName = '이름은 2-50자 사이여야 합니다.';
    }

    // 전화번호 검증 (선택사항)
    if (formData.phone && !/^[0-9-+\s()]+$/.test(formData.phone)) {
      formErrors.phone = '올바른 전화번호 형식이 아닙니다.';
    }

    // 생년월일 검증 (선택사항)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 18) {
        formErrors.dateOfBirth = '18세 이상만 가입할 수 있습니다.';
      }

      if (age > 100) {
        formErrors.dateOfBirth = '올바른 생년월일을 입력해주세요.';
      }
    }

    // 약관 동의 확인
    if (!agreeToTerms) {
      formErrors.terms = '이용약관에 동의해주세요.';
    }

    if (!agreeToPrivacy) {
      formErrors.privacy = '개인정보처리방침에 동의해주세요.';
    }

    return Object.keys(formErrors).length === 0;
  }

  function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', color: 'text-casino-red', text: '약함' };
    if (strength <= 3) return { level: 'medium', color: 'text-yellow-400', text: '보통' };
    if (strength <= 4) return { level: 'good', color: 'text-casino-green', text: '좋음' };
    return { level: 'strong', color: 'text-casino-green', text: '강함' };
  }

  $: passwordStrength = getPasswordStrength(formData.password);

  async function handleSignup() {
    if (!validateForm()) return;

    errorMessage = '';
    successMessage = '';

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone || null,
      dateOfBirth: formData.dateOfBirth || null
    });

    if (result.success) {
      successMessage = result.message;
      setTimeout(() => {
        goto('/login');
      }, 2000);
    } else {
      errorMessage = result.error;
    }
  }
</script>

<svelte:head>
  <title>회원가입 - LuckyMesh Casino</title>
  <meta name="description" content="LuckyMesh Casino에 가입하여 최고의 카지노 게임을 즐겨보세요. 신규 회원 특별 혜택을 놓치지 마세요!" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-casino-dark via-gray-900 to-black">
  <div class="flex min-h-screen">
    <!-- 왼쪽 그림 영역 -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-casino-gold/20 via-purple-900/30 to-red-900/20"></div>
      <div class="relative z-10 flex items-center justify-center w-full">
        <div class="text-center space-y-8 p-12">
          <!-- 회원가입 테마 아이콘들 -->
          <div class="text-8xl mb-8 animate-bounce">🎁</div>
          <h1 class="text-6xl font-bold text-casino-gold text-glow mb-6">
            Welcome!
          </h1>
          <p class="text-2xl text-white font-light mb-8">
            새로운 모험의 시작
          </p>
          <div class="text-xl text-gray-300 mb-8">
            🌟 가입 즉시 50만원 보너스 🌟
          </div>
          <div class="flex justify-center space-x-8 text-5xl mb-8">
            <span class="animate-pulse">💎</span>
            <span class="animate-pulse delay-75">🏆</span>
            <span class="animate-pulse delay-150">🎉</span>
            <span class="animate-pulse delay-300">💰</span>
          </div>
          <div class="grid grid-cols-2 gap-4 mt-12 text-sm text-gray-300">
            <div class="bg-black/30 p-4 rounded-lg backdrop-blur-sm">
              <div class="text-3xl mb-2">🎮</div>
              <div class="font-semibold">다양한 게임</div>
            </div>
            <div class="bg-black/30 p-4 rounded-lg backdrop-blur-sm">
              <div class="text-3xl mb-2">🔒</div>
              <div class="font-semibold">안전한 거래</div>
            </div>
            <div class="bg-black/30 p-4 rounded-lg backdrop-blur-sm">
              <div class="text-3xl mb-2">🎯</div>
              <div class="font-semibold">공정한 게임</div>
            </div>
            <div class="bg-black/30 p-4 rounded-lg backdrop-blur-sm">
              <div class="text-3xl mb-2">⭐</div>
              <div class="font-semibold">VIP 혜택</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 부유하는 요소들 -->
      <div class="absolute top-20 left-10 text-3xl animate-float">🎁</div>
      <div class="absolute top-40 right-20 text-2xl animate-float-delay">💎</div>
      <div class="absolute bottom-32 left-16 text-4xl animate-float-slow">🏆</div>
      <div class="absolute bottom-20 right-12 text-3xl animate-float-delay-slow">🌟</div>
    </div>

    <!-- 오른쪽 폼 영역 -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="max-w-2xl w-full py-8">
    <!-- 로고 및 헤더 -->
    <div class="text-center mb-8">
      <a href="/" class="text-4xl font-bold text-casino-gold text-glow">
        🎰 LuckyMesh
      </a>
      <h2 class="mt-6 text-3xl font-bold text-white">
        새로운 계정 만들기
      </h2>
      <p class="mt-2 text-sm text-gray-400">
        이미 계정이 있으신가요?
        <a href="/login" class="text-casino-gold hover:text-yellow-400 transition-colors duration-200">
          로그인하기
        </a>
      </p>
    </div>

    <!-- 회원가입 폼 -->
    <div class="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-casino-gold/20">
      <form on:submit|preventDefault={handleSignup} class="space-y-6">
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

        <!-- 기본 정보 -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-casino-gold">기본 정보</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 사용자명 -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
                사용자명 *
              </label>
              <input
                id="username"
                type="text"
                bind:value={formData.username}
                class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
                placeholder="username123"
                required
              />
              {#if formErrors.username}
                <p class="mt-1 text-sm text-casino-red">{formErrors.username}</p>
              {/if}
            </div>

            <!-- 이름 -->
            <div>
              <label for="fullName" class="block text-sm font-medium text-gray-300 mb-2">
                이름 *
              </label>
              <input
                id="fullName"
                type="text"
                bind:value={formData.fullName}
                class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
                placeholder="홍길동"
                required
              />
              {#if formErrors.fullName}
                <p class="mt-1 text-sm text-casino-red">{formErrors.fullName}</p>
              {/if}
            </div>
          </div>

          <!-- 이메일 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
              이메일 주소 *
            </label>
            <input
              id="email"
              type="email"
              bind:value={formData.email}
              class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
              placeholder="example@email.com"
              required
            />
            {#if formErrors.email}
              <p class="mt-1 text-sm text-casino-red">{formErrors.email}</p>
            {/if}
          </div>

          <!-- 비밀번호 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
              비밀번호 *
            </label>
            <input
              id="password"
              type="password"
              bind:value={formData.password}
              class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
              placeholder="••••••••"
              required
            />
            {#if formData.password}
              <div class="mt-2 flex items-center justify-between">
                <span class="text-sm text-gray-400">비밀번호 강도:</span>
                <span class="text-sm {passwordStrength.color} font-semibold">{passwordStrength.text}</span>
              </div>
            {/if}
            {#if formErrors.password}
              <p class="mt-1 text-sm text-casino-red">{formErrors.password}</p>
            {/if}
            <p class="mt-1 text-xs text-gray-400">대소문자, 숫자, 특수문자를 포함한 8자 이상</p>
          </div>

          <!-- 비밀번호 확인 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-300 mb-2">
              비밀번호 확인 *
            </label>
            <input
              id="confirmPassword"
              type="password"
              bind:value={formData.confirmPassword}
              class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
              placeholder="••••••••"
              required
            />
            {#if formErrors.confirmPassword}
              <p class="mt-1 text-sm text-casino-red">{formErrors.confirmPassword}</p>
            {/if}
          </div>
        </div>

        <!-- 추가 정보 -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-casino-gold">추가 정보 (선택사항)</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 전화번호 -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
                전화번호
              </label>
              <input
                id="phone"
                type="tel"
                bind:value={formData.phone}
                class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
                placeholder="010-1234-5678"
              />
              {#if formErrors.phone}
                <p class="mt-1 text-sm text-casino-red">{formErrors.phone}</p>
              {/if}
            </div>

            <!-- 생년월일 -->
            <div>
              <label for="dateOfBirth" class="block text-sm font-medium text-gray-300 mb-2">
                생년월일
              </label>
              <input
                id="dateOfBirth"
                type="date"
                bind:value={formData.dateOfBirth}
                class="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-casino-gold focus:ring-1 focus:ring-casino-gold transition-colors duration-200"
              />
              {#if formErrors.dateOfBirth}
                <p class="mt-1 text-sm text-casino-red">{formErrors.dateOfBirth}</p>
              {/if}
              <p class="mt-1 text-xs text-gray-400">18세 이상만 가입 가능합니다</p>
            </div>
          </div>
        </div>

        <!-- 약관 동의 -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-casino-gold">약관 동의</h3>

          <div class="space-y-3">
            <div class="flex items-start">
              <input
                id="agreeToTerms"
                type="checkbox"
                bind:checked={agreeToTerms}
                class="mt-1 h-4 w-4 text-casino-gold border-gray-600 rounded bg-gray-900 focus:ring-casino-gold"
              />
              <label for="agreeToTerms" class="ml-3 text-sm text-gray-300">
                <span class="text-casino-red">*</span>
                <a href="/terms" class="text-casino-gold hover:text-yellow-400 underline">이용약관</a>에 동의합니다
              </label>
            </div>
            {#if formErrors.terms}
              <p class="text-sm text-casino-red ml-7">{formErrors.terms}</p>
            {/if}

            <div class="flex items-start">
              <input
                id="agreeToPrivacy"
                type="checkbox"
                bind:checked={agreeToPrivacy}
                class="mt-1 h-4 w-4 text-casino-gold border-gray-600 rounded bg-gray-900 focus:ring-casino-gold"
              />
              <label for="agreeToPrivacy" class="ml-3 text-sm text-gray-300">
                <span class="text-casino-red">*</span>
                <a href="/privacy" class="text-casino-gold hover:text-yellow-400 underline">개인정보처리방침</a>에 동의합니다
              </label>
            </div>
            {#if formErrors.privacy}
              <p class="text-sm text-casino-red ml-7">{formErrors.privacy}</p>
            {/if}

            <div class="flex items-start">
              <input
                id="agreeToMarketing"
                type="checkbox"
                bind:checked={agreeToMarketing}
                class="mt-1 h-4 w-4 text-casino-gold border-gray-600 rounded bg-gray-900 focus:ring-casino-gold"
              />
              <label for="agreeToMarketing" class="ml-3 text-sm text-gray-300">
                마케팅 정보 수신에 동의합니다 (선택)
              </label>
            </div>
          </div>
        </div>

        <!-- 가입 버튼 -->
        <button
          type="submit"
          disabled={$isLoading}
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-casino-gold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-casino-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {#if $isLoading}
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              가입 처리 중...
            </div>
          {:else}
            계정 만들기
          {/if}
        </button>
      </form>
    </div>

    <!-- 안전성 및 혜택 알림 -->
    <div class="mt-8 text-center">
      <div class="bg-black/30 rounded-xl p-6 border border-casino-gold/20">
        <h4 class="text-lg font-semibold text-casino-gold mb-4">🎁 신규 회원 혜택</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div>
            <div class="text-2xl mb-2">💰</div>
            <div class="font-semibold">가입 보너스</div>
            <div>50만원 매칭 보너스</div>
          </div>
          <div>
            <div class="text-2xl mb-2">🎯</div>
            <div class="font-semibold">무료 게임</div>
            <div>체험용 크레딧 제공</div>
          </div>
          <div>
            <div class="text-2xl mb-2">🏆</div>
            <div class="font-semibold">VIP 혜택</div>
            <div>레벨업 보상 시스템</div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center space-x-4 text-sm text-gray-400 mt-4">
        <div class="flex items-center">
          <span class="mr-1">🛡️</span>
          <span>SSL 보안</span>
        </div>
        <div class="flex items-center">
          <span class="mr-1">🔒</span>
          <span>개인정보 보호</span>
        </div>
        <div class="flex items-center">
          <span class="mr-1">✅</span>
          <span>공정게임 인증</span>
        </div>
        </div>
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