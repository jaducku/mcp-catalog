// MCP JSON-RPC Protocol Types
export interface MCPJsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPJsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPInitializeParams {
  protocolVersion: string;
  capabilities: {
    roots?: {
      listChanged?: boolean;
    };
    sampling?: {};
  };
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface MCPInitializeResult {
  protocolVersion: string;
  capabilities: {
    logging?: {};
    prompts?: {
      listChanged?: boolean;
    };
    resources?: {
      subscribe?: boolean;
      listChanged?: boolean;
    };
    tools?: {
      listChanged?: boolean;
    };
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolsListResult {
  tools: MCPTool[];
}

export interface MCPError extends Error {
  code: number;
  data?: any;
}

export class MCPConnectionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'MCPConnectionError';
  }
}

export class MCPProtocolError extends Error {
  constructor(message: string, public readonly code: number, public readonly data?: any) {
    super(message);
    this.name = 'MCPProtocolError';
    this.code = code;
    this.data = data;
  }
} 