// 파스텔 카지노 애니메이션 유틸리티

/**
 * 요소에 떠다니는 애니메이션 적용
 */
export function addFloatingAnimation(element, delay = 0) {
    if (!element) return;

    element.style.animation = `float 3s ease-in-out infinite`;
    element.style.animationDelay = `${delay}s`;
}

/**
 * 카드 호버 효과 강화
 */
export function enhanceCardHover(card) {
    if (!card) return;

    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-12px) scale(1.02)';
        this.style.boxShadow = '0 20px 40px rgba(184, 230, 204, 0.3)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '';
    });
}

/**
 * 버튼 리플 효과
 */
export function addRippleEffect(button) {
    if (!button || typeof window === 'undefined') return;

    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(248, 187, 217, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

/**
 * 스크롤 애니메이션 관찰자
 */
export function createScrollObserver(options = {}) {
    if (typeof window === 'undefined' || !window.IntersectionObserver) return null;

    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observerOptions = { ...defaultOptions, ...options };

    return new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
}

/**
 * 요소를 스크롤 애니메이션에 등록
 */
export function registerScrollAnimation(element, observer) {
    if (!element || !observer) return;

    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    observer.observe(element);
}

/**
 * 파티클 효과 생성
 */
export function createParticles(container, count = 10) {
    if (!container || typeof window === 'undefined') return;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 10 + 5 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `hsl(${Math.random() * 60 + 300}, 70%, 80%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.opacity = Math.random() * 0.5 + 0.3;
        particle.style.animation = `float ${Math.random() * 3 + 2}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';

        container.appendChild(particle);
    }
}

/**
 * 글로우 효과 토글
 */
export function toggleGlow(element, intensity = 0.6) {
    if (!element) return;

    const hasGlow = element.style.boxShadow.includes('rgba(248, 187, 217');

    if (hasGlow) {
        element.style.boxShadow = '';
    } else {
        element.style.boxShadow = `0 0 30px rgba(248, 187, 217, ${intensity})`;
    }
}

/**
 * 카드 셔플 애니메이션
 */
export function shuffleCards(cards) {
    if (!cards || cards.length === 0) return;

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'rotateY(180deg)';
            setTimeout(() => {
                card.style.transform = 'rotateY(0deg)';
            }, 300);
        }, index * 100);
    });
}

/**
 * 성공 애니메이션
 */
export function playSuccessAnimation(element) {
    if (!element) return;

    element.style.animation = 'successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    // 파티클 효과 추가
    createParticles(element.parentElement, 5);

    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// CSS 키프레임 추가 (브라우저에서만 실행)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes successPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      
      .animate-in {
        animation: slideInUp 0.6s ease-out;
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
}