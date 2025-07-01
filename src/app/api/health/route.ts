import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/database/factory';

// GET /api/health - 애플리케이션 및 데이터베이스 헬스체크
export async function GET() {
  try {
    const startTime = Date.now();
    
    // 데이터베이스 연결 상태 확인
    const dbStatus = await checkDatabaseConnection();
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbStatus.connected,
        type: dbStatus.type,
        error: dbStatus.error,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
      },
    };

    // 데이터베이스 연결 실패 시 상태를 unhealthy로 변경
    if (!dbStatus.connected) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
} 