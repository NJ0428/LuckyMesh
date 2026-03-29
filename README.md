# 🎰 럭키메시 카지노

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-1.0-orange)](https://kit.svelte.dev)

> 한국어 카지노 게임 플랫폼 - 블랙잭, 바카라, 룰렛 게임 규칙 및 가이드

## 📋 목차

- [기능](#-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [게임 정보](#-게임-정보)
- [시작하기](#-시작하기)
- [인증 시스템](#-인증-시스템)
- [디자인 시스템](#-디자인-시스템)
- [배포](#-배포)
- [기여](#-기여)
- [라이선스](#-라이선스)

---

## ✨ 기능

- 🔐 **사용자 인증**: 회원가입, 로그인, 로그아웃 기능
- 🎮 **카지노 게임**: 블랙잭, 바카라, 룰렛 게임 제공
- 💰 **예치금 관리**: 입금, 출금, 잔액 확인
- 📊 **게임 통계**: 플레이 기록 및 수익 통계
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- 🎨 **카지노 테마**: 골드 & 다크 테마 디자인

---

## 🚀 기술 스택

| 분류              | 기술                                       |
| ----------------- | ------------------------------------------ |
| **프레임워크**    | [SvelteKit](https://kit.svelte.dev/)       |
| **스타일링**      | [Tailwind CSS](https://tailwindcss.com/)   |
| **런타임**        | [Node.js](https://nodejs.org/) (>= 18.0.0) |
| **데이터베이스**  | SQLite                                     |
| **인증**          | bcrypt + 쿠키 기반 세션                    |
| **패키지 매니저** | npm                                        |

---

## 📁 프로젝트 구조

```
src/
├── lib/
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── Navigation.svelte    # 네비게이션 바
│   │   ├── Footer.svelte        # 푸터
│   │   └── GameCard.svelte      # 게임 카드 컴포넌트
│   └── data/
│       └── games.js          # 게임 데이터
├── routes/                   # 페이지 라우트
│   ├── +layout.svelte       # 공통 레이아웃
│   ├── +page.svelte         # 홈페이지
│   ├── login/               # 로그인 페이지
│   ├── signup/              # 회원가입 페이지
│   ├── blackjack/           # 블랙잭 페이지
│   ├── baccarat/            # 바카라 페이지
│   ├── roulette/            # 룰렛 페이지
│   ├── deposit/             # 입금 페이지
│   ├── withdraw/            # 출금 페이지
│   └── statistics/          # 통계 페이지
└── app.html                 # 메인 HTML 템플릿
```

---

## 🎮 게임 정보

### 블랙잭 (Blackjack)

| 항목        | 값                |
| ----------- | ----------------- |
| 환원율      | 99.5%             |
| 하우스 엣지 | 0.5%              |
| 베팅 범위   | ₩1,000 - ₩100,000 |

### 바카라 (Baccarat)

| 항목        | 값                |
| ----------- | ----------------- |
| 환원율      | 98.94%            |
| 하우스 엣지 | 1.06%             |
| 베팅 범위   | ₩2,000 - ₩500,000 |

### 룰렛 (Roulette)

| 항목        | 값             |
| ----------- | -------------- |
| 환원율      | 97.3%          |
| 하우스 엣지 | 2.7%           |
| 베팅 범위   | ₩500 - ₩50,000 |

---

## 🚀 시작하기

### 요구사항

- Node.js 18.0.0 이상
- npm 9.0.0 이상

### 설치

```bash
# 리포지토리 클론
git clone https://github.com/yourusername/LuckyMesh.git
cd LuckyMesh

# 의존성 설치
npm install
```

### 개발

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

---

## 🔐 인증 시스템

### 기능

- ✅ SQLite 데이터베이스를 통한 사용자 데이터 저장
- ✅ bcrypt로 안전하게 해시된 비밀번호
- ✅ 쿠키 기반 세션 관리
- ✅ 클라이언트/서버 양측 폼 검증

### API 엔드포인트

| 메서드 | 경로                 | 설명             |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/register` | 회원가입         |
| POST   | `/api/auth/login`    | 로그인           |
| POST   | `/api/auth/logout`   | 로그아웃         |
| GET    | `/api/auth/me`       | 사용자 정보 조회 |

### 데이터베이스 스키마

- **users** - 사용자 정보 (아이디, 이메일, 비밀번호, 잔액 등)
- **sessions** - 로그인 세션 관리
- **game_history** - 게임 기록

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
/* Casino Gold */
--color-gold: #ffd700;
/* Casino Dark */
--color-dark: #1a1a2e;
/* Casino Red */
--color-red: #dc2626;
/* Casino Green */
--color-green: #16a34a;
```

### 컴포넌트 클래스

| 클래스          | 설명                  |
| --------------- | --------------------- |
| `btn-primary`   | 골드 배경 버튼        |
| `btn-secondary` | 테두리 버튼           |
| `card-hover`    | 호버 효과가 있는 카드 |
| `text-glow`     | 글로우 효과 텍스트    |

---

## 📱 반응형 디자인

모든 페이지는 다음 디바이스에서 최적화되어 있습니다:

| 디바이스 | 최소 너비 |
| -------- | --------- |
| Mobile   | 320px     |
| Tablet   | 768px     |
| Desktop  | 1024px    |

---

## 🌐 배포

이 프로젝트은 다음 플랫폼에 배포할 수 있습니다:

- [Vercel](https://vercel.com) ⭐ 추천
- [Netlify](https://netlify.com)
- [GitHub Pages](https://pages.github.com/) (정적 빌드)
- [AWS Amplify](https://aws.amazon.com/amplify/)

### Vercel 배포 예시

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

---

## 🤝 기여

기여를 환영합니다! 기여 과정은 다음과 같습니다:

1. 프로젝트를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치를 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

### 기여 가이드라인

- [코드 컨벤션](docs/CODE_CONVENTION.md)
- [커밋 메시지 규칙](docs/COMMIT_CONVENTION.md)
- [Pull Request 템플릿](.github/PULL_REQUEST_TEMPLATE.md)

---

<div align="center">

⚠️ **책임감 있는 게임**: 18세 이상만 이용 가능하며, 과도한 게임 이용은 중독을 유발할 수 있습니다.

Made with ❤️ by [LuckyMesh Team]

</div>
