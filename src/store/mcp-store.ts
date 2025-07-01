import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MCPServer, MCPServerSearchParams, CreateMCPServerRequest } from '@/types/mcp';
import { getMCPServerService } from '@/lib/services/mcp-server-service';
import { DatabaseError } from '@/lib/database/types';
import { fetchServerTools } from '@/lib/mcp-tools-fetcher';
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
  useMockData: boolean;
  
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
  setUseMockData: (useMock: boolean) => void;
  
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
      useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
      searchParams: {},
      filteredServers: [],

      // Actions
      setServers: (servers) => {
        set({ servers });
        get().updateFilteredServers();
      },

      addServer: (server) => {
        if (get().useMockData) {
          // Mock 데이터에 실제 추가
          const addedServer = addMockServer(server);
          
          // 스토어 상태 업데이트
          const newServers = [...get().servers, addedServer];
          set({ servers: newServers });
          get().updateFilteredServers();
        } else {
          // 실제 DB에서는 createServer를 통해 처리
          console.log('addServer called in DB mode - use createServer instead');
        }
      },

      updateServer: (id, updates) => {
        if (get().useMockData) {
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
        } else {
          // 실제 DB 모드에서는 서버 목록을 다시 조회하거나 로컬 상태만 업데이트
          const servers = get().servers.map(server =>
            server.id === id ? { ...server, ...updates } : server
          );
          set({ servers });
          get().updateFilteredServers();
        }
      },

      removeServer: (id) => {
        if (get().useMockData) {
          // Mock 데이터에서 삭제
          const removed = removeMockServer(id);
          
          if (removed) {
            // 스토어 상태 업데이트
            const servers = get().servers.filter(server => server.id !== id);
            set({ servers });
            get().updateFilteredServers();
          }
        } else {
          // 실제 DB에서는 deleteServer를 통해 처리
          console.log('removeServer called in DB mode - use deleteServer instead');
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
      setUseMockData: (useMockData) => set({ useMockData }),

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
          if (get().useMockData) {
            // Mock 데이터 사용
            const mockServers = getMockServers();
            get().setServers(mockServers);
          } else {
            // 실제 데이터베이스에서 조회
            const service = getMCPServerService();
            const servers = await service.getAllServers();
            get().setServers(servers);
          }
        } catch (error) {
          console.error('Failed to fetch servers:', error);
          const errorMessage = error instanceof DatabaseError 
            ? error.message 
            : 'Failed to fetch servers';
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      createServer: async (data) => {
        set({ loading: true, error: null });
        try {
          console.log('🔧 서버 등록 시작:', data.name);
          
<<<<<<< HEAD
          if (get().useMockData) {
            // Mock 데이터 모드
            const toolsResult = await fetchServerTools(data.endpoint, data.type, 15000);
            
            const serverData = {
              ...data,
              ...(toolsResult.success && { 
                tools: toolsResult.toolNames,
                actualEndpoint: toolsResult.actualEndpoint 
              })
            };
            
            get().addServer(serverData);
            
            const servers = getMockServers();
            const newServer = servers[servers.length - 1];
            
            if (toolsResult.success) {
              get().updateServer(newServer.id, { 
                status: 'online',
                tools: toolsResult.toolNames,
                ...(toolsResult.actualEndpoint && { actualEndpoint: toolsResult.actualEndpoint })
              });
              console.log(`✅ 서버 등록 완료: ${data.name} - ${toolsResult.toolNames.length}개 Tool 등록`);
            } else {
              get().updateServer(newServer.id, { status: 'offline' });
              console.warn(`⚠️ 서버 등록 완료 (연결 실패): ${data.name} - ${toolsResult.error}`);
            }
          } else {
            // 실제 데이터베이스 모드
            const service = getMCPServerService();
            const server = await service.createServer(data);
            
            // 새로 생성된 서버를 로컬 상태에 추가
            const newServers = [...get().servers, server];
            set({ servers: newServers });
            get().updateFilteredServers();
            
            console.log(`✅ 서버 DB 저장 완료: ${data.name}`);
=======
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
>>>>>>> 6ee7c5f8a3727457b3b5e6a91cb616b5ecb5d71d
          }
          
        } catch (error) {
          console.error('❌ 서버 등록 실패:', error);
          const errorMessage = error instanceof DatabaseError 
            ? error.message 
            : 'Failed to create server';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deleteServer: async (id) => {
        set({ loading: true, error: null });
        try {
          if (get().useMockData) {
            get().removeServer(id);
          } else {
            // 실제 데이터베이스에서 삭제
            const service = getMCPServerService();
            await service.deleteServer(id);
            
            // 로컬 상태에서도 제거
            const servers = get().servers.filter(server => server.id !== id);
            set({ servers });
            get().updateFilteredServers();
          }
        } catch (error) {
          console.error('❌ 서버 삭제 실패:', error);
          const errorMessage = error instanceof DatabaseError 
            ? error.message 
            : 'Failed to delete server';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Initialize with mock data
      initializeWithMockData: () => {
        if (get().useMockData) {
          // Mock 데이터에서 현재 서버 목록 가져오기
          const mockServers = getMockServers();
          get().setServers(mockServers);
        } else {
          // 실제 DB 모드에서는 fetchServers 호출
          get().fetchServers();
        }
      },

      // Background Actions
      updateServerInBackground: async (serverId) => {
        try {
          const server = get().servers.find(s => s.id === serverId);
          if (!server) return;

          console.log(`🔄 서버 업데이트 시작: ${server.name}`);
          
          // 서버 상태를 "checking"으로 일시 변경
          get().updateServer(serverId, { status: 'unknown' });
          
          if (get().useMockData) {
            // Mock 데이터 모드
            const toolsResult = await fetchServerTools(server.endpoint, server.type, 15000);
            
            let updates: Partial<MCPServer>;
            
            if (toolsResult.success) {
              updates = {
                status: 'online' as const,
                tools: toolsResult.toolNames,
                updated_at: new Date().toISOString(),
                ...(toolsResult.actualEndpoint && { actualEndpoint: toolsResult.actualEndpoint })
              };
              
              console.log(`✅ 서버 업데이트 완료: ${server.name} - ${toolsResult.toolNames.length}개 Tool 발견`);
              
              // 브라우저 환경에서만 toast 표시
              if (typeof window !== 'undefined') {
                const { toast } = await import('sonner');
                toast.success(
                  `🔍 ${server.name} 헬스체크 완료`,
                  {
                    description: `✅ 서버 온라인 • ${toolsResult.toolNames.length}개 Tool 발견`,
                    duration: 3000,
                  }
                );
              }
            } else {
              updates = {
                status: 'offline' as const,
                updated_at: new Date().toISOString()
              };
              
              console.warn(`⚠️ 서버 연결 실패: ${server.name} - ${toolsResult.error}`);
              
              // 브라우저 환경에서만 toast 표시
              if (typeof window !== 'undefined') {
                const { toast } = await import('sonner');
                toast.error(
                  `🔍 ${server.name} 헬스체크 실패`,
                  {
                    description: `❌ ${toolsResult.error || '서버에 연결할 수 없습니다'}`,
                    duration: 4000,
                  }
                );
              }
            }
            
            // 업데이트된 정보로 서버 정보 갱신
            get().updateServer(serverId, updates);
          } else {
            // 실제 데이터베이스 모드
            const service = getMCPServerService();
            const updatedServer = await service.updateServerStatus(serverId);
            
            // 로컬 상태 업데이트
            get().updateServer(serverId, updatedServer);
            
            // 브라우저 환경에서만 toast 표시
            if (typeof window !== 'undefined') {
              const { toast } = await import('sonner');
              const isOnline = updatedServer.status === 'online';
              const toolsCount = updatedServer.tools?.length || 0;
              
              if (isOnline) {
                toast.success(
                  `🔍 ${server.name} 헬스체크 완료`,
                  {
                    description: `✅ 서버 온라인 • ${toolsCount}개 Tool 발견`,
                    duration: 3000,
                  }
                );
              } else {
                toast.error(
                  `🔍 ${server.name} 헬스체크 실패`,
                  {
                    description: '❌ 서버에 연결할 수 없습니다',
                    duration: 4000,
                  }
                );
              }
            }
          }
          
        } catch (error) {
          console.error(`❌ 서버 업데이트 실패: ${serverId}`, error);
          
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
                description: '❌ 예상치 못한 오류가 발생했습니다',
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