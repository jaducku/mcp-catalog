import { MCPServer, CreateMCPServerRequest } from '../types/mcp';

// 동적으로 관리되는 서버 목록
let currentMockServers: MCPServer[] = [
  {
    id: '1',
    name: 'Postgres MCP Server',
    endpoint: 'postgresql://localhost:5432/company_db',
    type: 'streamable',
    description: '사내 PostgreSQL 데이터베이스에 연결하여 SQL 쿼리를 실행하고 데이터를 조회할 수 있는 MCP 서버입니다.',
    tags: ['database', 'postgresql', 'sql'],
    status: 'online',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T09:00:00Z',
    tools: ['execute_query', 'get_schema', 'list_tables'],
    health_url: 'postgresql://localhost:5432/company_db/health'
  },
  {
    id: '2',
    name: 'File System Tool',
    endpoint: '/usr/local/bin/mcp-filesystem',
    type: 'stdio',
    description: '로컬 파일 시스템에 접근하여 파일 읽기, 쓰기, 디렉토리 탐색 등의 작업을 수행하는 도구입니다.',
    tags: ['filesystem', 'files', 'local'],
    status: 'online',
    created_at: '2024-01-14T14:30:00Z',
    updated_at: '2024-01-14T14:30:00Z',
    tools: ['read_file', 'write_file', 'list_directory', 'create_directory']
  },
  {
    id: '3',
    name: 'Weather API',
    endpoint: 'https://api.weather.company.com/mcp',
    type: 'streamable',
    description: '실시간 날씨 정보와 예보 데이터를 제공하는 외부 API 연동 서버입니다.',
    tags: ['weather', 'api', 'external'],
    status: 'online',
    created_at: '2024-01-13T11:15:00Z',
    updated_at: '2024-01-13T11:15:00Z',
    tools: ['get_current_weather', 'get_forecast', 'get_historical_data'],
    health_url: 'https://api.weather.company.com/health'
  },
  {
    id: '4',
    name: 'Email Automation',
    endpoint: 'https://internal-email.company.com/mcp',
    type: 'streamable',
    description: '사내 이메일 시스템과 연동하여 이메일 발송, 템플릿 관리, 자동화 기능을 제공합니다.',
    tags: ['email', 'automation', 'internal'],
    status: 'offline',
    created_at: '2024-01-12T16:45:00Z',
    updated_at: '2024-01-12T16:45:00Z',
    tools: ['send_email', 'create_template', 'schedule_email', 'get_inbox'],
    health_url: 'https://internal-email.company.com/health'
  },
  {
    id: '5',
    name: 'Document Parser',
    endpoint: '/opt/tools/document-parser',
    type: 'stdio',
    description: 'PDF, Word, Excel 등 다양한 문서 형식을 파싱하고 텍스트를 추출하는 도구입니다.',
    tags: ['documents', 'parser', 'pdf', 'office'],
    status: 'unknown',
    created_at: '2024-01-11T08:20:00Z',
    updated_at: '2024-01-11T08:20:00Z',
    tools: ['parse_pdf', 'extract_text', 'convert_format', 'get_metadata']
  },
  {
    id: '6',
    name: 'Redis Cache Manager',
    endpoint: 'redis://redis.company.com:6379',
    type: 'streamable',
    description: '캐시 데이터 관리를 위한 Redis 연동 서버로, 키-값 저장 및 조회 기능을 제공합니다.',
    tags: ['cache', 'redis', 'memory', 'performance'],
    status: 'online',
    created_at: '2024-01-10T13:10:00Z',
    updated_at: '2024-01-10T13:10:00Z',
    tools: ['get_value', 'set_value', 'delete_key', 'list_keys', 'expire_key'],
    health_url: 'redis://redis.company.com:6379/ping'
  },
  {
    id: '7',
    name: 'Slack Integration',
    endpoint: 'https://hooks.slack.com/mcp/workspace',
    type: 'streamable',
    description: 'Slack 워크스페이스와 연동하여 메시지 발송, 채널 관리, 사용자 정보 조회가 가능합니다.',
    tags: ['slack', 'messaging', 'collaboration'],
    status: 'online',
    created_at: '2024-01-09T10:05:00Z',
    updated_at: '2024-01-09T10:05:00Z',
    tools: ['send_message', 'create_channel', 'get_users', 'upload_file'],
    health_url: 'https://hooks.slack.com/health'
  },
  {
    id: '8',
    name: 'Machine Learning Model',
    endpoint: 'https://ml.company.com/api/v1/mcp',
    type: 'streamable',
    description: '사내에서 훈련된 머신러닝 모델을 통해 예측 및 분석 서비스를 제공하는 서버입니다.',
    tags: ['ml', 'ai', 'prediction', 'analytics'],
    status: 'online',
    created_at: '2024-01-08T15:30:00Z',
    updated_at: '2024-01-08T15:30:00Z',
    tools: ['predict', 'analyze', 'train_model', 'get_metrics'],
    health_url: 'https://ml.company.com/health'
  },
  {
    id: '9',
    name: 'Task Scheduler',
    endpoint: '/usr/local/bin/task-scheduler',
    type: 'stdio',
    description: 'cron과 유사한 작업 스케줄링 기능을 제공하는 로컬 도구입니다.',
    tags: ['scheduler', 'cron', 'automation', 'tasks'],
    status: 'offline',
    created_at: '2024-01-07T12:00:00Z',
    updated_at: '2024-01-07T12:00:00Z',
    tools: ['create_job', 'delete_job', 'list_jobs', 'run_now']
  },
  {
    id: '10',
    name: 'Git Repository Manager',
    endpoint: 'https://git.company.com/api/mcp',
    type: 'streamable',
    description: '사내 Git 저장소와 연동하여 코드 조회, 커밋 정보, 브랜치 관리 등의 기능을 제공합니다.',
    tags: ['git', 'repository', 'version-control', 'development'],
    status: 'unknown',
    created_at: '2024-01-06T09:45:00Z',
    updated_at: '2024-01-06T09:45:00Z',
    tools: ['get_commits', 'create_branch', 'merge_request', 'get_diff'],
    health_url: 'https://git.company.com/health'
  }
];

