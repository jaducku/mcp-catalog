import { DatabaseRepository, DatabaseConfig, DatabaseError } from './types';
import { SupabaseRepository } from './supabase-repository';

// 환경 변수에서 데이터베이스 설정 로드
export function getDatabaseConfig(): DatabaseConfig {
  const dbType = process.env.NEXT_PUBLIC_DB_TYPE || 'supabase';
  
  switch (dbType) {
    case 'supabase':
      return {
        type: 'supabase',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      };
    
    case 'aws-rds':
      return {
        type: 'aws-rds',
        connectionString: process.env.DATABASE_URL,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true',
      };
    
    case 'postgresql':
      return {
        type: 'postgresql',
        connectionString: process.env.DATABASE_URL,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true',
      };
    
    default:
      throw new DatabaseError(`Unsupported database type: ${dbType}`);
  }
}

// Repository 팩토리
export function createDatabaseRepository(config?: DatabaseConfig): DatabaseRepository {
  const dbConfig = config || getDatabaseConfig();
  
  switch (dbConfig.type) {
    case 'supabase':
      return new SupabaseRepository(dbConfig);
    
    case 'aws-rds':
    case 'postgresql':
      // TODO: PostgreSQL Repository 구현
      throw new DatabaseError(`${dbConfig.type} repository not implemented yet`);
    
    case 'mysql':
      // TODO: MySQL Repository 구현
      throw new DatabaseError(`${dbConfig.type} repository not implemented yet`);
    
    default:
      throw new DatabaseError(`Unsupported database type: ${dbConfig.type}`);
  }
}

// 싱글톤 인스턴스
let repositoryInstance: DatabaseRepository | null = null;

export function getRepository(): DatabaseRepository {
  if (!repositoryInstance) {
    repositoryInstance = createDatabaseRepository();
  }
  return repositoryInstance;
}

// Repository 인스턴스 재설정 (테스트용)
export function resetRepository(): void {
  repositoryInstance = null;
}

// 데이터베이스 연결 상태 확인
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  type: string;
  error?: string;
}> {
  try {
    const config = getDatabaseConfig();
    const repository = getRepository();
    const connected = await repository.ping();
    
    return {
      connected,
      type: config.type,
    };
  } catch (error) {
    return {
      connected: false,
      type: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
} 