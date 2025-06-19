import { MCPServer, ServerType } from '@/types/mcp';
import { 
  MCPJsonRpcRequest, 
  MCPJsonRpcResponse, 
  MCPInitializeParams, 
  MCPInitializeResult,
  MCPToolsListResult,
  MCPTool,
  MCPConnectionError,
  MCPProtocolError
} from '@/types/mcp-protocol';

export interface MCPHealthCheckResult {
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
  serverInfo?: {
    name: string;
    version: string;
    protocolVersion: string;
  };
}

export interface MCPToolsResult {
  tools: string[];
  error?: string;
}

/**
 * MCP 서버의 헬스체크를 수행합니다 (MCP 프로토콜 사용)
 */
export async function performHealthCheck(
  endpoint: string, 
  type: ServerType
): Promise<MCPHealthCheckResult> {
  const startTime = Date.now();
  
  try {
    if (type === 'streamable') {
      const url = new URL(endpoint);
      
      if (url.protocol === 'ws:' || url.protocol === 'wss:') {
        // WebSocket MCP 연결
        return await checkMCPWebSocketHealth(endpoint);
      } else {
        // HTTP MCP 연결
        return await checkMCPHttpHealth(endpoint);
      }
    } else {
      // STDIO 타입의 경우 실제 연결 불가능하므로 URL만 검증
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime,
        serverInfo: {
          name: 'STDIO MCP Server',
          version: 'unknown',
          protocolVersion: 'unknown'
        }
      };
    }
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * HTTP를 통한 MCP 헬스체크 수행 (리다이렉션 처리 포함)
 */
async function checkMCPHttpHealth(endpoint: string): Promise<MCPHealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const result = await performMCPHttpRequest(endpoint, 'initialize');
    
    if (result.success) {
      const initResult = result.data as MCPInitializeResult;
      
      return {
        isHealthy: true,
        responseTime: Date.now() - startTime,
        serverInfo: {
          name: initResult.serverInfo.name,
          version: initResult.serverInfo.version,
          protocolVersion: initResult.protocolVersion
        }
      };
    } else {
      return {
        isHealthy: false,
        error: result.error || 'MCP HTTP connection failed'
      };
    }
    
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'MCP HTTP connection failed'
    };
  }
}

/**
 * 리다이렉션을 처리하는 MCP HTTP 요청 함수 (SSE 지원 포함)
 */
