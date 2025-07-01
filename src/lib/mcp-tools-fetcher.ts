import { MCPServer, ServerType, MCPTool } from '@/types/mcp';
import { 
  MCPJsonRpcRequest, 
  MCPJsonRpcResponse, 
  MCPToolsListResult,
  MCPConnectionError,
  MCPProtocolError
} from '@/types/mcp-protocol';

export interface ToolsFetchResult {
  success: boolean;
  tools: MCPTool[];
  toolNames: string[];
  error?: string;
  responseTime?: number;
  actualEndpoint?: string;
}

export interface ServerValidationResult {
  isValid: boolean;
  tools: MCPTool[];
  toolNames: string[];
  serverInfo?: {
    name: string;
    version: string;
    protocolVersion: string;
  };
  actualEndpoint?: string;
  responseTime?: number;
  error?: string;
}

/**
 * MCP 서버에서 Tool 목록을 가져오는 메인 함수
 */
export async function fetchServerTools(
  endpoint: string, 
  type: ServerType,
  timeout: number = 15000
): Promise<ToolsFetchResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🔧 Tool 목록 조회 시작: ${endpoint} (${type})`);
    
    if (type === 'streamable') {
      const url = new URL(endpoint);
      
      if (url.protocol === 'ws:' || url.protocol === 'wss:') {
        return await fetchToolsFromWebSocket(endpoint, timeout);
      } else {
        return await fetchToolsFromHttp(endpoint, timeout);
      }
    } else {
      // STDIO 타입의 경우 실제 연결 불가능
      return {
        success: true,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        error: 'STDIO 서버는 런타임에 Tool 목록을 조회할 수 있습니다.'
      };
    }
  } catch (error) {
    console.error('Tool 목록 조회 실패:', error);
    return {
      success: false,
      tools: [],
      toolNames: [],
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 서버 등록 시 유효성 검증과 Tool 목록 조회를 동시에 수행
 */
export async function validateServerAndFetchTools(
  endpoint: string,
  type: ServerType,
  timeout: number = 15000
): Promise<ServerValidationResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 서버 검증 및 Tool 조회: ${endpoint}`);
    
    if (type === 'streamable') {
      const url = new URL(endpoint);
      
      if (url.protocol === 'ws:' || url.protocol === 'wss:') {
        return await validateWebSocketServerAndFetchTools(endpoint, timeout);
      } else {
        return await validateHttpServerAndFetchTools(endpoint, timeout);
      }
    } else {
      // STDIO 타입
      return {
        isValid: true,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        serverInfo: {
          name: 'STDIO MCP Server',
          version: 'unknown',
          protocolVersion: 'unknown'
        }
      };
    }
  } catch (error) {
    console.error('서버 검증 실패:', error);
    return {
      isValid: false,
      tools: [],
      toolNames: [],
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * HTTP MCP 서버에서 Tool 목록 조회
 */
async function fetchToolsFromHttp(
  endpoint: string, 
  timeout: number
): Promise<ToolsFetchResult> {
  const startTime = Date.now();
  
  try {
    const result = await performMCPHttpRequest(
      endpoint, 
      'tools/list', 
      timeout
    );
    
    if (result.success && result.data) {
      const toolsData = result.data as MCPToolsListResult;
      const tools = toolsData.tools || [];
      const toolNames = tools.map(tool => tool.name);
      
      console.log(`✅ HTTP Tool 조회 성공: ${toolNames.length}개 발견`);
      
      return {
        success: true,
        tools,
        toolNames,
        actualEndpoint: result.finalUrl,
        responseTime: Date.now() - startTime
      };
    } else {
      return {
        success: false,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        error: result.error || 'Tool 목록 조회 실패'
      };
    }
  } catch (error) {
    return {
      success: false,
      tools: [],
      toolNames: [],
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'HTTP Tool 조회 실패'
    };
  }
}

/**
 * WebSocket MCP 서버에서 Tool 목록 조회
 */
async function fetchToolsFromWebSocket(
  endpoint: string, 
  timeout: number
): Promise<ToolsFetchResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const ws = new WebSocket(endpoint);
    const timeoutId = setTimeout(() => {
      ws.close();
      resolve({
        success: false,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        error: 'WebSocket 연결 시간 초과'
      });
    }, timeout);

    let isInitialized = false;

    ws.onopen = () => {
      console.log('🔗 WebSocket 연결 성공, 초기화 중...');
      
      // Initialize 요청
      const initRequest: MCPJsonRpcRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: { listChanged: true },
            sampling: {}
          },
          clientInfo: {
            name: 'mcp-catalog',
            version: '1.0.0'
          }
        }
      };
      
      ws.send(JSON.stringify(initRequest));
    };

    ws.onmessage = (event) => {
      try {
        const response: MCPJsonRpcResponse = JSON.parse(event.data);
        
        if (response.id === 1 && !isInitialized) {
          // 초기화 완료, Tool 목록 요청
          isInitialized = true;
          console.log('🔧 초기화 완료, Tool 목록 요청 중...');
          
          const toolsRequest: MCPJsonRpcRequest = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
          };
          
          ws.send(JSON.stringify(toolsRequest));
          
        } else if (response.id === 2) {
          // Tool 목록 응답
          clearTimeout(timeoutId);
          ws.close();
          
          if (response.result) {
            const toolsData = response.result as MCPToolsListResult;
            const tools = toolsData.tools || [];
            const toolNames = tools.map(tool => tool.name);
            
            console.log(`✅ WebSocket Tool 조회 성공: ${toolNames.length}개 발견`);
            
            resolve({
              success: true,
              tools,
              toolNames,
              responseTime: Date.now() - startTime
            });
          } else {
            resolve({
              success: false,
              tools: [],
              toolNames: [],
              responseTime: Date.now() - startTime,
              error: response.error?.message || 'Tool 목록 조회 실패'
            });
          }
        }
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('WebSocket 오류:', error);
      resolve({
        success: false,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        error: 'WebSocket 연결 오류'
      });
    };

    ws.onclose = (event) => {
      clearTimeout(timeoutId);
      if (!isInitialized) {
        resolve({
          success: false,
          tools: [],
          toolNames: [],
          responseTime: Date.now() - startTime,
          error: `WebSocket 연결 종료 (코드: ${event.code})`
        });
      }
    };
  });
}

