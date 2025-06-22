/**
 * 환경변수를 통해 관리되는 설정 값들
 * Pod 배포 시 ConfigMap으로 주입됩니다.
 */
export const config = {
  // MCP 서버 헬스체크 API 기본 URL
  healthCheckApiUrl: process.env.NEXT_PUBLIC_HEALTH_CHECK_API_URL || 'http://localhost:8080',
  
  // MCP 도구 조회 API URL  
  toolsApiUrl: process.env.NEXT_PUBLIC_TOOLS_API_URL || 'http://192.168.219.115:8080',
  
  // 헬스체크 타임아웃 (밀리초)
  healthCheckTimeout: parseInt(process.env.NEXT_PUBLIC_HEALTH_CHECK_TIMEOUT || '10000'),
  
  // 헬스체크 재시도 횟수
  healthCheckRetries: parseInt(process.env.NEXT_PUBLIC_HEALTH_CHECK_RETRIES || '3'),
  
  // 디버그 모드 (개발/운영 환경에서 로그 레벨 조정)
  debugMode: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true',
  
  // WebSocket 연결 타임아웃
  websocketTimeout: parseInt(process.env.NEXT_PUBLIC_WEBSOCKET_TIMEOUT || '10000'),
} as const;

/**
 * 환경변수 검증 함수
 */
export function validateConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_HEALTH_CHECK_API_URL',
    'NEXT_PUBLIC_TOOLS_API_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Missing environment variables:', missingVars);
    console.warn('Using default values for development...');
  }
  
  if (config.debugMode) {
    console.log('🔧 MCP Config:', config);
  }
}

/**
 * API URL 생성 헬퍼 함수들
 */
export const createApiUrls = {
  healthCheck: (endpoint?: string) => {
    const baseUrl = config.healthCheckApiUrl;
    return endpoint ? `${baseUrl}/health-check` : `${baseUrl}/health`;
  },
  
  tools: () => `${config.toolsApiUrl}/tools`,
  
  serverInfo: (serverId: string) => `${config.healthCheckApiUrl}/servers/${serverId}`,
}; 