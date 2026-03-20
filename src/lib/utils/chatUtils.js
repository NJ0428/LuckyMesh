// 욕설 필터링을 위한 한국어 및 영어 비속어 목록
const PROFANITY_LIST = {
	// 한국어 비속어 (별표로 변환)
	korean: [
		'시발', '씨발', '개새', '새끼', '미친', '지랄', '병신', '엠창',
		'호로', '섹스', '성교', '자지', '보지', '씨팔', '십새', '십새끼',
		'좆', '존나', 'ㅅㅂ', 'ㅂㅅ', 'ㅈㄹ', 'ㅂㅌ', 'ㄲㅂ'
	],
	// 영어 비속어
	english: [
		'fuck', 'shit', 'bitch', 'damn', 'ass', 'bastard', 'whore',
		'pussy', 'dick', 'cock', 'nigger', 'nigga', 'slut', 'cunt',
		'fag', 'faggot', 'wtf', 'stfu', 'gtfo'
	]
};

// 이모지 목록 (반응용)
const REACTION_EMOJIS = [
	{ emoji: '😀', name: 'smile' },
	{ emoji: '😂', name: 'laugh' },
	{ emoji: '❤️', name: 'love' },
	{ emoji: '👍', name: 'thumbs_up' },
	{ emoji: '👎', name: 'thumbs_down' },
	{ emoji: '🎉', name: 'celebrate' },
	{ emoji: '🔥', name: 'fire' },
	{ emoji: '💯', name: '100' },
	{ emoji: '🤔', name: 'thinking' },
	{ emoji: '😮', name: 'surprised' }
];

// 언어 감지
export function detectLanguage(text) {
	const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF]/;
	const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
	const chineseRegex = /[\u4E00-\u9FFF]/;

	if (koreanRegex.test(text)) return 'ko';
	if (japaneseRegex.test(text)) return 'ja';
	if (chineseRegex.test(text)) return 'zh';
	return 'en'; // 기본값: 영어
}

// 메시지 필터링 (욕설 별표 처리)
export function filterProfanity(message) {
	let filteredMessage = message;

	// 한국어 비속어 필터링
	for (const word of PROFANITY_LIST.korean) {
		const regex = new RegExp(word, 'gi');
		filteredMessage = filteredMessage.replace(regex, (match) => {
			return '*'.repeat(match.length);
		});
	}

	// 영어 비속어 필터링
	for (const word of PROFANITY_LIST.english) {
		const regex = new RegExp(`\\b${word}\\b`, 'gi');
		filteredMessage = filteredMessage.replace(regex, (match) => {
			return '*'.repeat(match.length);
		});
	}

	return filteredMessage;
}

// 욕설 포함 여부 확인
export function containsProfanity(message) {
	const lowerMessage = message.toLowerCase();

	// 한국어 비속어 확인
	for (const word of PROFANITY_LIST.korean) {
		if (message.includes(word)) {
			return true;
		}
	}

	// 영어 비속어 확인
	for (const word of PROFANITY_LIST.english) {
		if (lowerMessage.includes(word)) {
			return true;
		}
	}

	return false;
}

// 메시지 길이 제한 검증
export function validateMessageLength(message, maxLength = 500) {
	if (message.length > maxLength) {
		return {
			valid: false,
			error: `메시지는 ${maxLength}자 이하여야 합니다.`
		};
	}

	if (message.trim().length === 0) {
		return {
			valid: false,
			error: '메시지를 입력해주세요.'
		};
	}

	return { valid: true };
}

// 메시지 자동 번역 (클라이언트 사이드 번역 API 사용)
export async function translateMessage(message, targetLanguage) {
	// 실제 구현에서는 Google Translate API, DeepL API 등을 사용
	// 여기서는 브라우저의 Translation API를 사용하는 예시

	if (typeof window !== 'undefined' && 'translation' in window) {
		try {
			const translator = window.translation;
			const result = await translator.translate(message, targetLanguage);
			return result;
		} catch (error) {
			console.error('Translation error:', error);
			return message; // 번역 실패시 원본 반환
		}
	}

	// 기본 다국어 메시지 (프로덕션에서는 실제 API 사용)
	const commonTranslations = {
		welcome: {
			ko: '환영합니다!',
			en: 'Welcome!',
			ja: 'ようこそ!',
			zh: '欢迎!'
		}
	};

	return message;
}

// 반응 이모지 목록 반환
export function getReactionEmojis() {
	return REACTION_EMOJIS;
}

// 메시지 ID 생성
export function generateMessageId() {
	return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 메시지 포맷팅 (URL, 멘션 등)
export function formatMessage(message) {
	// URL 하이퍼링크 변환
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	let formatted = message.replace(urlRegex, (url) => {
		return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
	});

	// 멘션 변환 (@username)
	const mentionRegex = /@(\w+)/g;
	formatted = formatted.replace(mentionRegex, '<span class="mention">@$1</span>');

	return formatted;
}

// 스팸 방지를 위한 메시지 빈도 체크
export class SpamFilter {
	constructor(maxMessages = 5, timeWindow = 10000) {
		this.maxMessages = maxMessages;
		this.timeWindow = timeWindow;
		this.messageHistory = [];
	}

	canSend() {
		const now = Date.now();

		// 오래된 기록 제거
		this.messageHistory = this.messageHistory.filter(
			(timestamp) => now - timestamp < this.timeWindow
		);

		if (this.messageHistory.length >= this.maxMessages) {
			return {
				allowed: false,
				error: '너무 빠르게 메시지를 보내고 있습니다. 잠시 후 다시 시도해주세요.'
			};
		}

		this.messageHistory.push(now);
		return { allowed: true };
	}

	reset() {
		this.messageHistory = [];
	}
}

// 채팅 명령어 처리
export function processCommand(message) {
	if (!message.startsWith('/')) return null;

	const parts = message.slice(1).split(' ');
	const command = parts[0].toLowerCase();
	const args = parts.slice(1);

	const commands = {
		help: {
			description: '사용 가능한 명령어 보기',
			execute: () => this.getHelpText()
		},
		clear: {
			description: '채팅 지우기',
			execute: () => ({ action: 'clear' })
		},
		ignore: {
			description: '사용자 무시 (사용법: /ignore @username)',
			execute: () => ({
				action: 'ignore',
				username: args[0]?.replace('@', '')
			})
		},
		unignore: {
			description: '무시 해제 (사용법: /unignore @username)',
			execute: () => ({
				action: 'unignore',
				username: args[0]?.replace('@', '')
			})
		}
	};

	if (commands[command]) {
		return commands[command].execute();
	}

	return {
		error: '알 수 없는 명령어입니다. /help를 입력하여 사용 가능한 명령어를 확인하세요.'
	};
}

export function getHelpText() {
	return `
🎮 채팅 명령어:
/help - 사용 가능한 명령어 보기
/clear - 채팅 지우기
/ignore @username - 특정 사용자 무시
/unignore @username - 무시 해제
	`.trim();
}
