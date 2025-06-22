import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MCPServer, MCPServerSearchParams, CreateMCPServerRequest } from '@/types/mcp';
import { updateServerInfo } from '@/lib/mcp-client';
import { 
  getMockServers, 
  addMockServer, 
  updateMockServer, 
  removeMockServer 
} from '@/lib/mock-data';

interface MCPStore {
  // State
  servers: MCPServer[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedServerId: string | null;
  isDrawerOpen: boolean;
  
  // Search & Filter
  searchParams: MCPServerSearchParams;
  filteredServers: MCPServer[];
  
  // Actions
  setServers: (servers: MCPServer[]) => void;
  addServer: (server: CreateMCPServerRequest) => void;
  updateServer: (id: string, updates: Partial<MCPServer>) => void;
  removeServer: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchParams: (params: MCPServerSearchParams) => void;
  setSelectedServerId: (id: string | null) => void;
  setDrawerOpen: (open: boolean) => void;
  
  // Computed
  updateFilteredServers: () => void;
  
  // API Actions
  fetchServers: () => Promise<void>;
  createServer: (data: CreateMCPServerRequest) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
  initializeWithMockData: () => void;
  
  // Background Actions
  updateServerInBackground: (serverId: string) => Promise<void>;
}

export const useMCPStore = create<MCPStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      servers: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedServerId: null,
      isDrawerOpen: false,
      searchParams: {},
      filteredServers: [],

      // Actions
      setServers: (servers) => {
        set({ servers });
        get().updateFilteredServers();
      },

      addServer: (server) => {
        // Mock 데이터에 실제 추가
        const addedServer = addMockServer(server);
        
        // 스토어 상태 업데이트
        const newServers = [...get().servers, addedServer];
        set({ servers: newServers });
        get().updateFilteredServers();
      },

      updateServer: (id, updates) => {
        // Mock 데이터에서 업데이트
        const updatedServer = updateMockServer(id, updates);
        
        if (updatedServer) {
          // 스토어 상태 업데이트
          const servers = get().servers.map(server =>
            server.id === id ? updatedServer : server
          );
          set({ servers });
          get().updateFilteredServers();
        }
      },

