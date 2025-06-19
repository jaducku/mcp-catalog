'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerRegistrationForm } from '@/components/server-registration-form';
import { ModeToggle } from '@/components/mode-toggle';

export default function NewServerPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
            <ModeToggle />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              새 MCP 서버 등록
            </h1>
            <p className="text-muted-foreground">
              새로운 Model Context Protocol 서버를 카탈로그에 추가하세요
            </p>
          </div>
        </motion.div>

        {/* 등록 폼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>서버 정보</CardTitle>
              <CardDescription>
                MCP 서버의 기본 정보를 입력해주세요. 등록 후 자동으로 헬스체크가 진행됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServerRegistrationForm
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 