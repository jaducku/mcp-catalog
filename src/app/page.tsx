'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Globe,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  Star
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/catalog');
  };

  const features = [
    {
      icon: <Server className="w-8 h-8" />,
      title: "MCP 서버 관리",
      description: "다양한 MCP 서버를 중앙에서 통합 관리하고 모니터링할 수 있습니다."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "실시간 상태 확인",
      description: "서버의 상태를 실시간으로 확인하고 문제 발생 시 즉시 알림을 받을 수 있습니다."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "빠른 배포",
      description: "간단한 설정으로 새로운 MCP 서버를 빠르게 등록하고 배포할 수 있습니다."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "보안 관리",
      description: "엔터프라이즈급 보안 기능으로 안전하게 서버를 관리할 수 있습니다."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "성능 모니터링",
      description: "서버 성능 지표와 사용량 통계를 실시간으로 모니터링합니다."
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "사용자 친화적",
      description: "직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다."
    }
  ];

  const stats = [
    { number: "100+", label: "등록된 서버" },
    { number: "50+", label: "활성 사용자" },
    { number: "99.9%", label: "가동률" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Server className="w-8 h-8 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  MCP Catalog
                </span>
              </div>
              <Badge variant="secondary">Beta</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-6xl font-bold">
                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MCP Catalog
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
                MCP 서버의 통합 관리 플랫폼
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Model Context Protocol 서버를 쉽게 등록하고 관리할 수 있는 
                차세대 카탈로그 서비스입니다. 실시간 모니터링과 직관적인 인터페이스로 
                복잡한 MCP 인프라를 효율적으로 관리하세요.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                시작하기
                <ArrowRight className="w-5 h-5" />
              </Button>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center space-y-4 mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">주요 기능</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              MCP Catalog이 제공하는 강력한 기능들로 서버 관리를 더욱 효율적으로 만들어보세요.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Server className="w-6 h-6 text-primary" />
              <span className="font-semibold">MCP Catalog</span>
              <Badge variant="secondary">Beta</Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2024 MCP Catalog. 모든 권리 보유.
            </div>
            
            <div className="flex items-center space-x-4">
                             <Button variant="ghost" size="sm">
                 문서
               </Button>
               <Button variant="ghost" size="sm">
                 지원
               </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 