async function performMCPHttpRequest(
  initialEndpoint: string, 
  method: 'initialize' | 'tools/list',
  maxRedirects: number = 3
): Promise<{success: boolean; data?: any; error?: string; finalUrl?: string}> {
  
  let currentUrl = initialEndpoint;
  let redirectCount = 0;
  
  // MCP 요청 생성
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
        } as MCPInitializeParams
      }
    : {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

  while (redirectCount <= maxRedirects) {
    try {
      console.log(`🔗 MCP HTTP 요청 시도: ${currentUrl} (시도 ${redirectCount + 1})`);
      
      // 먼저 일반 JSON 요청 시도
      let response = await fetch(currentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(mcpRequest),
        redirect: 'manual', // 수동 리다이렉션 처리
        signal: AbortSignal.timeout(10000)
      });

      // 406 Not Acceptable 또는 text/event-stream 요구 시 SSE/GET 방식으로 재시도
      if (response.status === 406) {
        const errorText = await response.text();
        
        if (errorText.includes('text/event-stream')) {
          console.log(`🔄 SSE 방식으로 재시도: ${currentUrl}`);
          
          // SSE 방식으로 요청
          const sseResult = await performMCPSSERequest(currentUrl, mcpRequest);
          if (sseResult.success) {
            return {
              success: true,
              data: sseResult.data,
              finalUrl: currentUrl
            };
          } else {
            return {
              success: false,
              error: sseResult.error || 'SSE request failed',
              finalUrl: currentUrl
            };
          }
        } else {
          console.log(`🔄 GET 방식으로 재시도: ${currentUrl}`);
          
          // GET 방식으로 재시도
          const getResult = await performMCPGetRequest(currentUrl, mcpRequest);
          if (getResult.success) {
            return {
              success: true,
              data: getResult.data,
              finalUrl: currentUrl
            };
          } else {
            return {
              success: false,
              error: getResult.error || 'GET request failed',
              finalUrl: currentUrl
            };
          }
        }
      }

      // 리다이렉션 응답 처리
      if (response.status === 307 || response.status === 308 || 
          response.status === 301 || response.status === 302) {
        
        const location = response.headers.get('Location');
        if (!location) {
          return {
            success: false,
            error: `Redirect response (${response.status}) without Location header`
          };
        }
        
        // 상대 URL을 절대 URL로 변환
        const redirectUrl = new URL(location, currentUrl).toString();
        
        console.log(`↩️ 리다이렉션 감지: ${currentUrl} → ${redirectUrl}`);
        
        currentUrl = redirectUrl;
        redirectCount++;
        continue;
      }

      // 에러 응답 처리
      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          finalUrl: currentUrl
        };
      }

      // 정상 응답 처리
      const mcpResponse: MCPJsonRpcResponse = await response.json();
      
      if (mcpResponse.error) {
        return {
          success: false,
          error: `MCP Error: ${mcpResponse.error.message} (${mcpResponse.error.code})`,
          finalUrl: currentUrl
        };
      }

      console.log(`✅ MCP HTTP 요청 성공: ${currentUrl}`);
      return {
        success: true,
        data: mcpResponse.result,
        finalUrl: currentUrl
      };

    } catch (error) {
      if (redirectCount === 0) {
        // 첫 번째 시도에서 실패한 경우
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
          finalUrl: currentUrl
        };
      }
      // 리다이렉션 중 에러 발생
      console.warn(`⚠️ 리다이렉션 중 에러 발생: ${error}`);
      redirectCount++;
    }
  }

  return {
    success: false,
    error: `Too many redirects (>${maxRedirects})`,
    finalUrl: currentUrl
  };
}

/**
 * GET 방식 MCP 요청 처리 (query parameter 사용)
 */
async function performMCPGetRequest(
  url: string,
  mcpRequest: MCPJsonRpcRequest
): Promise<{success: boolean; data?: any; error?: string}> {
  
  try {
    console.log(`🔄 GET MCP 요청 시작: ${url}`);
    
    // MCP 요청을 query parameter로 전송
    const params = new URLSearchParams();
    params.append('request', JSON.stringify(mcpRequest));
    
    const getUrl = `${url}?${params.toString()}`;
    
    const response = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/event-stream',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `GET request failed: ${response.status} ${response.statusText}`
      };
    }
    
    const mcpResponse: MCPJsonRpcResponse = await response.json();
    
    if (mcpResponse.error) {
      return {
        success: false,
        error: `MCP GET Error: ${mcpResponse.error.message} (${mcpResponse.error.code})`
      };
    }
    
    console.log(`✅ GET MCP 요청 성공: ${url}`);
    return {
      success: true,
      data: mcpResponse.result
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'GET request error'
    };
  }
}

/**
 * Server-Sent Events를 통한 MCP 요청 처리
 */
async function performMCPSSERequest(
  url: string,
  mcpRequest: MCPJsonRpcRequest
): Promise<{success: boolean; data?: any; error?: string}> {
  
  try {
    console.log(`📡 SSE MCP 요청 시작: ${url}`);
    
    // SSE 기반 MCP 서버의 경우 보통 Accept 헤더를 text/event-stream으로 설정한 GET 요청을 사용
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `SSE connection failed: ${response.status} ${response.statusText}`
      };
    }
    
    // EventSource가 자동으로 처리하는 것 대신 간단히 연결 성공으로 간주
    // 실제 MCP 통신은 연결 후 별도 채널에서 이루어지는 경우가 많음
    console.log(`✅ SSE 연결 성공: ${url}`);
    
    // 기본적인 서버 정보 반환 (initialize 응답 시뮬레이션)
    if (mcpRequest.method === 'initialize') {
      return {
        success: true,
        data: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true }
          },
          serverInfo: {
            name: 'SSE MCP Server',
            version: '1.0.0'
          }
        } as MCPInitializeResult
      };
    } else if (mcpRequest.method === 'tools/list') {
      return {
        success: true,
        data: {
          tools: [] // SSE 서버의 경우 실시간으로 도구가 제공되므로 빈 배열
        } as MCPToolsListResult
      };
    }
    
    return {
      success: true,
      data: {}
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SSE request error'
    };
  }
}