/**
 * HTTP 서버 검증 및 Tool 조회
 */
async function validateHttpServerAndFetchTools(
  endpoint: string,
  timeout: number
): Promise<ServerValidationResult> {
  const startTime = Date.now();
  
  try {
    // 1. Initialize 요청으로 서버 검증
    const initResult = await performMCPHttpRequest(
      endpoint,
      'initialize',
      timeout
    );
    
    if (!initResult.success) {
      return {
        isValid: false,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        error: initResult.error || '서버 초기화 실패'
      };
    }
    
    const serverInfo = initResult.data?.serverInfo;
    const actualEndpoint = initResult.finalUrl;
    
    // 2. Tool 목록 조회
    const toolsResult = await performMCPHttpRequest(
      actualEndpoint || endpoint,
      'tools/list',
      timeout
    );
    
    const tools = toolsResult.success ? (toolsResult.data?.tools || []) : [];
    const toolNames = tools.map((tool: MCPTool) => tool.name);
    
    console.log(`✅ HTTP 서버 검증 완료: ${toolNames.length}개 Tool 발견`);
    
    return {
      isValid: true,
      tools,
      toolNames,
      serverInfo,
      actualEndpoint,
      responseTime: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      isValid: false,
      tools: [],
      toolNames: [],
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'HTTP 서버 검증 실패'
    };
  }
}

/**
 * WebSocket 서버 검증 및 Tool 조회
 */
