# 🎰 LuckyMesh Casino

한국어 카지노 게임 랜딩 페이지 - 블랙잭, 바카라, 룰렛 게임 규칙 및 가이드

## 🚀 기술 스택

- **Frontend**: SvelteKit
- **Styling**: Tailwind CSS
- **Runtime**: Node.js
- **Package Manager**: npm

## 📁 프로젝트 구조

```
src/
├── lib/
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── Navigation.svelte    # 네비게이션 바
│   │   ├── Footer.svelte        # 푸터
│   │   └── GameCard.svelte      # 게임 카드 컴포넌트
│   └── data/
│       └── games.js      # 게임 데이터
├── routes/               # 페이지 라우트
│   ├── +layout.svelte    # 공통 레이아웃
│   ├── +page.svelte      # 홈페이지
│   ├── blackjack/        # 블랙잭 페이지
│   ├── baccarat/         # 바카라 페이지
│   └── roulette/         # 룰렛 페이지
└── app.html              # 메인 HTML 템플릿
```

## 🎮 게임 정보

### 블랙잭 (Blackjack)
- 환원율: 99.5%
- 하우스 엣지: 0.5%
- 베팅 범위: ₩1,000 - ₩100,000

### 바카라 (Baccarat)
- 환원율: 98.94%
- 하우스 엣지: 1.06%
- 베팅 범위: ₩2,000 - ₩500,000

### 룰렛 (Roulette)
- 환원율: 97.3%
- 하우스 엣지: 2.7%
- 베팅 범위: ₩500 - ₩50,000

## 🛠️ 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

서버는 http://localhost:3000 에서 실행됩니다.

### 프로덕션 빌드
```bash
npm run build
```

### 프로덕션 미리보기
```bash
npm run preview
```

## 🔐 인증 시스템

### 기능
- **SQLite 데이터베이스**: 사용자 데이터 저장
- **bcrypt 암호화**: 안전한 비밀번호 해싱
- **세션 관리**: 쿠키 기반 인증
- **폼 검증**: 클라이언트/서버 양측 검증

### API 엔드포인트
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 사용자 정보 조회

### 페이지
- `/login` - 로그인 페이지
- `/signup` - 회원가입 페이지

### 데이터베이스 스키마
- **users**: 사용자 정보 (아이디, 이메일, 비밀번호, 잔액 등)
- **sessions**: 로그인 세션 관리
- **game_history**: 게임 기록 (향후 구현)

## 🎨 디자인 시스템

### 색상 팔레트
- **Casino Gold**: #FFD700
- **Casino Dark**: #1a1a2e
- **Casino Red**: #dc2626
- **Casino Green**: #16a34a

### 컴포넌트
- `btn-primary`: 골드 배경 버튼
- `btn-secondary`: 테두리 버튼
- `card-hover`: 호버 효과가 있는 카드
- `text-glow`: 글로우 효과 텍스트

## 📱 반응형 디자인

모든 페이지는 모바일, 태블릿, 데스크톱에서 최적화되어 작동합니다:

- **Mobile**: 320px 이상
- **Tablet**: 768px 이상
- **Desktop**: 1024px 이상

## 🌐 배포

이 프로젝트는 다음 플랫폼에 배포할 수 있습니다:

- Vercel
- Netlify
- GitHub Pages (정적 빌드)
- AWS Amplify

## 📄 라이선스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.

## 🤝 기여

이 프로젝트에 기여하고 싶으시면 Pull Request를 보내주세요.

---

⚠️ **책임감 있는 게임**: 18세 이상만 이용 가능하며, 과도한 게임 이용은 중독을 유발할 수 있습니다.