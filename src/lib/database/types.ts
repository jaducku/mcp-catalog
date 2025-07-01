import { MCPServer, CreateMCPServerRequest, MCPServerSearchParams } from '@/types/mcp';

// 데이터베이스 추상화 인터페이스
export interface DatabaseRepository {
  // Server CRUD operations
  getAllServers(): Promise<MCPServer[]>;
  getServerById(id: string): Promise<MCPServer | null>;
  createServer(data: CreateMCPServerRequest): Promise<MCPServer>;
  updateServer(id: string, updates: Partial<MCPServer>): Promise<MCPServer>;
  deleteServer(id: string): Promise<void>;
  
  // Search and filter
  searchServers(params: MCPServerSearchParams): Promise<MCPServer[]>;
  
  // Health check
  ping(): Promise<boolean>;
}

// 데이터베이스 설정 타입
export interface DatabaseConfig {
  type: 'supabase' | 'aws-rds' | 'postgresql' | 'mysql';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  // Supabase specific
  supabaseUrl?: string;
  supabaseKey?: string;
}

// 데이터베이스 에러 타입
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// 연결 상태 타입
export interface DatabaseStatus {
  connected: boolean;
  type: string;
  lastChecked: Date;
  error?: string;
} 