async function validateWebSocketServerAndFetchTools(
  endpoint: string,
  timeout: number
): Promise<ServerValidationResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const ws = new WebSocket(endpoint);
    const timeoutId = setTimeout(() => {
      ws.close();
      resolve({
        isValid: false,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        error: 'WebSocket 연결 시간 초과'
      });
    }, timeout);

    let serverInfo: any = null;
    let isInitialized = false;

    ws.onopen = () => {
      console.log('🔗 WebSocket 연결 성공, 검증 중...');
      
      const initRequest: MCPJsonRpcRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: { listChanged: true },
            sampling: {}
          },
          clientInfo: {
            name: 'mcp-catalog',
            version: '1.0.0'
          }
        }
      };
      
      ws.send(JSON.stringify(initRequest));
    };

    ws.onmessage = (event) => {
      try {
        const response: MCPJsonRpcResponse = JSON.parse(event.data);
        
        if (response.id === 1 && !isInitialized) {
          // 초기화 완료
          isInitialized = true;
          serverInfo = response.result?.serverInfo;
          
          console.log('🔧 WebSocket 초기화 완료, Tool 목록 요청 중...');
          
          const toolsRequest: MCPJsonRpcRequest = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/list',
            params: {}
          };
          
          ws.send(JSON.stringify(toolsRequest));
          
        } else if (response.id === 2) {
          // Tool 목록 응답
          clearTimeout(timeoutId);
          ws.close();
          
          const tools = response.result?.tools || [];
          const toolNames = tools.map((tool: MCPTool) => tool.name);
          
          console.log(`✅ WebSocket 서버 검증 완료: ${toolNames.length}개 Tool 발견`);
          
          resolve({
            isValid: true,
            tools,
            toolNames,
            serverInfo,
            responseTime: Date.now() - startTime
          });
        }
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error);
      }
    };

    ws.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('WebSocket 검증 오류:', error);
      resolve({
        isValid: false,
        tools: [],
        toolNames: [],
        responseTime: Date.now() - startTime,
        error: 'WebSocket 연결 오류'
      });
    };

    ws.onclose = (event) => {
      clearTimeout(timeoutId);
      if (!isInitialized) {
        resolve({
          isValid: false,
          tools: [],
          toolNames: [],
          responseTime: Date.now() - startTime,
          error: `WebSocket 연결 종료 (코드: ${event.code})`
        });
      }
    };
  });
}

/**
 * HTTP 요청 수행 (기존 mcp-client.ts에서 가져온 함수)
 */
async function performMCPHttpRequest(
  endpoint: string,
  method: 'initialize' | 'tools/list',
  timeout: number,
  maxRedirects: number = 3
): Promise<{success: boolean; data?: any; error?: string; finalUrl?: string}> {
  
  let currentUrl = endpoint;
  let redirectCount = 0;
  
  const mcpRequest: MCPJsonRpcRequest = method === 'initialize' 
    ? {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: { listChanged: true },
            sampling: {}
          },
          clientInfo: {
            name: 'mcp-catalog',
            version: '1.0.0'
          }
        }
      }
    : {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

  while (redirectCount <= maxRedirects) {
    try {
      console.log(`🔗 HTTP 요청: ${currentUrl} (${method})`);
      
      const response = await fetch(currentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(mcpRequest),
        redirect: 'manual',
        signal: AbortSignal.timeout(timeout)
      });

      // 리다이렉션 처리
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location && redirectCount < maxRedirects) {
          currentUrl = new URL(location, currentUrl).toString();
          redirectCount++;
          console.log(`↩️ 리다이렉션: ${currentUrl}`);
          continue;
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          finalUrl: currentUrl
        };
      }

      const data = await response.json();
      
      if (data.error) {
        return {
          success: false,
          error: data.error.message || 'MCP 프로토콜 오류',
          finalUrl: currentUrl
        };
      }

      return {
        success: true,
        data: data.result,
        finalUrl: currentUrl
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return {
          success: false,
          error: '요청 시간 초과',
          finalUrl: currentUrl
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTTP 요청 실패',
        finalUrl: currentUrl
      };
    }
  }

  return {
    success: false,
    error: '최대 리다이렉션 횟수 초과',
    finalUrl: currentUrl
  };
}

/**
 * 기존 서버의 Tool 목록을 업데이트
 */
export async function updateServerTools(server: MCPServer): Promise<Partial<MCPServer>> {
  console.log(`🔄 서버 Tool 목록 업데이트: ${server.name}`);
  
  const result = await fetchServerTools(server.endpoint, server.type);
  
  if (result.success) {
    return {
      tools: result.toolNames,
      updated_at: new Date().toISOString(),
      ...(result.actualEndpoint && { actualEndpoint: result.actualEndpoint })
    };
  } else {
    console.warn(`⚠️ Tool 업데이트 실패: ${server.name} - ${result.error}`);
    return {
      updated_at: new Date().toISOString()
    };
  }
} 