import { MCPServer, CreateMCPServerRequest, MCPServerSearchParams } from '@/types/mcp';
import { getRepository } from '@/lib/database/factory';
import { fetchServerTools } from '@/lib/mcp-tools-fetcher';
import { DatabaseError } from '@/lib/database/types';

export class MCPServerService {
  private repository = getRepository();

  // 모든 서버 조회
  async getAllServers(): Promise<MCPServer[]> {
    try {
      return await this.repository.getAllServers();
    } catch (error) {
      console.error('Failed to get all servers:', error);
      throw new DatabaseError('서버 목록을 가져오는 중 오류가 발생했습니다.');
    }
  }

  // 서버 ID로 조회
  async getServerById(id: string): Promise<MCPServer | null> {
    try {
      return await this.repository.getServerById(id);
    } catch (error) {
      console.error(`Failed to get server ${id}:`, error);
      throw new DatabaseError('서버 정보를 가져오는 중 오류가 발생했습니다.');
    }
  }

  // 서버 생성 (Tool 목록 자동 조회 포함)
  async createServer(data: CreateMCPServerRequest): Promise<MCPServer> {
    try {
      console.log('🔧 서버 생성 시작:', data.name);

      // 1. 데이터베이스에 기본 정보로 서버 생성
      const server = await this.repository.createServer(data);
      console.log('✅ 서버 DB 저장 완료:', server.id);

      // 2. 백그라운드에서 Tool 목록 조회 및 업데이트
      this.updateServerToolsInBackground(server.id, data.endpoint, data.type);

      return server;
    } catch (error) {
      console.error('Failed to create server:', error);
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('서버 생성 중 오류가 발생했습니다.');
    }
  }

  // 서버 업데이트
  async updateServer(id: string, updates: Partial<MCPServer>): Promise<MCPServer> {
    try {
      return await this.repository.updateServer(id, updates);
    } catch (error) {
      console.error(`Failed to update server ${id}:`, error);
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('서버 업데이트 중 오류가 발생했습니다.');
    }
  }

  // 서버 삭제
  async deleteServer(id: string): Promise<void> {
    try {
      await this.repository.deleteServer(id);
    } catch (error) {
      console.error(`Failed to delete server ${id}:`, error);
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('서버 삭제 중 오류가 발생했습니다.');
    }
  }

  // 서버 검색
  async searchServers(params: MCPServerSearchParams): Promise<MCPServer[]> {
    try {
      return await this.repository.searchServers(params);
    } catch (error) {
      console.error('Failed to search servers:', error);
      throw new DatabaseError('서버 검색 중 오류가 발생했습니다.');
    }
  }

  // 서버 상태 및 Tool 목록 업데이트
  async updateServerStatus(id: string): Promise<MCPServer> {
    try {
      const server = await this.repository.getServerById(id);
      if (!server) {
        throw new DatabaseError('서버를 찾을 수 없습니다.');
      }

      console.log(`🔄 서버 상태 업데이트 시작: ${server.name}`);

      // Tool 목록 조회
      const toolsResult = await fetchServerTools(server.endpoint, server.type, 15000);

      const updates: Partial<MCPServer> = {
        status: toolsResult.success ? 'online' : 'offline',
        updated_at: new Date().toISOString(),
      };

      if (toolsResult.success) {
        updates.tools = toolsResult.toolNames;
        if (toolsResult.actualEndpoint) {
          updates.actualEndpoint = toolsResult.actualEndpoint;
        }
        console.log(`✅ 서버 상태 업데이트 완료: ${server.name} - ${toolsResult.toolNames.length}개 Tool`);
      } else {
        console.warn(`⚠️ 서버 연결 실패: ${server.name} - ${toolsResult.error}`);
      }

      return await this.repository.updateServer(id, updates);
    } catch (error) {
      console.error(`Failed to update server status ${id}:`, error);
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('서버 상태 업데이트 중 오류가 발생했습니다.');
    }
  }

  // 백그라운드에서 Tool 목록 업데이트 (비동기)
  private updateServerToolsInBackground(
    serverId: string, 
    endpoint: string, 
    type: 'streamable' | 'stdio'
  ): void {
    // 비동기로 실행하여 응답 속도 개선
    setTimeout(async () => {
      try {
        console.log(`🔧 백그라운드 Tool 조회 시작: ${serverId}`);
        
        // Tool 목록 조회
        const toolsResult = await fetchServerTools(endpoint, type, 15000);
        
        const updates: Partial<MCPServer> = {
          status: toolsResult.success ? 'online' : 'offline',
          updated_at: new Date().toISOString(),
        };

        if (toolsResult.success) {
          updates.tools = toolsResult.toolNames;
          if (toolsResult.actualEndpoint) {
            updates.actualEndpoint = toolsResult.actualEndpoint;
          }
          console.log(`✅ 백그라운드 Tool 조회 완료: ${serverId} - ${toolsResult.toolNames.length}개 Tool`);
        } else {
          console.warn(`⚠️ 백그라운드 Tool 조회 실패: ${serverId} - ${toolsResult.error}`);
        }

        // 데이터베이스 업데이트
        await this.repository.updateServer(serverId, updates);
        
      } catch (error) {
        console.error(`❌ 백그라운드 Tool 조회 실패: ${serverId}`, error);
        
        // 에러 발생 시 오프라인으로 처리
        try {
          await this.repository.updateServer(serverId, {
            status: 'offline',
            updated_at: new Date().toISOString(),
          });
        } catch (updateError) {
          console.error(`❌ 서버 상태 업데이트 실패: ${serverId}`, updateError);
        }
      }
    }, 100); // 100ms 후 실행
  }

  // 데이터베이스 연결 상태 확인
  async ping(): Promise<boolean> {
    try {
      return await this.repository.ping();
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
let serviceInstance: MCPServerService | null = null;

export function getMCPServerService(): MCPServerService {
  if (!serviceInstance) {
    serviceInstance = new MCPServerService();
  }
  return serviceInstance;
}

// 서비스 인스턴스 재설정 (테스트용)
export function resetMCPServerService(): void {
  serviceInstance = null;
} 