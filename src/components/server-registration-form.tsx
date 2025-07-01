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
import { CreateMCPServerRequest, ServerType } from '@/types/mcp';
import { fetchServerTools } from '@/lib/mcp-tools-fetcher';
import { Loader2, Plus, X, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    tools: string[];
    error?: string;
  } | null>(null);

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

  const validateServer = async () => {
    const endpoint = form.getValues('endpoint');
    const type = form.getValues('type');
    
    if (!endpoint || !type) {
      toast.error('엔드포인트와 서버 타입을 먼저 입력해주세요.');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      console.log('🔍 서버 검증 시작:', endpoint);
      
      const result = await fetchServerTools(endpoint, type, 10000);
      
      if (result.success) {
        setValidationResult({
          isValid: true,
          tools: result.toolNames,
        });
        
        toast.success('✅ 서버 검증 성공!', {
          description: `${result.toolNames.length}개의 Tool을 발견했습니다.`,
          duration: 3000,
        });
      } else {
        setValidationResult({
          isValid: false,
          tools: [],
          error: result.error,
        });
        
        toast.error('❌ 서버 검증 실패', {
          description: result.error || '서버에 연결할 수 없습니다.',
          duration: 4000,
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        tools: [],
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      });
      
      toast.error('❌ 검증 중 오류 발생', {
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        duration: 4000,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: ServerRegistrationFormData) => {
    try {
      // 등록 전 자동 Tool 목록 조회
      toast.info('🔧 서버 등록 중...', {
        description: 'Tool 목록을 조회하고 있습니다.',
        duration: 2000,
      });

      const toolsResult = await fetchServerTools(data.endpoint, data.type, 15000);
      
      const requestData: CreateMCPServerRequest = {
        ...data,
        tags,
      };
      
      await createServer(requestData);
      
      // 등록 완료 메시지
      if (toolsResult.success) {
        toast.success('🎉 MCP 서버가 등록되었습니다!', {
          description: `${toolsResult.toolNames.length}개의 Tool이 자동으로 등록되었습니다.`,
          duration: 4000,
        });
      } else {
        toast.success('🎉 MCP 서버가 등록되었습니다!', {
          description: '백그라운드에서 Tool 목록을 수집하고 있습니다...',
          duration: 4000,
        });
      }
      
      onSuccess();
      
      // Reset form
      form.reset();
      setTags([]);
      setCurrentTag('');
      setValidationResult(null);
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
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    placeholder="예: https://api.example.com 또는 ws://localhost:8080"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setValidationResult(null); // 입력 변경 시 검증 결과 초기화
                    }}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={validateServer}
                  disabled={isValidating || !field.value || !form.getValues('type')}
                  className="whitespace-nowrap"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      검증 중...
                    </>
                  ) : (
                    '서버 검증'
                  )}
                </Button>
              </div>
              <FormDescription>
                HTTP URL (https://) 또는 WebSocket URL (ws://, wss://)을 입력하세요
              </FormDescription>
              
              {/* 검증 결과 표시 */}
              {validationResult && (
                <div className={`mt-2 p-3 rounded-lg border ${
                  validationResult.isValid 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' 
                    : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {validationResult.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        validationResult.isValid 
                          ? 'text-green-800 dark:text-green-200' 
                          : 'text-red-800 dark:text-red-200'
                      }`}>
                        {validationResult.isValid ? '✅ 서버 연결 성공' : '❌ 서버 연결 실패'}
                      </p>
                      {validationResult.isValid ? (
                        <div className="mt-1">
                          <p className="text-xs text-green-700 dark:text-green-300">
                            {validationResult.tools.length}개의 Tool 발견
                          </p>
                          {validationResult.tools.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {validationResult.tools.slice(0, 5).map((tool) => (
                                <Badge key={tool} variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30">
                                  {tool}
                                </Badge>
                              ))}
                              {validationResult.tools.length > 5 && (
                                <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30">
                                  +{validationResult.tools.length - 5}개 더
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          {validationResult.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
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
              <p className="font-medium mb-2 text-foreground">🔄 등록 후 백그라운드에서 자동 실행:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>헬스체크</strong>: 서버 연결 상태 확인 (HTTP/WebSocket 응답)</li>
                <li><strong>리다이렉션 처리</strong>: 307/301/302 응답 자동 감지 및 처리</li>
                <li><strong>도구 수집</strong>: 사용 가능한 MCP 도구 목록 자동 수집</li>
                <li><strong>상태 업데이트</strong>: 실시간 서버 상태 모니터링 시작</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 등록 즉시 서버 카드가 표시되며, 백그라운드에서 상태가 업데이트됩니다.<br/>
                ↩️ HTTP 리다이렉션이 감지되면 실제 작동하는 URL이 표시됩니다.
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