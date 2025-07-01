'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Server, Zap, Wrench, Clock, Globe, Tag, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useMCPStore } from '@/store/mcp-store';
import { ServerStatusBadge } from '@/components/atoms/server-status-badge';
import { toast } from 'sonner';
import { MCPServer } from '@/types/mcp';
import { ModeToggle } from '@/components/mode-toggle';
import { getToolDescription } from '@/lib/mock-data';

interface ServerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}



const typeConfig = {
  streamable: {
    icon: Zap,
    label: 'Streamable HTTP',
    variant: 'default' as const,
    description: 'HTTP 또는 WebSocket을 통한 실시간 스트리밍 연결'
  },
  stdio: {
    icon: Server,
    label: 'STDIO',
    variant: 'secondary' as const,
    description: '표준 입출력을 통한 로컬 프로세스 연결'
  },
};

export default function ServerDetailPage({ params }: ServerDetailPageProps) {
  const router = useRouter();
  const { servers } = useMCPStore();
  const { id } = React.use(params);
  
  const server = servers.find(s => s.id === id);

  if (!server) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">서버를 찾을 수 없습니다</h1>
          <Button onClick={() => router.push('/catalog')}>
            카탈로그로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const typeInfo = typeConfig[server.type];
  const TypeIcon = typeInfo.icon;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}이(가) 클립보드에 복사되었습니다! 📋`);
    } catch (error) {
      toast.error('복사에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const generateMCPConfig = (server: MCPServer) => {
    const serverKey = server.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const actualUrl = server.actualEndpoint || server.endpoint;
    
    const config = {
      [serverKey]: {
        transport: server.type === 'streamable' ? 'streamable-http' : 'stdio',
        ...(server.type === 'streamable' ? { url: actualUrl } : { command: actualUrl })
      }
    };
    
    return JSON.stringify(config, null, 4);
  };

<<<<<<< HEAD

=======
  const getToolDescription = (toolName: string) => {
    // 실제 저장된 도구 정보가 있으면 우선 사용
    if (server.toolsInfo) {
      const toolInfo = server.toolsInfo.find(tool => tool.name === toolName);
      if (toolInfo) {
        return {
          description: toolInfo.description,
          parameters: [] // API에서 매개변수 정보를 제공하지 않는 경우
        };
      }
    }
    
    // 저장된 정보가 없으면 Mock descriptions 사용
    const descriptions: Record<string, { description: string; parameters?: string[] }> = {
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
      'get_weather': {
        description: '지정된 지역의 현재 날씨 정보를 조회합니다. 온도, 습도, 풍속, 날씨 상태 등을 제공합니다.',
        parameters: ['location: 지역명 또는 위도/경도', 'units (선택사항): 온도 단위 (C/F)']
      },
      'send_email': {
        description: '이메일을 발송합니다. HTML 형식 지원, 첨부파일 추가, 예약 발송 등의 기능을 제공합니다.',
        parameters: ['to: 수신자 이메일', 'subject: 제목', 'body: 본문', 'attachments (선택사항): 첨부파일']
      },
      'predict_model': {
        description: '훈련된 머신러닝 모델을 사용하여 예측을 수행합니다. 다양한 데이터 형식을 지원합니다.',
        parameters: ['model_name: 사용할 모델명', 'input_data: 예측할 데이터', 'confidence (선택사항): 신뢰도 임계값']
      }
    };
    
    return descriptions[toolName] || {
      description: '이 도구에 대한 상세 정보가 아직 제공되지 않습니다. 서버 개발자에게 문의하여 도구 설명을 요청해보세요.',
      parameters: []
    };
  };
>>>>>>> 6ee7c5f8a3727457b3b5e6a91cb616b5ecb5d71d

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
            <ModeToggle />
          </div>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {server.name}
              </h1>
              <p className="text-muted-foreground text-lg">
                {server.description}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={typeInfo.variant} className="text-sm">
                <TypeIcon className="w-4 h-4 mr-2" />
                {typeInfo.label}
              </Badge>
              <ServerStatusBadge status={server.status} size="md" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 연결 정보 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    연결 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-muted-foreground">엔드포인트</label>
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(server.endpoint, '엔드포인트 URL')}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        복사
                      </Button>
                    </div>
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono block">
                      {server.endpoint}
                    </code>
                  </div>
                  
                  {server.actualEndpoint && server.actualEndpoint !== server.endpoint && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-primary">실제 연결 URL</label>
                          <span className="text-sm">↩️</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(server.actualEndpoint!, '실제 연결 URL')}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1 text-primary" />
                          <span className="text-primary">복사</span>
                        </Button>
                      </div>
                      <code className="text-sm bg-primary/10 px-2 py-1 rounded font-mono text-primary block border border-primary/20">
                        {server.actualEndpoint}
                      </code>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">연결 타입</label>
                    <p className="text-sm text-foreground">
                      {typeInfo.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">환경설정</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generateMCPConfig(server), 'MCP 환경설정')}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        복사
                      </Button>
                    </div>
                    <div className="relative">
                      <pre className="text-xs bg-muted text-muted-foreground p-3 rounded-lg overflow-x-auto font-mono leading-relaxed border">
                        <code>{generateMCPConfig(server)}</code>
                      </pre>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      이 설정을 MCP 클라이언트의 설정 파일에 추가하세요 (예: ~/.cursor/mcp.json)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 도구 목록 */}
            {server.tools && server.tools.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      사용 가능한 도구 ({server.tools.length}개)
                    </CardTitle>
                    <CardDescription>
                      도구를 클릭하면 상세 정보를 확인할 수 있습니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                      {server.tools.map((tool, index) => {
                        const toolInfo = getToolDescription(tool);
                        return (
                          <AccordionItem 
                            key={tool} 
                            value={`tool-${index}`}
                            className="border border-primary/20 rounded-lg px-4 bg-primary/5"
                          >
                            <AccordionTrigger className="hover:no-underline py-3">
                              <div className="flex items-center gap-2">
                                <Wrench className="w-4 h-4 text-primary" />
                                <span className="font-medium text-primary">{tool}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="space-y-3 pt-2">
                                <div>
                                  <h4 className="text-sm font-medium text-foreground mb-1">설명</h4>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {toolInfo.description}
                                  </p>
                                </div>
                                
                                {toolInfo.parameters && toolInfo.parameters.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium text-foreground mb-2">매개변수</h4>
                                    <ul className="space-y-1">
                                      {toolInfo.parameters.map((param, paramIndex) => (
                                        <li key={paramIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                          <span className="text-primary mt-1">•</span>
                                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono flex-1">
                                            {param}
                                          </code>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 서버 정보 */}
            {server.serverInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5" />
                      서버 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">서버 이름</label>
                        <p className="text-sm font-mono mt-1">{server.serverInfo.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">버전</label>
                        <p className="text-sm font-mono mt-1">{server.serverInfo.version}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">프로토콜 버전</label>
                        <p className="text-sm font-mono mt-1">{server.serverInfo.protocolVersion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 태그 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    태그
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {server.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 메타데이터 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    메타데이터
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">등록일</label>
                    <p className="text-sm mt-1">
                      {new Date(server.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">마지막 업데이트</label>
                    <p className="text-sm mt-1">
                      {new Date(server.updated_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 액션 버튼들 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>액션</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      // TODO: 헬스체크 재실행
                      console.log('헬스체크 재실행');
                    }}
                  >
                    <Wrench className="w-4 h-4" />
                    헬스체크 재실행
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 