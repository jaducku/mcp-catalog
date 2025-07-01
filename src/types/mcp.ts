export type ServerType = 'streamable' | 'stdio';
export type ServerStatus = 'online' | 'offline' | 'unknown';

export interface MCPServer {
  id: string;
  name: string;
  endpoint: string;
  type: ServerType;
  description: string;
  tags: string[];
  status: ServerStatus;
  created_at: string;
  updated_at: string;
  tools?: string[];
  health_url?: string;
  serverInfo?: {
    name: string;
    version: string;
    protocolVersion: string;
  };
  actualEndpoint?: string; // 리다이렉션이 발생한 경우 실제 작동하는 URL
}

export interface CreateMCPServerRequest {
  name: string;
  endpoint: string;
  type: ServerType;
  description: string;
  tags: string[];
}

export interface MCPServerSearchParams {
  search?: string;
  type?: ServerType;
  status?: ServerStatus;
  tags?: string[];
}

export interface MCPTool {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
}

export interface HealthCheckResult {
  status: ServerStatus;
  tools?: MCPTool[];
  error?: string;
} 