// 서버 상태별 통계
export const getServerStats = (servers: MCPServer[]) => {
  const stats = {
    total: servers.length,
    online: servers.filter(s => s.status === 'online').length,
    offline: servers.filter(s => s.status === 'offline').length,
    unknown: servers.filter(s => s.status === 'unknown').length,
    streamable: servers.filter(s => s.type === 'streamable').length,
    stdio: servers.filter(s => s.type === 'stdio').length
  };

  return {
    ...stats,
    onlinePercentage: Math.round((stats.online / stats.total) * 100),
    streamablePercentage: Math.round((stats.streamable / stats.total) * 100)
  };
};

// 인기 태그 추출
export const getPopularTags = (servers: MCPServer[]) => {
  const tagCounts = servers.reduce((acc, server) => {
    server.tags.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
};

// Mock 데이터 접근자 함수들
export const getMockServers = (): MCPServer[] => {
  return [...currentMockServers];
};

// 새 서버 추가 함수
export const addMockServer = (serverData: CreateMCPServerRequest): MCPServer => {
  const newServer: MCPServer = {
    ...serverData,
    id: generateNextId(),
    status: 'unknown',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  currentMockServers.push(newServer);
  console.log(`📝 Mock server added: ${newServer.name} (ID: ${newServer.id})`);
  
  return newServer;
};

// 서버 업데이트 함수
export const updateMockServer = (id: string, updates: Partial<MCPServer>): MCPServer | null => {
  const serverIndex = currentMockServers.findIndex(server => server.id === id);
  if (serverIndex === -1) {
    console.warn(`⚠️ Mock server not found: ${id}`);
    return null;
  }
  
  currentMockServers[serverIndex] = {
    ...currentMockServers[serverIndex],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  console.log(`🔄 Mock server updated: ${currentMockServers[serverIndex].name} (ID: ${id})`);
  return currentMockServers[serverIndex];
};

// 서버 삭제 함수
export const removeMockServer = (id: string): boolean => {
  const serverIndex = currentMockServers.findIndex(server => server.id === id);
  if (serverIndex === -1) {
    console.warn(`⚠️ Mock server not found for deletion: ${id}`);
    return false;
  }
  
  const deletedServer = currentMockServers.splice(serverIndex, 1)[0];
  console.log(`🗑️ Mock server deleted: ${deletedServer.name} (ID: ${id})`);
  
  return true;
};

// ID 생성 함수
const generateNextId = (): string => {
  const maxId = currentMockServers.reduce((max, server) => {
    const numId = parseInt(server.id, 10);
    return isNaN(numId) ? max : Math.max(max, numId);
  }, 0);
  
  return (maxId + 1).toString();
};

// 초기화 함수 (리셋용)
export const resetMockData = (): void => {
  currentMockServers = [...initialMockServers];
  console.log('🔄 Mock data reset to initial state');
};

// 초기 데이터 백업
const initialMockServers: MCPServer[] = [...currentMockServers]; 