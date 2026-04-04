import { json } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';
import { supportQueries } from '$lib/server/database.js';

// 챗봇 응답 템플릿
const chatbotResponses = {
  // 인사
  greeting: {
    keywords: ['안녕', 'hello', 'hi', '반가워', '안녕하세요'],
    response: '안녕하세요! LuckyMesh 고객센터 챗봇입니다. 무엇을 도와드릴까요?'
  },

  // 입출금
  deposit: {
    keywords: ['입금', '충전', 'deposit', '돈 넣기', '계좌 이체'],
    response: '입금은 마이페이지 > 입출금 메뉴에서 가능합니다. 입금 계좌는 24시간 확인 가능하며, 최소 1만원부터 입금하실 수 있습니다.'
  },
  withdrawal: {
    keywords: ['출금', '환전', 'withdraw', '돈 빼기', '출금 신청'],
    response: '출금은 마이페이지 > 입출금 메뉴에서 신청 가능합니다. 출금은 본인 명의 계좌로만 가능하며, 영업일 기준 1-3일 소요됩니다.'
  },

  // 게임 관련
  game_rules: {
    keywords: ['규칙', '방법', 'how to play', '게임 방법', '어떻게'],
    response: '각 게임의 규칙은 게임 화면 내 도움말 버튼을 통해 확인하실 수 있습니다. 구체적인 게임을 말씀해주시면 자세히 안내해드릴게요!'
  },
  baccarat: {
    keywords: ['바카라', 'baccarat'],
    response: '바카라는 플레이어와 뱅커 중 어느 쪽이 9에 더 가까운 카드를 받을지 예측하는 게임입니다. 기본 배당은 1:1이며, 타이 배당은 8:1입니다.'
  },
  blackjack: {
    keywords: ['블랙잭', 'blackjack', '21'],
    response: '블랙잭은 딜러보다 21에 가까운 숫자를 만들되 21을 넘지 않아야 이기는 게임입니다. 블랙잭(처음 두 장이 21)으로 이기면 배당 3:2를 받습니다.'
  },
  roulette: {
    keywords: ['룰렛', 'roulette'],
    response: '룰렛은 공이 멈추는 위치를 예측하는 게임입니다. 단순 배당(색, 홀짝)부터 숫자 배당까지 다양한 베팅 옵션이 있습니다.'
  },
  slots: {
    keywords: ['슬롯', 'slot', 'slot machine'],
    response: '슬롯머신은 리스를 돌려 일치하는 심볼을 맞추는 게임입니다. 다양한 테마와 보너스 게임이 준비되어 있습니다.'
  },

  // 계정 관련
  account: {
    keywords: ['계정', 'account', '로그인', '비밀번호', 'id'],
    response: '계정 관련 문제는 설정 > 계정 설정에서 가능합니다. 비밀번호 찾기는 로그인 페이지에서 "비밀번호 찾기"를 클릭해주세요.'
  },
  verification: {
    keywords: ['본인인증', '인증', 'verify', 'kyc'],
    response: '본인 인증은 마이페이지 > 설정에서 진행하실 수 있습니다. 출금을 위해서는 본인 인증이 필수입니다.'
  },

  // VIP & 보너스
  vip: {
    keywords: ['vip', '등급', '티어', '혜택'],
    response: 'VIP 등급은 실적에 따라 브론즈, 실버, 골드, 플래티넘, 다이아몬드로 나뉩니다. 등업 혜택으로 배당 증가, 전용 이벤트 등이 제공됩니다.'
  },
  bonus: {
    keywords: ['보너스', 'bonus', '추가급', '이벤트'],
    response: '매일 출석 보상, 주간 미션, 토너먼트 등 다양한 보너스 이벤트가 진행 중입니다. 이벤트 페이지를 확인해주세요!'
  },
  daily_reward: {
    keywords: ['일일 보상', '출석', '로그인'],
    response: '매일 로그인 시 출석 보상을 받으실 수 있습니다. 연속 출석 시 보상이 증가하니 매일 방문해주세요!'
  },

  // 기술 지원
  bug: {
    keywords: ['버그', '오류', '에러', 'bug', 'error', 'glitch'],
    response: '버그를 발견하셨다니 죄송합니다. 자세한 내용을 버그 리포트로 제출해주시면 빠르게 처리해드리겠습니다.'
  },
  lag: {
    keywords: ['렉', '지연', 'slow', 'lag', '느림'],
    response: '게임 지연이 발생하면 브라우저 캐시를 삭제하거나 WiFi 연결을 확인해주세요. 문제가 지속되면 고객센터에 문의해주세요.'
  },

  // 기타
  customer_service: {
    keywords: ['상담원', '사람', '직원', '연결'],
    response: '상담원 연결을 원하시면 1:1 문의 티켓을 발행해주시면 영업일 24시간 내에 답변 드리겠습니다.'
  },
  operating_hours: {
    keywords: ['운영 시간', '영업시간', '시간', '운영'],
    response: '고객센터 운영 시간은 평일 09:00~18:00, 주말 10:00~17:00입니다. (공휴일 휴무)'
  },

  // 기본 응답
  default: {
    keywords: [],
    response: '죄송하지만 질문을 잘 이해하지 못했어요. 자세한 내용은 1:1 문의 또는 FAQ를 확인해주세요!'
  }
};

// 키워드로 intent 매칭
function matchIntent(message) {
  const lowerMessage = message.toLowerCase();

  for (const [intent, data] of Object.entries(chatbotResponses)) {
    if (intent === 'default') continue;

    for (const keyword of data.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return { intent, response: data.response, confidence: 0.8 };
      }
    }
  }

  return { intent: 'default', response: chatbotResponses.default.response, confidence: 0.3 };
}

// GET - 챗봇 세션 기록 조회
export async function GET({ cookies, url }) {
  try {
    const sessionId = cookies.get('session');
    const session = url.searchParams.get('session_id');

    if (!session) {
      return json({
        success: false,
        error: '세션 ID가 필요합니다.'
      }, { status: 400 });
    }

    const logs = supportQueries.getChatbotLogsBySession.all(session);

    return json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Chatbot GET API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}

// POST - 챗봇 메시지 전송
export async function POST({ cookies, request }) {
  try {
    const sessionId = cookies.get('session');
    const authResult = validateSession(sessionId);

    let userId = null;
    if (authResult.success) {
      userId = authResult.user.id;
    }

    const body = await request.json();
    const { message, session_id } = body;

    if (!message) {
      return json({
        success: false,
        error: '메시지는 필수 항목입니다.'
      }, { status: 400 });
    }

    // Intent 매칭
    const { intent, response, confidence } = matchIntent(message);

    // 로그 저장
    if (session_id) {
      supportQueries.createChatbotLog.run(
        userId,
        session_id,
        message,
        response,
        intent,
        confidence
      );
    }

    return json({
      success: true,
      response,
      intent,
      confidence
    });
  } catch (error) {
    console.error('Chatbot POST API error:', error);
    return json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
