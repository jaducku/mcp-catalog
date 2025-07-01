import { NextRequest, NextResponse } from 'next/server';
import { config, createApiUrls } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 환경변수로 설정된 도구 API URL 사용
    const toolsApiUrl = createApiUrls.tools();
    const response = await fetch(toolsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(config.healthCheckTimeout),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('MCP Tools API Error:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch MCP tools' },
      { status: 500 }
    );
  }
} 