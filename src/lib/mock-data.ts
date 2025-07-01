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
  },
  {
    id: '11',
    name: 'Time MCP Server',
    endpoint: 'uvx mcp-server-time',
    type: 'stdio',
    description: '현재시간을 확인하는 도구, 시간대 별로 정확한 시간을 확인할 수 있습니다.',
    tags: ['core', 'time'],
    status: 'online',
    created_at: '2025-06-06T09:45:00Z',
    updated_at: '2025-06-06T09:45:00Z',
    tools: ['get_current_time','convert_time'],
    health_url: 'N/A'
  }
];

// 도구 설명 데이터
export const toolDescriptions: Record<string, { description: string; parameters: string[] }> = {
  'execute_query': {
    description: 'SQL 쿼리를 실행하여 데이터베이스에서 데이터를 조회하거나 조작합니다. SELECT, INSERT, UPDATE, DELETE 등의 쿼리를 지원합니다.',
    parameters: ['query: 실행할 SQL 쿼리문', 'params (선택사항): 쿼리 매개변수 배열']
  },
  'get_schema': {
    description: '데이터베이스 스키마 정보를 조회합니다. 테이블 구조, 컬럼 정보, 인덱스, 제약조건 등을 확인할 수 있습니다.',
    parameters: ['table_name (선택사항): 특정 테이블의 스키마만 조회']
  },
  'list_tables': {
    description: '데이터베이스에 있는 모든 테이블 목록을 조회합니다. 테이블명, 생성일, 행 수 등의 기본 정보를 제공합니다.',
    parameters: ['schema (선택사항): 특정 스키마의 테이블만 조회']
  },
  'get_commits': {
    description: 'Git 저장소의 커밋 히스토리를 조회합니다. 커밋 해시, 작성자, 날짜, 메시지 등의 정보를 제공합니다.',
    parameters: ['branch (선택사항): 특정 브랜치의 커밋만 조회', 'limit (선택사항): 조회할 커밋 수 제한']
  },
  'create_branch': {
    description: '새로운 Git 브랜치를 생성합니다. 기존 브랜치나 커밋을 기준으로 새 브랜치를 만들 수 있습니다.',
    parameters: ['branch_name: 생성할 브랜치명', 'base_branch (선택사항): 기준 브랜치 (기본값: main)']
  },
  'merge_request': {
    description: '브랜치 간 병합 요청을 생성하거나 실행합니다. 코드 리뷰와 승인 과정을 거쳐 안전하게 병합할 수 있습니다.',
    parameters: ['source_branch: 병합할 소스 브랜치', 'target_branch: 병합 대상 브랜치', 'title: 병합 요청 제목']
  },
  'get_diff': {
    description: '브랜치나 커밋 간의 차이점을 조회합니다. 파일별 변경사항, 추가/삭제된 라인 등을 확인할 수 있습니다.',
    parameters: ['base: 비교 기준 브랜치/커밋', 'compare: 비교할 브랜치/커밋']
  },
  'get_current_time': {
    description: '현재 시간을 조회합니다. 다양한 시간대와 형식으로 시간 정보를 제공합니다.',
    parameters: ['timezone (선택사항): 시간대 설정', 'format (선택사항): 시간 형식 지정']
  },
  'convert_time': {
    description: '시간대 간 시간 변환을 수행합니다. 서로 다른 시간대의 시간을 정확하게 변환할 수 있습니다.',
    parameters: ['time: 변환할 시간', 'from_timezone: 원본 시간대', 'to_timezone: 변환할 시간대']
  },
  'get_mempool_stats': {
    description: '메모리풀의 현재 통계 정보를 조회합니다. 대기 중인 트랜잭션 수, 평균 수수료 등을 확인할 수 있습니다.',
    parameters: ['currency (선택사항): USD, KRW 등 통화 단위']
  },
  'get_block_info': {
    description: '특정 블록의 상세 정보를 조회합니다. 블록 해시, 트랜잭션 목록, 마이닝 정보 등을 제공합니다.',
    parameters: ['block_height 또는 block_hash: 조회할 블록 식별자']
  },
  'get_transaction': {
    description: '특정 트랜잭션의 상세 정보를 조회합니다. 입력/출력, 수수료, 확인 상태 등을 확인할 수 있습니다.',
    parameters: ['txid: 트랜잭션 해시 ID']
  },
  'search_address': {
    description: '비트코인 주소의 거래 내역과 잔액을 조회합니다. 주소 유형, 거래 횟수, 현재 잔액 등을 제공합니다.',
    parameters: ['address: 비트코인 주소', 'limit (선택사항): 조회할 거래 수 제한']
  },
  'get_fee_estimates': {
    description: '현재 네트워크 상황에 따른 수수료 추천값을 제공합니다. 빠름/보통/경제적 옵션별로 제공됩니다.',
    parameters: ['target_blocks (선택사항): 목표 확인 블록 수']
  },
  'list_files': {
    description: '지정된 디렉토리의 파일과 폴더 목록을 조회합니다. 파일 크기, 수정 날짜 등의 메타데이터도 포함됩니다.',
    parameters: ['path: 조회할 디렉토리 경로', 'recursive (선택사항): 하위 폴더 포함 여부']
  },
  'read_file': {
    description: '텍스트 파일의 내용을 읽어옵니다. 다양한 인코딩을 지원하며 대용량 파일은 청크 단위로 읽습니다.',
    parameters: ['file_path: 읽을 파일 경로', 'encoding (선택사항): 파일 인코딩']
  },
  'write_file': {
    description: '파일에 내용을 작성합니다. 기존 파일 덮어쓰기 또는 새 파일 생성이 가능합니다.',
    parameters: ['file_path: 작성할 파일 경로', 'content: 파일 내용', 'mode (선택사항): 쓰기 모드']
  },
  'create_directory': {
    description: '새로운 디렉토리를 생성합니다. 중첩된 디렉토리 구조도 한 번에 생성할 수 있습니다.',
    parameters: ['dir_path: 생성할 디렉토리 경로', 'recursive (선택사항): 상위 디렉토리도 함께 생성']
  },
  'list_directory': {
    description: '디렉토리 내 파일과 폴더 목록을 조회합니다. 파일 크기, 권한, 수정일 등의 정보를 제공합니다.',
    parameters: ['dir_path: 조회할 디렉토리 경로', 'show_hidden (선택사항): 숨김 파일 포함 여부']
  },
  'get_current_weather': {
    description: '지정된 지역의 현재 날씨 정보를 조회합니다. 온도, 습도, 풍속, 날씨 상태 등을 제공합니다.',
    parameters: ['location: 지역명 또는 위도/경도', 'units (선택사항): 온도 단위 (C/F)']
  },
  'get_forecast': {
    description: '일기예보 정보를 조회합니다. 시간별, 일별 예보 데이터를 제공하며 강수확률, 바람 정보 등을 포함합니다.',
    parameters: ['location: 지역명 또는 위도/경도', 'days (선택사항): 예보 일수', 'hourly (선택사항): 시간별 예보 포함 여부']
  },
  'get_historical_data': {
    description: '과거 날씨 데이터를 조회합니다. 특정 기간의 기온, 강수량, 날씨 패턴 등을 분석할 수 있습니다.',
    parameters: ['location: 지역명 또는 위도/경도', 'start_date: 시작 날짜', 'end_date: 종료 날짜']
  },
  'send_email': {
    description: '이메일을 발송합니다. HTML 형식 지원, 첨부파일 추가, 예약 발송 등의 기능을 제공합니다.',
    parameters: ['to: 수신자 이메일', 'subject: 제목', 'body: 본문', 'attachments (선택사항): 첨부파일']
  },
  'create_template': {
    description: '이메일 템플릿을 생성합니다. 재사용 가능한 이메일 양식을 만들어 효율적인 이메일 관리가 가능합니다.',
    parameters: ['template_name: 템플릿명', 'subject: 제목 템플릿', 'body: 본문 템플릿']
  },
  'schedule_email': {
    description: '이메일 예약 발송을 설정합니다. 지정된 시간에 자동으로 이메일이 발송되도록 스케줄링할 수 있습니다.',
    parameters: ['to: 수신자 이메일', 'subject: 제목', 'body: 본문', 'send_time: 발송 예정 시간']
  },
  'get_inbox': {
    description: '받은 편지함의 이메일 목록을 조회합니다. 읽지 않은 메일, 중요 메일 등을 필터링하여 확인할 수 있습니다.',
    parameters: ['limit (선택사항): 조회할 이메일 수', 'unread_only (선택사항): 읽지 않은 메일만 조회']
  },
  'parse_pdf': {
    description: 'PDF 파일을 파싱하여 텍스트와 메타데이터를 추출합니다. 복잡한 레이아웃의 PDF도 정확하게 처리합니다.',
    parameters: ['file_path: PDF 파일 경로', 'pages (선택사항): 특정 페이지만 파싱']
  },
  'extract_text': {
    description: '다양한 문서 형식에서 텍스트를 추출합니다. Word, Excel, PowerPoint 등을 지원합니다.',
    parameters: ['file_path: 문서 파일 경로', 'format (선택사항): 출력 형식 지정']
  },
  'convert_format': {
    description: '문서 형식을 변환합니다. PDF를 Word로, Excel을 CSV로 등 다양한 형식 간 변환이 가능합니다.',
    parameters: ['input_file: 입력 파일 경로', 'output_format: 변환할 형식', 'output_file (선택사항): 출력 파일 경로']
  },
  'get_metadata': {
    description: '문서의 메타데이터를 조회합니다. 작성자, 생성일, 수정일, 문서 속성 등의 정보를 제공합니다.',
    parameters: ['file_path: 문서 파일 경로']
  },
  'get_value': {
    description: 'Redis에서 키에 해당하는 값을 조회합니다. 문자열, 해시, 리스트 등 다양한 데이터 타입을 지원합니다.',
    parameters: ['key: 조회할 키', 'type (선택사항): 데이터 타입 지정']
  },
  'set_value': {
    description: 'Redis에 키-값 쌍을 저장합니다. 만료 시간 설정, 조건부 저장 등의 옵션을 제공합니다.',
    parameters: ['key: 저장할 키', 'value: 저장할 값', 'expire (선택사항): 만료 시간(초)']
  },
  'delete_key': {
    description: 'Redis에서 지정된 키를 삭제합니다. 여러 키를 한 번에 삭제하는 것도 가능합니다.',
    parameters: ['key: 삭제할 키', 'pattern (선택사항): 패턴 매칭으로 여러 키 삭제']
  },
  'list_keys': {
    description: 'Redis에 저장된 키 목록을 조회합니다. 패턴 매칭을 통해 특정 조건의 키만 필터링할 수 있습니다.',
    parameters: ['pattern (선택사항): 키 패턴 (예: user:*)', 'limit (선택사항): 조회할 키 수 제한']
  },
  'expire_key': {
    description: '기존 키에 만료 시간을 설정합니다. 지정된 시간 후 자동으로 키가 삭제됩니다.',
    parameters: ['key: 만료 시간을 설정할 키', 'seconds: 만료 시간(초)']
  },
  'send_message': {
    description: 'Slack 채널이나 사용자에게 메시지를 발송합니다. 텍스트, 이모지, 멘션 등을 포함할 수 있습니다.',
    parameters: ['channel: 채널명 또는 사용자 ID', 'message: 발송할 메시지', 'thread_ts (선택사항): 스레드 답글']
  },
  'create_channel': {
    description: '새로운 Slack 채널을 생성합니다. 공개/비공개 채널 설정, 초기 멤버 추가 등이 가능합니다.',
    parameters: ['channel_name: 채널명', 'is_private (선택사항): 비공개 채널 여부', 'members (선택사항): 초기 멤버 목록']
  },
  'get_users': {
    description: 'Slack 워크스페이스의 사용자 목록을 조회합니다. 사용자 정보, 상태, 프로필 등을 확인할 수 있습니다.',
    parameters: ['active_only (선택사항): 활성 사용자만 조회', 'include_bots (선택사항): 봇 계정 포함 여부']
  },
  'upload_file': {
    description: 'Slack에 파일을 업로드합니다. 이미지, 문서, 코드 파일 등을 채널이나 DM으로 공유할 수 있습니다.',
    parameters: ['file_path: 업로드할 파일 경로', 'channel: 업로드할 채널', 'comment (선택사항): 파일 설명']
  },
  'predict': {
    description: '훈련된 머신러닝 모델을 사용하여 예측을 수행합니다. 다양한 데이터 형식을 지원합니다.',
    parameters: ['model_name: 사용할 모델명', 'input_data: 예측할 데이터', 'confidence (선택사항): 신뢰도 임계값']
  },
  'analyze': {
    description: '데이터 분석을 수행합니다. 통계 분석, 패턴 인식, 이상 탐지 등의 기능을 제공합니다.',
    parameters: ['data: 분석할 데이터', 'analysis_type: 분석 유형', 'parameters (선택사항): 분석 매개변수']
  },
  'train_model': {
    description: '새로운 머신러닝 모델을 훈련합니다. 다양한 알고리즘과 하이퍼파라미터 튜닝을 지원합니다.',
    parameters: ['training_data: 훈련 데이터', 'model_type: 모델 유형', 'parameters (선택사항): 훈련 매개변수']
  },
  'get_metrics': {
    description: '모델의 성능 지표를 조회합니다. 정확도, 정밀도, 재현율 등의 평가 메트릭을 제공합니다.',
    parameters: ['model_name: 평가할 모델명', 'test_data (선택사항): 테스트 데이터']
  },
  'create_job': {
    description: '새로운 스케줄링 작업을 생성합니다. cron 표현식을 사용하여 정기적인 작업을 설정할 수 있습니다.',
    parameters: ['job_name: 작업명', 'schedule: cron 표현식', 'command: 실행할 명령어']
  },
  'delete_job': {
    description: '기존 스케줄링 작업을 삭제합니다. 실행 중인 작업도 안전하게 중단하고 삭제할 수 있습니다.',
    parameters: ['job_name: 삭제할 작업명']
  },
  'list_jobs': {
    description: '등록된 모든 스케줄링 작업 목록을 조회합니다. 작업 상태, 다음 실행 시간 등을 확인할 수 있습니다.',
    parameters: ['status (선택사항): 특정 상태의 작업만 조회']
  },
  'run_now': {
    description: '스케줄링 작업을 즉시 실행합니다. 정기 스케줄과 별도로 수동으로 작업을 실행할 수 있습니다.',
    parameters: ['job_name: 실행할 작업명']
  }
};

// 도구 설명 조회 함수
export const getToolDescription = (toolName: string) => {
  return toolDescriptions[toolName] || {
    description: '이 도구에 대한 상세 정보가 아직 제공되지 않습니다. 서버 개발자에게 문의하여 도구 설명을 요청해보세요.',
    parameters: []
  };
};

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