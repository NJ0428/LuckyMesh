<script>
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    게임: [
      { label: '블랙잭', href: '/blackjack' },
      { label: '바카라', href: '/baccarat' },
      { label: '룰렛', href: '/roulette' }
    ],
    정보: [
      { label: '이용약관', href: '/terms' },
      { label: '개인정보처리방침', href: '/privacy' },
      { label: '책임감 있는 게임', href: '/responsible-gaming' }
    ],
    고객지원: [
      { label: 'FAQ', href: '/faq' },
      { label: '고객센터', href: '/support' },
      { label: '라이브 채팅', href: '/chat' }
    ]
  };

  const socialLinks = [
    { label: '페이스북', href: '#', icon: '📘' },
    { label: '트위터', href: '#', icon: '🐦' },
    { label: '인스타그램', href: '#', icon: '📷' },
    { label: '유튜브', href: '#', icon: '📺' }
  ];
</script>

<footer class="bg-black border-t border-casino-gold/20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- 메인 푸터 콘텐츠 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- 브랜드 섹션 -->
      <div class="lg:col-span-1">
        <div class="flex items-center mb-4">
          <span class="text-2xl font-bold text-casino-gold text-glow">🎰 LuckyMesh</span>
        </div>
        <p class="text-gray-300 text-sm mb-4">
          프리미엄 온라인 카지노 경험을 제공합니다.
          안전하고 공정한 게임 환경에서 최고의 즐거움을 만나보세요.
        </p>
        <div class="flex space-x-4">
          {#each socialLinks as social}
            <a
              href={social.href}
              class="text-gray-400 hover:text-casino-gold transition-colors duration-200"
              aria-label={social.label}
            >
              <span class="text-xl">{social.icon}</span>
            </a>
          {/each}
        </div>
      </div>

      <!-- 링크 섹션들 -->
      {#each Object.entries(footerLinks) as [category, links]}
        <div>
          <h3 class="text-casino-gold font-semibold mb-4">{category}</h3>
          <ul class="space-y-2">
            {#each links as link}
              <li>
                <a
                  href={link.href}
                  class="text-gray-300 text-sm hover:text-casino-gold transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    <!-- 라이선스 및 보안 정보 -->
    <div class="mt-12 pt-8 border-t border-gray-700">
      <div class="flex flex-col lg:flex-row justify-between items-center">
        <div class="mb-4 lg:mb-0">
          <div class="flex items-center space-x-6 text-sm text-gray-400">
            <div class="flex items-center">
              <span class="mr-2">🛡️</span>
              <span>SSL 보안</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">✅</span>
              <span>공정게임 인증</span>
            </div>
            <div class="flex items-center">
              <span class="mr-2">🔒</span>
              <span>개인정보 보호</span>
            </div>
          </div>
        </div>
        <div class="text-sm text-gray-400">
          <span>18세 이상 이용 가능 | 과도한 게임 이용은 중독을 유발할 수 있습니다</span>
        </div>
      </div>
    </div>

    <!-- 저작권 -->
    <div class="mt-8 pt-6 border-t border-gray-700">
      <div class="flex flex-col sm:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">
          © {currentYear} LuckyMesh Casino. All rights reserved.
        </p>
        <div class="mt-2 sm:mt-0 flex items-center text-sm text-gray-400">
          <span class="mr-2">⚡</span>
          <span>Powered by SvelteKit</span>
        </div>
      </div>
    </div>
  </div>
</footer>