# MCP Catalog

MCP (Model Context Protocol) 서버를 등록하고 관리할 수 있는 웹 애플리케이션입니다.

## 개요

MCP Catalog은 다양한 MCP 서버들의 엔드포인트를 중앙에서 관리할 수 있는 웹 기반 카탈로그 서비스입니다. 개발자들이 손쉽게 MCP 서버를 등록하고, 검색하며, 활용할 수 있도록 설계되었습니다.

## 주요 기능

- 🌟 **랜딩 페이지**: 서비스 소개 및 주요 기능 안내
- 📋 **서버 목록**: 등록된 MCP 서버들을 카드 형태로 표시
- ➕ **서버 등록**: 새로운 MCP 서버 등록 및 자동 Tool 목록 조회
- 🔍 **실시간 검색**: 서버 이름, 설명, 태그로 검색
- 🏥 **헬스체크**: 서버 상태 모니터링 및 Tool 목록 업데이트
- 💾 **다중 데이터베이스 지원**: Supabase, PostgreSQL, AWS RDS 등
- 🎨 **다크/라이트 모드**: 사용자 환경에 맞는 테마 선택

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Database**: Supabase (기본), PostgreSQL, AWS RDS 지원
- **State Management**: Zustand
- **Architecture**: Repository Pattern, Service Layer

## 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd mcp-catalog
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 데이터베이스 타입 선택
NEXT_PUBLIC_DB_TYPE=supabase

# Mock 데이터 사용 여부 (개발용)
NEXT_PUBLIC_USE_MOCK_DATA=false

# Supabase 설정 (DB_TYPE=supabase일 때 필요)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

자세한 데이터베이스 설정은 [DATABASE_SETUP.md](./DATABASE_SETUP.md)를 참고하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 프로젝트 구조

```
mcp-catalog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 라우트
│   │   │   ├── servers/       # 서버 관련 API
│   │   │   └── health/        # 헬스체크 API
│   │   ├── catalog/           # 서버 목록 페이지
│   │   ├── servers/           # 서버 상세/등록 페이지
│   │   └── page.tsx           # 랜딩 페이지
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # shadcn/ui 컴포넌트
│   │   └── ...               # 기타 컴포넌트
│   ├── lib/                   # 유틸리티 및 라이브러리
│   │   ├── database/         # 데이터베이스 추상화 레이어
│   │   │   ├── types.ts      # 인터페이스 정의
│   │   │   ├── factory.ts    # Repository 팩토리
│   │   │   └── supabase-repository.ts  # Supabase 구현체
│   │   ├── services/         # 비즈니스 로직 서비스
│   │   └── ...               # 기타 유틸리티
│   ├── store/                # Zustand 상태 관리
│   └── types/                # TypeScript 타입 정의
├── DATABASE_SETUP.md         # 데이터베이스 설정 가이드
└── ...
```

## 데이터베이스 아키텍처

### Repository 패턴

애플리케이션은 Repository 패턴을 사용하여 데이터베이스 로직을 추상화합니다:

```typescript
interface DatabaseRepository {
  getAllServers(): Promise<MCPServer[]>;
  getServerById(id: string): Promise<MCPServer | null>;
  createServer(data: CreateMCPServerRequest): Promise<MCPServer>;
  updateServer(id: string, updates: Partial<MCPServer>): Promise<MCPServer>;
  deleteServer(id: string): Promise<void>;
  searchServers(params: MCPServerSearchParams): Promise<MCPServer[]>;
  ping(): Promise<boolean>;
}
```

### 서비스 레이어

비즈니스 로직은 서비스 레이어에서 처리됩니다:

```typescript
class MCPServerService {
  // 서버 생성 시 Tool 목록 자동 조회
  async createServer(data: CreateMCPServerRequest): Promise<MCPServer>
  
  // 서버 상태 및 Tool 목록 업데이트
  async updateServerStatus(id: string): Promise<MCPServer>
}
```

## API 엔드포인트

### 서버 관리

- `GET /api/servers` - 서버 목록 조회
- `POST /api/servers` - 새 서버 생성
- `GET /api/servers/[id]` - 특정 서버 조회
- `PUT /api/servers/[id]` - 서버 정보 수정
- `DELETE /api/servers/[id]` - 서버 삭제
- `POST /api/servers/[id]/health` - 서버 헬스체크

### 시스템

- `GET /api/health` - 애플리케이션 헬스체크

## 주요 기능 설명

### 1. 서버 등록

새로운 MCP 서버를 등록할 때:

1. 기본 정보 입력 (이름, 엔드포인트, 타입, 설명, 태그)
2. 서버 검증 버튼으로 실시간 연결 테스트
3. Tool 목록 자동 조회 및 표시
4. 데이터베이스에 저장
5. 백그라운드에서 상태 업데이트

### 2. 헬스체크

등록된 서버의 상태를 실시간으로 모니터링:

- 서버 연결 상태 확인
- Tool 목록 업데이트
- 상태 변경 알림 (Toast)
- 자동 상태 갱신

### 3. 검색 및 필터링

다양한 조건으로 서버 검색:

- 텍스트 검색 (이름, 설명, 태그)
- 서버 타입 필터
- 상태 필터
- 태그 필터

## 개발 모드

개발 시에는 Mock 데이터를 사용할 수 있습니다:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

이 설정을 사용하면 실제 데이터베이스 없이도 애플리케이션을 테스트할 수 있습니다.

## 배포

### 1. Vercel 배포

```bash
npm run build
vercel --prod
```

### 2. Docker 배포

```bash
docker build -t mcp-catalog .
docker run -p 3000:3000 mcp-catalog
```

### 3. 환경 변수 설정

배포 환경에서 다음 환경 변수를 설정하세요:

- `NEXT_PUBLIC_DB_TYPE`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 기여하기

<<<<<<< HEAD
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 라이선스

MIT License

## 문제 해결

일반적인 문제와 해결 방법은 [DATABASE_SETUP.md](./DATABASE_SETUP.md)의 트러블슈팅 섹션을 참고하세요.
=======
이 프로젝트는 MIT 라이선스 하에 배포됩니다.
>>>>>>> 6ee7c5f8a3727457b3b5e6a91cb616b5ecb5d71d
