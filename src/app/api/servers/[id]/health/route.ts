import { NextRequest, NextResponse } from 'next/server';
import { getMCPServerService } from '@/lib/services/mcp-server-service';
import { DatabaseError } from '@/lib/database/types';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/servers/[id]/health - 서버 헬스체크 및 상태 업데이트
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // 서버 상태 업데이트 (Tool 목록 조회 포함)
    const updatedServer = await service.updateServerStatus(id);

    return NextResponse.json({
      success: true,
      data: updatedServer,
      message: '서버 헬스체크가 완료되었습니다.',
    });

  } catch (error) {
    console.error(`POST /api/servers/[id]/health error:`, error);
    
    const statusCode = error instanceof DatabaseError ? 500 : 500;
    const message = error instanceof DatabaseError 
      ? error.message 
      : '서버 헬스체크 중 오류가 발생했습니다.';

    return NextResponse.json({
      success: false,
      error: message,
    }, { status: statusCode });
  }
} 