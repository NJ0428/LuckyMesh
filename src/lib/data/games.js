export const games = [
  {
    id: 'blackjack',
    name: '블랙잭',
    englishName: 'Blackjack',
    description: '딜러와 21에 가까운 수를 겨루는 전략적인 카드 게임',
    minBet: '₩1,000',
    maxBet: '₩100,000',
    houseEdge: '0.5%',
    rtp: '99.5%',
    image: '/images/blackjack.jpg',
    features: ['전략적 플레이', '낮은 하우스 엣지', '더블다운 & 스플릿'],
    rules: {
      objective: '딜러보다 21에 가깝지만 21을 넘지 않는 카드 값을 만드는 것',
      cardValues: {
        'A': '1 또는 11',
        'K, Q, J': '10',
        '2-10': '카드에 표시된 숫자'
      },
      basicRules: [
        '처음에 플레이어와 딜러 모두 2장의 카드를 받습니다',
        '플레이어 카드는 모두 공개, 딜러는 1장만 공개됩니다',
        '플레이어는 히트(카드 추가) 또는 스탠드(카드 정지)를 선택할 수 있습니다',
        '카드 총합이 21을 초과하면 버스트로 패배합니다',
        '딜러는 17 이상이 될 때까지 카드를 뽑아야 합니다'
      ]
    },
    payouts: [
      { condition: '블랙잭 (A + 10)', payout: '3:2' },
      { condition: '일반 승리', payout: '1:1' },
      { condition: '인슈어런스', payout: '2:1' },
      { condition: '무승부', payout: '푸시(원금 반환)' }
    ]
  },
  {
    id: 'baccarat',
    name: '바카라',
    englishName: 'Baccarat',
    description: '플레이어와 뱅커 중 9에 가까운 쪽을 맞히는 우아한 게임',
    minBet: '₩2,000',
    maxBet: '₩500,000',
    houseEdge: '1.06%',
    rtp: '98.94%',
    image: '/images/baccarat.jpg',
    features: ['간단한 룰', '빠른 게임 진행', '높은 환원율'],
    rules: {
      objective: '플레이어 또는 뱅커 중 어느 쪽이 9에 가까운 값을 갖게 될지 예측하는 것',
      cardValues: {
        'A': '1',
        '2-9': '카드에 표시된 숫자',
        '10, J, Q, K': '0'
      },
      basicRules: [
        '플레이어와 뱅커 각각 2장의 카드를 받습니다',
        '카드 합계의 일의 자리 숫자가 해당 패의 값이 됩니다',
        '특정 조건에서 3번째 카드를 받을 수 있습니다',
        '9에 가까운 값을 가진 쪽이 승리합니다',
        '동점인 경우 타이(무승부)가 됩니다'
      ]
    },
    payouts: [
      { condition: '플레이어 승리', payout: '1:1' },
      { condition: '뱅커 승리', payout: '1:1 (5% 수수료)' },
      { condition: '타이 (무승부)', payout: '8:1' },
      { condition: '플레이어 페어', payout: '11:1' },
      { condition: '뱅커 페어', payout: '11:1' }
    ]
  },
  {
    id: 'roulette',
    name: '룰렛',
    englishName: 'Roulette',
    description: '돌아가는 휠에서 공이 멈출 번호를 예측하는 클래식 게임',
    minBet: '₩500',
    maxBet: '₩50,000',
    houseEdge: '2.7%',
    rtp: '97.3%',
    image: '/images/roulette.jpg',
    features: ['다양한 베팅 옵션', '높은 배당률', '실시간 스트리밍'],
    rules: {
      objective: '룰렛 휠에서 공이 멈출 위치를 정확히 예측하는 것',
      wheelNumbers: '0부터 36까지의 숫자 (유럽식 룰렛 기준)',
      basicRules: [
        '딜러가 휠을 돌리고 반대 방향으로 공을 굴립니다',
        '베팅 시간 내에 원하는 번호나 구역에 칩을 놓습니다',
        '공이 멈춘 번호에 따라 당첨이 결정됩니다',
        '여러 베팅을 동시에 할 수 있습니다'
      ]
    },
    payouts: [
      { condition: '스트레이트 업 (단일 번호)', payout: '35:1' },
      { condition: '스플릿 (2개 번호)', payout: '17:1' },
      { condition: '스트리트 (3개 번호)', payout: '11:1' },
      { condition: '코너 (4개 번호)', payout: '8:1' },
      { condition: '빨강/검정', payout: '1:1' },
      { condition: '홀수/짝수', payout: '1:1' },
      { condition: '하이/로우 (1-18, 19-36)', payout: '1:1' }
    ]
  },
  {
    id: 'slots',
    name: '슬롯머신',
    englishName: 'Slot Machine',
    description: '행운의 릴을 돌려 심볼을 맞추는 간편하고 재미있는 게임',
    minBet: '₩10',
    maxBet: '₩10,000',
    houseEdge: '5%',
    rtp: '95%',
    image: '/images/slots.jpg',
    features: ['간편한 플레이', '다양한 심볼', '높은 배당률', '자동 플레이'],
    rules: {
      objective: '회전하는 릴에 나타나는 동일한 심볼을 3개 맞추는 것',
      paylines: '총 5개의 페이라인 (가로 3줄, 대각선 2줄)',
      basicRules: [
        '베팅 금액을 선택하고 스핀 버튼을 누릅니다',
        '3개의 릴이 회전하며 랜덤한 심볼이 나타납니다',
        '동일한 심볼이 3개 일치하면 당첨됩니다',
        '심볼 종류에 따라 배당률이 다릅니다',
        '여러 페이라인에서 동시에 당첨될 수 있습니다'
      ]
    },
    payouts: [
      { condition: '🍒 체리 3개', payout: '2:1' },
      { condition: '🍋 레몬 3개', payout: '3:1' },
      { condition: '🍊 오렌지 3개', payout: '4:1' },
      { condition: '🍇 포도 3개', payout: '5:1' },
      { condition: '🔔 벨 3개', payout: '10:1' },
      { condition: '💎 다이아몬드 3개', payout: '20:1' },
      { condition: '7️⃣ 세븐 3개', payout: '50:1' }
    ]
  }
];