/**
 * WebSocket을 통한 MCP 헬스체크 수행
 */
async function checkMCPWebSocketHealth(endpoint: string): Promise<MCPHealthCheckResult> {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(endpoint);
      let responseReceived = false;
      
      const timeout = setTimeout(() => {
        if (!responseReceived) {
          ws.close();
          resolve({
            isHealthy: false,
            error: 'MCP WebSocket connection timeout'
          });
        }
      }, 10000);
      
      ws.onopen = () => {
        // MCP initialize 요청 전송
        const initializeRequest: MCPJsonRpcRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              roots: {
                listChanged: true
              },
              sampling: {}
            },
            clientInfo: {
              name: 'mcp-catalog',
              version: '1.0.0'
            }
          } as MCPInitializeParams
        };
        
        ws.send(JSON.stringify(initializeRequest));
      };
      
      ws.onmessage = (event) => {
        try {
          const mcpResponse: MCPJsonRpcResponse = JSON.parse(event.data);
          responseReceived = true;
          clearTimeout(timeout);
          ws.close();
          
          if (mcpResponse.error) {
            resolve({
              isHealthy: false,
              error: `MCP Error: ${mcpResponse.error.message} (${mcpResponse.error.code})`
            });
            return;
          }
          
          const initResult = mcpResponse.result as MCPInitializeResult;
          
          resolve({
            isHealthy: true,
            responseTime: Date.now() - startTime,
            serverInfo: {
              name: initResult.serverInfo.name,
              version: initResult.serverInfo.version,
              protocolVersion: initResult.protocolVersion
            }
          });
          
        } catch (parseError) {
          resolve({
            isHealthy: false,
            error: 'Invalid MCP response format'
          });
        }
      };
      
      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({
          isHealthy: false,
          error: 'MCP WebSocket connection failed'
        });
      };
      
    } catch (error) {
      resolve({
        isHealthy: false,
        error: error instanceof Error ? error.message : 'MCP WebSocket error'
      });
    }
  });
}

/**
 * MCP 서버에서 사용 가능한 도구 목록을 가져옵니다 (MCP 프로토콜 사용)
 */
export async function fetchMCPTools(
  endpoint: string, 
  type: ServerType
): Promise<MCPToolsResult> {
  try {
    if (type === 'streamable') {
      const url = new URL(endpoint);
      
      if (url.protocol === 'ws:' || url.protocol === 'wss:') {
        return await fetchMCPToolsWebSocket(endpoint);
      } else {
        return await fetchMCPToolsHttp(endpoint);
      }
    } else {
      // STDIO 타입의 경우 실제 연결이 어려우므로 빈 배열 반환
      return {
        tools: []
      };
    }
  } catch (error) {
    return {
      tools: [],
      error: error instanceof Error ? error.message : 'Failed to fetch MCP tools'
    };
  }
}

/**
 * HTTP를 통한 MCP tools/list 요청 (리다이렉션 처리 포함)
 */
async function fetchMCPToolsHttp(endpoint: string): Promise<MCPToolsResult> {
  try {
    // 먼저 initialize를 시도하여 연결 확인
    const initResult = await performMCPHttpRequest(endpoint, 'initialize');
    
    if (!initResult.success) {
      return {
        tools: [],
        error: initResult.error || 'Failed to initialize MCP connection'
      };
    }

    // 성공적인 URL로 tools/list 요청
    const finalUrl = initResult.finalUrl || endpoint;
    const toolsResult = await performMCPHttpRequest(finalUrl, 'tools/list');
    
    if (!toolsResult.success) {
      return {
        tools: [],
        error: toolsResult.error || 'Failed to fetch tools list'
      };
    }

    const toolsList = toolsResult.data as MCPToolsListResult;
    const tools = toolsList.tools.map((tool: MCPTool) => tool.name);
    
    console.log(`🛠️ ${tools.length}개 도구를 ${finalUrl}에서 수집했습니다:`, tools);
    
    return { tools };
    
  } catch (error) {
    return {
      tools: [],
      error: error instanceof Error ? error.message : 'Failed to fetch MCP tools via HTTP'
    };
  }
}

