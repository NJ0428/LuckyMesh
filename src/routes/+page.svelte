<script>
  import { games } from '$lib/data/games.js';
  import GameCard from '$lib/components/GameCard.svelte';
  import FloatingElements from '$lib/components/FloatingElements.svelte';
  import PastelButton from '$lib/components/PastelButton.svelte';
  import PastelCard from '$lib/components/PastelCard.svelte';

  // 히어로 섹션의 통계
  const stats = [
    { label: '게임 종류', value: '5+', icon: '🎮' },
    { label: '최고 환원율', value: '99.5%', icon: '💎' },
    { label: '24시간 지원', value: '365일', icon: '🎧' },
    { label: '안전한 게임', value: '100%', icon: '🛡️' }
  ];

  // 프로모션 정보 (파스텔 테마용으로 제거 - 직접 HTML에서 구현)
</script>

<svelte:head>
  <title>럭키메시 카지노 - 프리미엄 온라인 카지노</title>
  <meta name="description" content="블랙잭, 바카라, 룰렛 등 최고의 카지노 게임을 경험하세요. 안전하고 공정한 게임 환경을 제공합니다." />
</svelte:head>

<!-- Floating Background Elements -->
<FloatingElements count={8} />

<!-- 히어로 섹션 -->
<section class="relative py-20 overflow-hidden">
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
    <div class="mb-8">
      <h1 class="text-6xl md:text-8xl font-playfair font-bold mb-6">
        <span class="pastel-gradient-text">
          🌸 럭키메시 카지노
        </span>
      </h1>
      <p class="text-2xl md:text-3xl text-gray-600 mb-8 font-poppins">
        파스텔 드림 카지노에서 특별한 경험을 만나보세요
      </p>
      <div class="flex flex-col sm:flex-row gap-6 justify-center">
        <PastelButton size="lg" glow={true}>🌟 지금 시작하기</PastelButton>
        <PastelButton variant="secondary" size="lg">🎮 게임 둘러보기</PastelButton>
      </div>
    </div>

    <!-- 통계 섹션 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
      {#each stats as stat}
        <PastelCard hover={true}>
          <div class="text-center">
            <div class="text-4xl mb-3">{stat.icon}</div>
            <div class="text-3xl font-bold pastel-gradient-text">{stat.value}</div>
            <div class="text-gray-600 font-poppins">{stat.label}</div>
          </div>
        </PastelCard>
      {/each}
    </div>
  </div>
</section>

<!-- 게임 섹션 -->
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-5xl font-playfair font-bold mb-4 pastel-gradient-text">
        ✨ 인기 게임
      </h2>
      <p class="text-xl text-gray-600 font-poppins">파스텔 드림에서 만나는 클래식 카지노 게임들</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each games as game, index}
        <GameCard {game} featured={index === 0} />
      {/each}
    </div>
  </div>
</section>

<!-- 프로모션 섹션 -->
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-5xl font-playfair font-bold mb-4 bg-gradient-to-r from-primary-soft-purple to-primary-soft-blue bg-clip-text text-transparent">
        🌈 특별 혜택
      </h2>
      <p class="text-xl text-gray-600 font-poppins">파스텔 드림만의 독점 프로모션</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <PastelCard 
        gradient={true} 
        gradientFrom="pastel-pink"
        gradientTo="pastel-peach"
        padding="p-8"
        hover={true}
      >
        <div class="text-center">
          <div class="text-5xl mb-4">🎁</div>
          <h3 class="text-2xl font-playfair font-bold text-gray-800 mb-3">신규 가입 보너스</h3>
          <p class="text-gray-700 mb-4 font-poppins">첫 입금 시 100% 매칭 보너스</p>
          <div class="text-3xl font-bold text-white mb-6">최대 50만원</div>
          <PastelButton variant="secondary">자세히 보기</PastelButton>
        </div>
      </PastelCard>

      <PastelCard 
        gradient={true} 
        gradientFrom="pastel-mint"
        gradientTo="pastel-cream"
        padding="p-8"
        hover={true}
      >
        <div class="text-center">
          <div class="text-5xl mb-4">💰</div>
          <h3 class="text-2xl font-playfair font-bold text-gray-800 mb-3">주간 캐시백</h3>
          <p class="text-gray-700 mb-4 font-poppins">매주 월요일 손실 금액의 10% 환급</p>
          <div class="text-3xl font-bold text-white mb-6">최대 10만원</div>
          <PastelButton variant="secondary">자세히 보기</PastelButton>
        </div>
      </PastelCard>

      <PastelCard 
        gradient={true} 
        gradientFrom="pastel-peach"
        gradientTo="pastel-sky"
        padding="p-8"
        hover={true}
      >
        <div class="text-center">
          <div class="text-5xl mb-4">👑</div>
          <h3 class="text-2xl font-playfair font-bold text-gray-800 mb-3">VIP 프로그램</h3>
          <p class="text-gray-700 mb-4 font-poppins">레벨업할수록 더 많은 혜택</p>
          <div class="text-3xl font-bold text-white mb-6">독점 혜택</div>
          <PastelButton variant="secondary">자세히 보기</PastelButton>
        </div>
      </PastelCard>
    </div>
  </div>
