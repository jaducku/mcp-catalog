import { NextRequest, NextResponse } from 'next/server';
import { getMCPServerService } from '@/lib/services/mcp-server-service';
import { DatabaseError } from '@/lib/database/types';
import { CreateMCPServerRequest, MCPServerSearchParams } from '@/types/mcp';

// GET /api/servers - 서버 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 검색 파라미터 파싱
    const params: MCPServerSearchParams = {
      search: searchParams.get('search') || undefined,
      type: searchParams.get('type') as any || undefined,
      status: searchParams.get('status') as any || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    };

    const service = getMCPServerService();
    
    // 검색 파라미터가 있으면 검색, 없으면 전체 조회
    const hasSearchParams = Object.values(params).some(value => value !== undefined);
    const servers = hasSearchParams 
      ? await service.searchServers(params)
      : await service.getAllServers();

    return NextResponse.json({
      success: true,
      data: servers,
      count: servers.length,
    });

  } catch (error) {
    console.error('GET /api/servers error:', error);
    
    const statusCode = error instanceof DatabaseError ? 500 : 500;
    const message = error instanceof DatabaseError 
      ? error.message 
      : '서버 목록을 가져오는 중 오류가 발생했습니다.';

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: statusCode });
  }
}

// POST /api/servers - 새 서버 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateMCPServerRequest = await request.json();
    
    // 요청 데이터 검증
    if (!body.name || !body.endpoint || !body.type) {
      return NextResponse.json({
        success: false,
        error: '필수 필드가 누락되었습니다. (name, endpoint, type)',
      }, { status: 400 });
    }

    // 서버 타입 검증
    if (!['streamable', 'stdio'].includes(body.type)) {
      return NextResponse.json({
        success: false,
        error: 'type은 streamable 또는 stdio여야 합니다.',
      }, { status: 400 });
    }

    const service = getMCPServerService();
    const server = await service.createServer(body);

    return NextResponse.json({
      success: true,
      data: server,
      message: '서버가 성공적으로 등록되었습니다.',
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/servers error:', error);
    
    const statusCode = error instanceof DatabaseError ? 500 : 500;
    const message = error instanceof DatabaseError 
      ? error.message 
      : '서버 생성 중 오류가 발생했습니다.';

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: statusCode });
  }
} 