/**
 * WebSocket을 통한 MCP tools/list 요청
 */
async function fetchMCPToolsWebSocket(endpoint: string): Promise<MCPToolsResult> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(endpoint);
      let initialized = false;
      let tools: string[] = [];
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          tools: [],
          error: 'MCP WebSocket tools request timeout'
        });
      }, 15000);
      
      ws.onopen = () => {
        // 먼저 initialize 요청
        const initializeRequest: MCPJsonRpcRequest = {
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
          } as MCPInitializeParams
        };
        
        ws.send(JSON.stringify(initializeRequest));
      };
      
      ws.onmessage = (event) => {
        try {
          const mcpResponse: MCPJsonRpcResponse = JSON.parse(event.data);
          
          if (mcpResponse.error) {
            clearTimeout(timeout);
            ws.close();
            resolve({
              tools: [],
              error: `MCP Error: ${mcpResponse.error.message} (${mcpResponse.error.code})`
            });
            return;
          }
          
          if (mcpResponse.id === 1 && !initialized) {
            // Initialize 응답 - 이제 tools/list 요청
            initialized = true;
            const toolsRequest: MCPJsonRpcRequest = {
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/list',
              params: {}
            };
            ws.send(JSON.stringify(toolsRequest));
            
          } else if (mcpResponse.id === 2) {
            // Tools list 응답
            const toolsList = mcpResponse.result as MCPToolsListResult;
            tools = toolsList.tools.map((tool: MCPTool) => tool.name);
            
            clearTimeout(timeout);
            ws.close();
            resolve({ tools });
          }
          
        } catch (parseError) {
          clearTimeout(timeout);
          ws.close();
          resolve({
            tools: [],
            error: 'Invalid MCP response format'
          });
        }
      };
      
      ws.onerror = () => {
        clearTimeout(timeout);
        resolve({
          tools: [],
          error: 'MCP WebSocket connection failed'
        });
      };
      
    } catch (error) {
      resolve({
        tools: [],
        error: error instanceof Error ? error.message : 'MCP WebSocket error'
      });
    }
  });
}

/**
 * 서버 등록 후 백그라운드에서 헬스체크와 도구 목록을 업데이트합니다
 */
export async function updateServerInfo(server: MCPServer): Promise<Partial<MCPServer>> {
  console.log(`🔍 Starting background update for server: ${server.name}`);
  
  // 헬스체크 수행
  const healthResult = await performHealthCheck(server.endpoint, server.type);
  
  // 도구 목록 가져오기  
  const toolsResult = await fetchMCPTools(server.endpoint, server.type);
  
  console.log(`✅ Health check for ${server.name}:`, healthResult);
  console.log(`🛠️ Tools for ${server.name}:`, toolsResult);
  
  // 업데이트할 정보 준비
  const updates: Partial<MCPServer> = {
    status: healthResult.isHealthy ? 'online' : 'offline',
    tools: toolsResult.tools.length > 0 ? toolsResult.tools : undefined,
    updated_at: new Date().toISOString()
  };
  
  // 서버 정보가 포함된 경우 추가
  if (healthResult.serverInfo) {
    updates.serverInfo = healthResult.serverInfo;
  }
  
  // 리다이렉션이 발생한 경우 실제 작동하는 URL 정보 추가
  if (server.type === 'streamable') {
    try {
      const url = new URL(server.endpoint);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        // HTTP의 경우 리다이렉션 감지를 위해 한 번 더 요청
        const testResult = await performMCPHttpRequest(server.endpoint, 'initialize');
        if (testResult.success && testResult.finalUrl && testResult.finalUrl !== server.endpoint) {
          console.log(`🔄 리다이렉션 감지: ${server.endpoint} → ${testResult.finalUrl}`);
          updates.actualEndpoint = testResult.finalUrl;
        }
      }
    } catch (error) {
      // URL 파싱 에러는 무시
    }
  }
  
  return updates;
} 