</section>

<!-- 안전성 섹션 -->
<section class="py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-4xl font-playfair font-bold pastel-gradient-text mb-6">안전하고 공정한 게임</h2>
        <p class="text-xl text-gray-600 mb-8 font-poppins">
          럭키메시 카지노는 플레이어의 안전과 공정한 게임 환경을 최우선으로 생각합니다.
          모든 게임은 엄격한 검증을 통과하였으며, 개인정보는 최고 수준의 보안으로 보호됩니다.
        </p>

        <div class="grid grid-cols-2 gap-6">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🛡️</span>
            <div>
              <div class="font-semibold text-primary-soft-pink">SSL 암호화</div>
              <div class="text-gray-500 text-sm font-poppins">최고 수준 보안</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-2xl">✅</span>
            <div>
              <div class="font-semibold text-primary-soft-mint">공정게임 인증</div>
              <div class="text-gray-500 text-sm font-poppins">제3자 검증 완료</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🔒</span>
            <div>
              <div class="font-semibold text-primary-soft-purple">개인정보 보호</div>
              <div class="text-gray-500 text-sm font-poppins">GDPR 준수</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🎧</span>
            <div>
              <div class="font-semibold text-primary-soft-blue">24시간 지원</div>
              <div class="text-gray-500 text-sm font-poppins">연중무휴 고객서비스</div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <div class="glass-card p-8">
          <div class="text-6xl mb-4">🏆</div>
          <h3 class="text-2xl font-playfair font-bold pastel-gradient-text mb-4">업계 최고 등급</h3>
          <p class="text-gray-600 mb-6 font-poppins">
            국제 게임 인증 기관으로부터 최고 등급을 받은 신뢰할 수 있는 카지노입니다.
          </p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-white/40 rounded-lg p-3">
              <div class="font-semibold text-primary-soft-pink">라이선스</div>
              <div class="text-gray-600 font-poppins">Malta Gaming Authority</div>
            </div>
            <div class="bg-white/40 rounded-lg p-3">
              <div class="font-semibold text-primary-soft-mint">인증</div>
              <div class="text-gray-600 font-poppins">eCOGRA 승인</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA 섹션 -->
<section class="py-20">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <PastelCard padding="p-12">
      <h2 class="text-4xl font-playfair font-bold mb-6 pastel-gradient-text">
        🌸 지금 파스텔 드림과 함께 시작하세요
      </h2>
      <p class="text-xl text-gray-600 mb-8 font-poppins">
        신규 회원 가입 시 특별 보너스와 함께 꿈같은 카지노 경험을 시작하실 수 있습니다.
      </p>
      <div class="flex flex-col sm:flex-row gap-6 justify-center">
        <PastelButton size="lg" glow={true}>
          ✨ 무료 회원가입
        </PastelButton>
        <PastelButton variant="secondary" size="lg">
          🎮 게임 체험하기
        </PastelButton>
      </div>
    </PastelCard>
  </div>
</section>