      removeServer: (id) => {
        // Mock 데이터에서 삭제
        const removed = removeMockServer(id);
        
        if (removed) {
          // 스토어 상태 업데이트
          const servers = get().servers.filter(server => server.id !== id);
          set({ servers });
          get().updateFilteredServers();
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      setSearchQuery: (searchQuery) => {
        set({ searchQuery });
        const searchParams = { ...get().searchParams, search: searchQuery };
        set({ searchParams });
        get().updateFilteredServers();
      },

      setSearchParams: (searchParams) => {
        set({ searchParams });
        get().updateFilteredServers();
      },

      setSelectedServerId: (selectedServerId) => set({ selectedServerId }),
      setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),

      // Computed
      updateFilteredServers: () => {
        const { servers, searchParams } = get();
        let filtered = [...servers];

        // Search by name, description, or tags
        if (searchParams.search) {
          const search = searchParams.search.toLowerCase();
          filtered = filtered.filter(server =>
            server.name.toLowerCase().includes(search) ||
            server.description.toLowerCase().includes(search) ||
            server.tags.some(tag => tag.toLowerCase().includes(search))
          );
        }

        // Filter by type
        if (searchParams.type) {
          filtered = filtered.filter(server => server.type === searchParams.type);
        }

        // Filter by status
        if (searchParams.status) {
          filtered = filtered.filter(server => server.status === searchParams.status);
        }

        // Filter by tags
        if (searchParams.tags && searchParams.tags.length > 0) {
          filtered = filtered.filter(server =>
            searchParams.tags!.some(tag => server.tags.includes(tag))
          );
        }

        set({ filteredServers: filtered });
      },

      // API Actions
      fetchServers: async () => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement actual API call to Supabase
          // const response = await fetch('/api/servers');
          // const servers = await response.json();
          
          // Mock data for now
          const mockServers: MCPServer[] = [
            {
              id: '1',
              name: 'Mempool WebSocket MCP',
              endpoint: 'ws://localhost:8080',
              type: 'streamable',
              description: '비트코인 네트워크 데이터를 실시간으로 제공하는 MCP 서버',
              tags: ['bitcoin', 'websocket', 'mempool'],
              status: 'online',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'Supabase MCP Server',
              endpoint: 'http://localhost:3001',
              type: 'streamable',
              description: 'Supabase 데이터베이스 작업을 위한 MCP 서버',
              tags: ['supabase', 'database', 'postgresql'],
              status: 'online',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
          
          get().setServers(mockServers);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch servers' });
        } finally {
          set({ loading: false });
        }
      },

      createServer: async (data) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement actual API call
          // const response = await fetch('/api/servers', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(data),
          // });
          // const server = await response.json();
          
          // Mock 데이터에 직접 추가 (addServer에서 처리됨)
          get().addServer(data);
          
          // 추가된 서버 ID 찾기 (가장 최근에 추가된 서버)
          const servers = getMockServers();
          const newServer = servers[servers.length - 1];
          
          // 도구 정보가 있으면 이미 헬스체크를 통과한 것으로 간주하여 백그라운드 업데이트 건너뛰기
          if (!data.tools || data.tools.length === 0) {
            // 도구 정보가 없는 경우에만 백그라운드에서 서버 정보 업데이트
            setTimeout(() => {
              get().updateServerInBackground(newServer.id);
            }, 100);
          } else {
            console.log(`✅ 도구 정보가 있어 헬스체크 건너뛰기: ${newServer.name} (${data.tools.length}개 도구)`);
          }
          
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create server' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deleteServer: async (id) => {
        set({ loading: true, error: null });
        try {
          // TODO: Implement actual API call
          // await fetch(`/api/servers/${id}`, { method: 'DELETE' });
          
          get().removeServer(id);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete server' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Initialize with mock data
      initializeWithMockData: () => {
        // Mock 데이터에서 현재 서버 목록 가져오기
        const mockServers = getMockServers();
        get().setServers(mockServers);
      },

      // Background Actions
      updateServerInBackground: async (serverId) => {
        try {
          const server = get().servers.find(s => s.id === serverId);
          if (!server) return;

          console.log(`🔄 Starting background update for server: ${server.name}`);
          
          // 서버 상태를 "checking"으로 일시 변경
          get().updateServer(serverId, { status: 'unknown' });
          
          // 백그라운드에서 서버 정보 업데이트
          const updates = await updateServerInfo(server);
          
          // 업데이트된 정보로 서버 정보 갱신
          get().updateServer(serverId, updates);
          
          console.log(`✅ Background update completed for server: ${server.name}`, updates);
          
          // 브라우저 환경에서만 toast 표시
          if (typeof window !== 'undefined') {
            const { toast } = await import('sonner');
            const isOnline = updates.status === 'online';
            const toolsCount = updates.tools?.length || 0;
            
            toast.success(
              `🔍 ${server.name} 헬스체크 완료`,
              {
                description: isOnline 
                  ? `✅ 서버 온라인 • ${toolsCount}개 도구 발견`
                  : '❌ 서버 접근 불가',
                duration: 3000,
              }
            );
          }
          
        } catch (error) {
          console.error(`❌ Background update failed for server ${serverId}:`, error);
          
          // 에러 발생 시 오프라인으로 처리
          get().updateServer(serverId, { 
            status: 'offline',
            updated_at: new Date().toISOString()
          });
          
          // 브라우저 환경에서만 toast 표시
          if (typeof window !== 'undefined') {
            const { toast } = await import('sonner');
            const server = get().servers.find(s => s.id === serverId);
            
            toast.error(
              `🔍 ${server?.name || 'Unknown'} 헬스체크 실패`,
              {
                description: '❌ 서버에 연결할 수 없습니다',
                duration: 3000,
              }
            );
          }
        }
      },
    }),
    { name: 'mcp-store' }
  )
); 