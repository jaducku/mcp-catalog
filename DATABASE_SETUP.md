# MCP Catalog 데이터베이스 설정 가이드

## 개요

MCP Catalog은 다양한 데이터베이스를 지원하도록 설계되었습니다. Repository 패턴을 사용하여 데이터베이스 변경이 용이합니다.

## 지원하는 데이터베이스

- **Supabase** (PostgreSQL 기반) - 현재 구현됨
- **AWS RDS** (PostgreSQL) - 구현 예정
- **PostgreSQL** - 구현 예정
- **MySQL** - 구현 예정

## 환경 변수 설정

### 1. 기본 설정

```env
# 데이터베이스 타입 선택
NEXT_PUBLIC_DB_TYPE=supabase

# Mock 데이터 사용 여부 (개발용)
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 2. Supabase 설정

```env
NEXT_PUBLIC_DB_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. PostgreSQL/AWS RDS 설정

```env
NEXT_PUBLIC_DB_TYPE=postgresql
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mcp_catalog
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=false
```

### 4. AWS RDS 설정

```env
NEXT_PUBLIC_DB_TYPE=aws-rds
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/database_name
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=mcp_catalog
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=true
```

## Supabase 테이블 스키마

Supabase 프로젝트에서 다음 SQL을 실행하여 테이블을 생성하세요:

```sql
-- MCP 서버 정보를 저장하는 테이블
CREATE TABLE mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  endpoint TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('streamable', 'stdio')),
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'unknown' CHECK (status IN ('online', 'offline', 'unknown')),
  tools TEXT[] DEFAULT '{}',
  actual_endpoint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_mcp_servers_status ON mcp_servers(status);
CREATE INDEX idx_mcp_servers_type ON mcp_servers(type);
CREATE INDEX idx_mcp_servers_tags ON mcp_servers USING GIN(tags);
CREATE INDEX idx_mcp_servers_created_at ON mcp_servers(created_at);

-- RLS (Row Level Security) 설정 (선택사항)
ALTER TABLE mcp_servers ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Enable read access for all users" ON mcp_servers
  FOR SELECT USING (true);

-- 인증된 사용자만 삽입/수정/삭제 가능하도록 설정
CREATE POLICY "Enable insert for authenticated users only" ON mcp_servers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON mcp_servers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON mcp_servers
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 개발 모드

개발 시에는 Mock 데이터를 사용할 수 있습니다:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

이 설정을 사용하면 실제 데이터베이스 없이도 애플리케이션을 테스트할 수 있습니다.

## 데이터베이스 추가하기

새로운 데이터베이스를 추가하려면:

1. `src/lib/database/` 디렉토리에 새로운 Repository 구현체 생성
2. `DatabaseRepository` 인터페이스 구현
3. `src/lib/database/factory.ts`에 새로운 타입과 팩토리 로직 추가
4. 환경 변수 설정 추가

예시:
```typescript
// src/lib/database/mysql-repository.ts
export class MySQLRepository implements DatabaseRepository {
  // DatabaseRepository 인터페이스 구현
}
```

## 연결 상태 확인

애플리케이션에서 데이터베이스 연결 상태를 확인할 수 있습니다:

```typescript
import { checkDatabaseConnection } from '@/lib/database/factory';

const status = await checkDatabaseConnection();
console.log('DB Status:', status);
```

## 트러블슈팅

### 1. Supabase 연결 오류

- URL과 API 키가 정확한지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- 네트워크 연결 상태 확인

### 2. PostgreSQL 연결 오류

- 연결 문자열 형식 확인
- 데이터베이스 서버가 실행 중인지 확인
- 방화벽 설정 확인

### 3. 스키마 오류

- 테이블이 올바르게 생성되었는지 확인
- 컬럼 타입과 제약 조건 확인
- 인덱스가 생성되었는지 확인 