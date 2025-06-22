'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMCPStore } from '@/store/mcp-store';
import { CreateMCPServerRequest, ServerType, MCPToolInfo } from '@/types/mcp';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const serverRegistrationSchema = z.object({
  name: z.string()
    .min(1, '서버 이름을 입력해주세요')
    .max(100, '서버 이름은 100자 이하여야 합니다'),
  endpoint: z.string()
    .min(1, '엔드포인트를 입력해주세요')
    .url('올바른 URL 형식을 입력해주세요'),
  type: z.enum(['streamable', 'stdio'] as const, {
    required_error: '서버 타입을 선택해주세요',
  }),
  description: z.string()
    .min(1, '설명을 입력해주세요')
    .max(500, '설명은 500자 이하여야 합니다'),
  tags: z.array(z.string()).min(1, '최소 1개 이상의 태그를 입력해주세요'),
});

type ServerRegistrationFormData = z.infer<typeof serverRegistrationSchema>;

interface ServerRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ServerRegistrationForm({ onSuccess, onCancel }: ServerRegistrationFormProps) {
  const { createServer, loading } = useMCPStore();
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const form = useForm<ServerRegistrationFormData>({
    resolver: zodResolver(serverRegistrationSchema),
    defaultValues: {
      name: '',
      endpoint: '',
      type: 'streamable',
      description: '',
      tags: [],
    },
  });

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()];
      setTags(newTags);
      form.setValue('tags', newTags);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  // MCP 서버에서 도구 정보를 가져오는 함수
  const fetchMCPTools = async (endpoint: string) => {
    try {
      // Next.js API route를 통해 MCP 서버의 도구 정보 요청 (CORS 우회)
      const response = await fetch('/api/mcp-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: endpoint
        }),
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('API 응답:', data); // 디버깅용 로그
      
      // API 응답에서 도구 정보 추출 (다양한 응답 구조 대응)
      let tools = [];
      
      if (Array.isArray(data)) {
        // 응답이 배열인 경우
        tools = data;
      } else if (data.tools && Array.isArray(data.tools)) {
        // 응답이 객체이고 tools 속성이 있는 경우
        tools = data.tools;
      } else if (data.result && Array.isArray(data.result)) {
        // 응답이 객체이고 result 속성이 있는 경우
        tools = data.result;
      }
      
      return tools.map((tool: any) => ({
        name: tool.name || tool.tool_name || tool.id || 'Unknown Tool',
        description: tool.description || tool.desc || tool.summary || 'No description available'
      }));
          } catch (error) {
        console.error('도구 정보 가져오기 실패:', error);
        
        if (error instanceof Error && error.message.includes('fetch')) {
          toast.error('API 서버에 연결할 수 없습니다. 8080포트가 실행 중인지 확인해주세요.');
        } else {
          toast.error('도구 정보를 가져오는데 실패했습니다. 기본 정보로 등록됩니다.');
        }
        
        return [];
      }
  };

  const onSubmit = async (data: ServerRegistrationFormData) => {
    try {
      // 도구 정보 가져오기
      toast.info('🔍 MCP 서버에서 도구 정보를 가져오는 중...', {
        duration: 2000,
      });
      
      const tools = await fetchMCPTools(data.endpoint);
      
      const requestData: CreateMCPServerRequest = {
        ...data,
        tags,
        // 가져온 도구 정보 추가
        tools: tools.map((tool: MCPToolInfo) => tool.name),
        toolsInfo: tools, // 도구 상세 정보도 함께 저장
      };
      
      await createServer(requestData);
      
      // 등록 완료 메시지
      if (tools.length > 0) {
        toast.success('🎉 MCP 서버가 등록되었습니다!', {
          description: `✅ ${tools.length}개의 도구와 함께 등록되었습니다. 서버가 온라인 상태로 설정되었습니다.`,
          duration: 4000,
        });
      } else {
        toast.success('🎉 MCP 서버가 등록되었습니다!', {
          description: '⏳ 도구 정보를 가져올 수 없어 백그라운드에서 헬스체크를 진행합니다.',
          duration: 4000,
        });
      }
      
      onSuccess();
      
      // Reset form
      form.reset();
      setTags([]);
      setCurrentTag('');
    } catch (error) {
      toast.error('서버 등록 중 오류가 발생했습니다.');
      console.error('Failed to create server:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>서버 이름 *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="예: Mempool WebSocket MCP"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>서버 타입 *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="타입 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="streamable">Streamable HTTP</SelectItem>
                    <SelectItem value="stdio">STDIO</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  HTTP API는 Streamable, 로컬 실행은 STDIO를 선택하세요
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>엔드포인트 URL *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="예: https://api.example.com 또는 ws://localhost:8080"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                HTTP URL (https://) 또는 WebSocket URL (ws://, wss://)을 입력하세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="MCP 서버가 제공하는 기능을 간단히 설명해주세요"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Label>태그 *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="태그 입력 (예: bitcoin, api, websocket)"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="icon"
                disabled={!currentTag.trim()}
                className="transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {form.formState.errors.tags && (
            <p className="text-sm text-destructive">
              {form.formState.errors.tags.message}
            </p>
          )}
        </div>

        <Card className="bg-muted/50 border-muted">
          <CardContent className="pt-4">
            <div className="text-sm">
              <p className="font-medium mb-2 text-foreground">🔄 등록 시 자동 실행:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>도구 정보 수집</strong>: API를 통해 MCP 도구 목록과 설명 자동 수집</li>
                <li><strong>헬스체크</strong>: 서버 연결 상태 확인 (HTTP/WebSocket 응답)</li>
                <li><strong>리다이렉션 처리</strong>: 307/301/302 응답 자동 감지 및 처리</li>
                <li><strong>상태 업데이트</strong>: 실시간 서버 상태 모니터링 시작</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 등록 시 도구 정보를 먼저 수집한 후 서버가 카탈로그에 추가됩니다.<br/>
                🔧 API를 통해 수집된 도구 정보는 서버 상세 페이지에서 확인할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
              className="transition-all duration-200"
            >
              취소
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Button 
              type="submit" 
              disabled={loading}
              className="transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  등록 중...
                </>
              ) : (
                '서버 등록'
              )}
            </Button>
          </motion.div>
        </div>
      </form>
    </Form>
  );
} 