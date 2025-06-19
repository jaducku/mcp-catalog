# 🚀 MCP Catalog Service

**사내 MCP(Model Context Protocol) 서버들을 등록하고 관리하는 카탈로그 서비스**

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?style=flat-square&logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=flat-square)

## 📋 개요

MCP Catalog은 사내에서 개발한 다양한 MCP 서버들의 엔드포인트를 중앙에서 관리할 수 있는 웹 기반 카탈로그 서비스입니다. 개발자들이 손쉽게 MCP 서버를 등록하고, 검색하며, 활용할 수 있도록 설계되었습니다.

### ✨ 주요 기능

- 🔍 **실시간 검색**: 300ms 디바운스가 적용된 인스턴트 검색
- 📱 **반응형 디자인**: 데스크톱, 태블릿, 모바일 완벽 지원
- 🎨 **세련된 UI**: shadcn/ui 기반의 현대적인 인터페이스
- ⚡ **실시간 상태 모니터링**: 서버 헬스체크 및 상태 추적
- 🏷️ **태그 기반 분류**: 효율적인 서버 관리 및 검색
- 📊 **통계 대시보드**: 등록된 서버 현황 한눈에 파악

## 🛠️ 기술 스택

### Frontend
- **Next.js 15**: App Router, Server Components
- **TypeScript**: 타입 안전성
- **Tailwind CSS 4**: 유틸리티 기반 스타일링
- **shadcn/ui**: 고품질 UI 컴포넌트
- **Framer Motion**: 매끄러운 애니메이션
- **Zustand**: 경량 상태 관리

### 백엔드 (예정)
- **Supabase**: PostgreSQL 데이터베이스
- **Edge Functions**: 서버리스 API
- **실시간 구독**: 서버 상태 업데이트

### 개발 도구
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **React Hook Form**: 폼 상태 관리
- **Zod**: 스키마 검증

## 🚦 지원하는 서버 타입

### 1. Streamable HTTP
- **설명**: HTTP 기반 MCP 서버
- **사용 사례**: REST API, WebSocket, 외부 서비스
- **엔드포인트 예시**: `https://api.example.com`, `wss://ws.example.com`

### 2. STDIO
- **설명**: 로컬 실행 가능한 MCP 서버
- **사용 사례**: 로컬 도구, 스크립트, 명령행 도구
- **엔드포인트 예시**: `/usr/local/bin/my-mcp-server`

## 🎯 사용 사례

1. **API 게이트웨이**: 외부 API를 MCP 프로토콜로 래핑
2. **데이터베이스 연동**: PostgreSQL, MongoDB 등 데이터베이스 접근
3. **파일 시스템**: 로컬 또는 원격 파일 작업
4. **AI 모델**: 머신러닝 모델 추론 서비스
5. **업무 자동화**: 내부 시스템 연동 및 워크플로우

## 🔧 설치 및 실행

### 요구사항
- Node.js 18.17 이상
- npm 또는 yarn, pnpm

### 로컬 개발 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd mcp-catalog

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📱 사용법

### 1. 서버 등록
1. 우측 상단 **"서버 등록"** 버튼 클릭
2. 서버 정보 입력:
   - **서버 이름**: 식별하기 쉬운 이름
   - **엔드포인트**: 서버 URL 또는 실행 경로
   - **타입**: Streamable HTTP 또는 STDIO
   - **설명**: 서버가 제공하는 기능 설명
   - **태그**: 검색 및 분류를 위한 키워드

### 2. 서버 검색
- 상단 검색바에서 실시간 검색
- 서버 이름, 설명, 태그로 검색 가능
- 300ms 디바운스로 빠른 응답

### 3. 서버 상세 정보
- 서버 카드 클릭하여 상세 정보 확인
- 엔드포인트, 태그, 등록일시 확인
- 사용 가능한 도구 목록 확인 (자동 수집)

### 4. 상태 모니터링
- 실시간 서버 상태 확인 (온라인/오프라인/알 수 없음)
- 자동 헬스체크 수행
- 상태 변경 시 시각적 알림

## 🎨 UI/UX 특징

### 디자인 원칙
- **미니멀**: 불필요한 요소 제거로 집중력 향상
- **접근성**: WCAG 가이드라인 준수
- **일관성**: 통일된 디자인 시스템
- **반응성**: 모든 디바이스에서 최적 경험

### 애니메이션
- **페이지 전환**: 부드러운 라우팅 애니메이션
- **카드 호버**: 미묘한 상승 효과
- **로딩 상태**: 스켈레톤 UI로 자연스러운 대기
- **상태 변화**: 색상 전환과 펄스 효과

### 색상 시스템
- **브랜드 컬러**: 신뢰감을 주는 중성 톤
- **상태 표시**: 직관적인 신호등 색상 체계
- **다크 모드**: 완전 지원 (시스템 설정 연동)

## 📊 성능 최적화

- **SSR/SSG**: Next.js App Router의 서버 컴포넌트 활용
- **이미지 최적화**: Next.js Image 컴포넌트
- **폰트 최적화**: 로컬 폰트 로딩
- **번들 최적화**: Tree shaking 및 코드 스플리팅
- **캐싱 전략**: 적절한 캐시 정책으로 빠른 로딩

## 🔐 보안 고려사항

- **입력 검증**: Zod 스키마로 클라이언트/서버 검증
- **XSS 방지**: React의 기본 보안 기능 활용
- **HTTPS 강제**: 프로덕션 환경에서 보안 연결만 허용
- **환경 변수**: 민감한 정보 안전한 관리

## 🚀 로드맵

### v1.0 (현재)
- [x] 기본 CRUD 기능
- [x] 실시간 검색
- [x] 반응형 UI
- [x] 상태 모니터링

### v1.1 (예정)
- [ ] Supabase 백엔드 연동
- [ ] 실시간 헬스체크
- [ ] 사용 통계
- [ ] 즐겨찾기 기능

### v1.2 (예정)
- [ ] 사용자 인증
- [ ] 팀/조직 관리
- [ ] API 문서 자동 생성
- [ ] 알림 시스템

### v2.0 (장기)
- [ ] AI 기반 서버 추천
- [ ] 성능 모니터링
- [ ] 버전 관리
- [ ] GraphQL API

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork 저장소
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 코딩 컨벤션
- ESLint 규칙 준수
- TypeScript strict 모드
- 컴포넌트는 함수형으로 작성
- CSS는 Tailwind 유틸리티 클래스 우선 사용

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

- **개발팀**: [dev-team@company.com](mailto:dev-team@company.com)
- **이슈 리포트**: GitHub Issues
- **문서**: [내부 위키](https://wiki.company.com/mcp-catalog)

---

**Made with ❤️ by 개발팀**
