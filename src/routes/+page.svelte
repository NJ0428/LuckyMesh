<script>
  import { games } from '$lib/data/games.js';
  import GameCard from '$lib/components/GameCard.svelte';

  // 히어로 섹션의 통계
  const stats = [
    { label: '게임 종류', value: '3+', icon: '🎮' },
    { label: '최고 환원율', value: '99.5%', icon: '💎' },
    { label: '24시간 지원', value: '365일', icon: '🎧' },
    { label: '안전한 게임', value: '100%', icon: '🛡️' }
  ];

  // 프로모션 정보
  const promotions = [
    {
      title: '신규 가입 보너스',
      description: '첫 입금 시 100% 매칭 보너스',
      bonus: '최대 50만원',
      color: 'from-casino-gold to-yellow-600'
    },
    {
      title: '주간 캐시백',
      description: '매주 월요일 손실 금액의 10% 환급',
      bonus: '최대 10만원',
      color: 'from-casino-red to-red-600'
    },
    {
      title: 'VIP 프로그램',
      description: '레벨업할수록 더 많은 혜택',
      bonus: '독점 혜택',
      color: 'from-purple-600 to-purple-800'
    }
  ];
</script>

<svelte:head>
  <title>LuckyMesh Casino - 프리미엄 온라인 카지노</title>
  <meta name="description" content="블랙잭, 바카라, 룰렛 등 최고의 카지노 게임을 경험하세요. 안전하고 공정한 게임 환경을 제공합니다." />
</svelte:head>

<!-- 히어로 섹션 -->
<section class="relative bg-gradient-to-br from-casino-dark via-gray-900 to-black py-20">
  <div class="absolute inset-0 bg-black/30"></div>
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <div class="mb-8">
      <h1 class="text-5xl md:text-7xl font-bold text-casino-gold text-glow mb-4">
        🎰 LuckyMesh Casino
      </h1>
      <p class="text-xl md:text-2xl text-gray-300 mb-8">
        프리미엄 온라인 카지노에서 최고의 게임 경험을 만나보세요
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button class="btn-primary text-lg px-8 py-4">지금 시작하기</button>
        <button class="btn-secondary text-lg px-8 py-4">게임 둘러보기</button>
      </div>
    </div>

    <!-- 통계 섹션 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
      {#each stats as stat}
        <div class="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-casino-gold/20">
          <div class="text-3xl mb-2">{stat.icon}</div>
          <div class="text-2xl font-bold text-casino-gold">{stat.value}</div>
          <div class="text-gray-300 text-sm">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 게임 섹션 -->
<section class="py-20 bg-gradient-to-b from-casino-dark to-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-bold text-casino-gold mb-4">인기 게임</h2>
      <p class="text-xl text-gray-300">전 세계적으로 사랑받는 클래식 카지노 게임들</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each games as game, index}
        <GameCard {game} featured={index === 0} />
      {/each}
    </div>
  </div>
</section>

<!-- 프로모션 섹션 -->
<section class="py-20 bg-black">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-4xl font-bold text-casino-gold mb-4">특별 혜택</h2>
      <p class="text-xl text-gray-300">LuckyMesh만의 독점 프로모션을 만나보세요</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each promotions as promo}
        <div class="bg-gradient-to-br {promo.color} rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
          <h3 class="text-2xl font-bold text-white mb-3">{promo.title}</h3>
          <p class="text-white/90 mb-4">{promo.description}</p>
          <div class="text-3xl font-bold text-white text-glow mb-4">{promo.bonus}</div>
          <button class="bg-white text-gray-900 font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition-colors duration-200">
            자세히 보기
          </button>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- 안전성 섹션 -->
<section class="py-20 bg-gradient-to-r from-casino-dark to-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 class="text-4xl font-bold text-casino-gold mb-6">안전하고 공정한 게임</h2>
        <p class="text-xl text-gray-300 mb-8">
          LuckyMesh Casino는 플레이어의 안전과 공정한 게임 환경을 최우선으로 생각합니다.
          모든 게임은 엄격한 검증을 통과하였으며, 개인정보는 최고 수준의 보안으로 보호됩니다.
        </p>

        <div class="grid grid-cols-2 gap-6">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🛡️</span>
            <div>
              <div class="font-semibold text-casino-gold">SSL 암호화</div>
              <div class="text-gray-400 text-sm">최고 수준 보안</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-2xl">✅</span>
            <div>
              <div class="font-semibold text-casino-gold">공정게임 인증</div>
              <div class="text-gray-400 text-sm">제3자 검증 완료</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🔒</span>
            <div>
              <div class="font-semibold text-casino-gold">개인정보 보호</div>
              <div class="text-gray-400 text-sm">GDPR 준수</div>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🎧</span>
            <div>
              <div class="font-semibold text-casino-gold">24시간 지원</div>
              <div class="text-gray-400 text-sm">연중무휴 고객서비스</div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <div class="bg-gradient-to-br from-casino-gold/20 to-casino-red/20 rounded-2xl p-8 backdrop-blur-sm border border-casino-gold/30">
          <div class="text-6xl mb-4">🏆</div>
          <h3 class="text-2xl font-bold text-casino-gold mb-4">업계 최고 등급</h3>
          <p class="text-gray-300 mb-6">
            국제 게임 인증 기관으로부터 최고 등급을 받은 신뢰할 수 있는 카지노입니다.
          </p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-black/40 rounded-lg p-3">
              <div class="font-semibold text-casino-gold">라이선스</div>
              <div class="text-gray-300">Malta Gaming Authority</div>
            </div>
            <div class="bg-black/40 rounded-lg p-3">
              <div class="font-semibold text-casino-gold">인증</div>
              <div class="text-gray-300">eCOGRA 승인</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA 섹션 -->
<section class="py-20 bg-gradient-to-r from-casino-gold via-yellow-600 to-casino-gold text-black">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-4xl font-bold mb-4">지금 LuckyMesh와 함께 시작하세요</h2>
    <p class="text-xl mb-8 text-black/80">
      신규 회원 가입 시 특별 보너스와 함께 최고의 카지노 경험을 시작하실 수 있습니다.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button class="bg-black text-casino-gold font-bold py-4 px-8 rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg">
        무료 회원가입
      </button>
      <button class="bg-transparent border-2 border-black text-black font-bold py-4 px-8 rounded-lg hover:bg-black hover:text-casino-gold transition-all duration-200 text-lg">
        게임 체험하기
      </button>
    </div>
  </div>
</section>