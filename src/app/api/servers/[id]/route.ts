import { NextRequest, NextResponse } from 'next/server';
import { getMCPServerService } from '@/lib/services/mcp-server-service';
import { DatabaseError } from '@/lib/database/types';
import { MCPServer } from '@/types/mcp';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/servers/[id] - 특정 서버 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '서버 ID가 필요합니다.',
      }, { status: 400 });
    }

    const service = getMCPServerService();
    const server = await service.getServerById(id);

    if (!server) {
      return NextResponse.json({
        success: false,
        error: '서버를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: server,
    });

  } catch (error) {
    console.error(`GET /api/servers/[id] error:`, error);
    
    const statusCode = error instanceof DatabaseError ? 500 : 500;
    const message = error instanceof DatabaseError 
      ? error.message 
      : '서버 정보를 가져오는 중 오류가 발생했습니다.';

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: statusCode });
  }
}

// PUT /api/servers/[id] - 서버 정보 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: Partial<MCPServer> = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '서버 ID가 필요합니다.',
      }, { status: 400 });
    }

    // 수정 불가능한 필드 제거
    const { id: _id, created_at: _created_at, ...updates } = body;

    const service = getMCPServerService();
    const updatedServer = await service.updateServer(id, updates);

    return NextResponse.json({
      success: true,
      data: updatedServer,
      message: '서버 정보가 성공적으로 업데이트되었습니다.',
    });

  } catch (error) {
    console.error(`PUT /api/servers/[id] error:`, error);
    
    const statusCode = error instanceof DatabaseError ? 500 : 500;
    const message = error instanceof DatabaseError 
      ? error.message 
      : '서버 정보 업데이트 중 오류가 발생했습니다.';

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: statusCode });
  }
}

// DELETE /api/servers/[id] - 서버 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '서버 ID가 필요합니다.',
      }, { status: 400 });
    }

    const service = getMCPServerService();
    
    // 서버 존재 여부 확인
    const existingServer = await service.getServerById(id);
    if (!existingServer) {
      return NextResponse.json({
        success: false,
        error: '서버를 찾을 수 없습니다.',
      }, { status: 404 });
    }

    await service.deleteServer(id);

    return NextResponse.json({
      success: true,
      message: '서버가 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error(`DELETE /api/servers/[id] error:`, error);
    
    const statusCode = error instanceof DatabaseError ? 500 : 500;
    const message = error instanceof DatabaseError 
      ? error.message 
      : '서버 삭제 중 오류가 발생했습니다.';

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: statusCode });
  }
} 