'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMCPStore } from '@/store/mcp-store';
import { MCPServerCard } from '@/components/mcp-server-card';
import { SearchBox } from '@/components/search-box';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  Plus, 
  Server, 
  Globe
} from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';

export default function HomePage() {
  const router = useRouter();
  const { 
    filteredServers, 
    loading, 
    error, 
    isDrawerOpen, 
    setDrawerOpen,
    servers,
    initializeWithMockData
  } = useMCPStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 목 데이터로 초기화
    if (servers.length === 0) {
      initializeWithMockData();
    }
  }, []);

  const handleShowDetails = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };

  const handleRegisterServer = () => {
    router.push('/servers/new');
  };

  return (
    <div className="min-h-screen bg-background w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Server className="h-6 w-6 text-primary" />
                  MCP Catalog
                </SheetTitle>
                <SheetDescription>
                  MCP 서버를 등록하고 관리하세요
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-8 space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start transition-all duration-200"
                    onClick={() => {
                      router.push('/');
                      setDrawerOpen(false);
                    }}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    홈 (서버 목록)
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start transition-all duration-200"
                    onClick={() => {
                      handleRegisterServer();
                      setDrawerOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    MCP 서버 등록
                  </Button>
                </motion.div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">통계</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">
                    총 서버: <span className="font-medium text-foreground">{servers.length}</span>
                  </div>
                  <div className="text-muted-foreground">
                    온라인: <span className="font-medium text-green-600 dark:text-green-400">
                      {servers.filter(s => s.status === 'online').length}
                    </span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">MCP Catalog</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 max-w-md mx-auto">
            <SearchBox />
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                onClick={handleRegisterServer}
                className="gap-2 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                서버 등록
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">오류: {error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="w-3 h-3 bg-muted rounded-full"></div>
                      <div className="h-5 bg-muted rounded w-40"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="flex gap-1">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                    <div className="h-6 bg-muted rounded w-12"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Server className="h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-2xl font-semibold mb-3">등록된 MCP 서버가 없습니다</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              첫 번째 MCP 서버를 등록하여 시작해보세요. Model Context Protocol 서버를 통해 다양한 기능을 확장할 수 있습니다.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button 
                onClick={handleRegisterServer} 
                size="lg"
                className="transition-all duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                서버 등록하기
              </Button>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            <AnimatePresence>
              {filteredServers.map((server) => (
                <motion.div
                  key={server.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <MCPServerCard 
                    server={server} 
                    onShowDetails={() => handleShowDetails(server.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
} 