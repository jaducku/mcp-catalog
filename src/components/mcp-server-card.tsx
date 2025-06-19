'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MCPServer } from '@/types/mcp';
import { ExternalLink, Server, Zap, Wrench } from 'lucide-react';
import { ServerStatusBadge } from '@/components/atoms/server-status-badge';

interface MCPServerCardProps {
  server: MCPServer;
  onShowDetails: () => void;
}



const typeConfig = {
  streamable: {
    icon: Zap,
    label: 'Streamable HTTP',
    variant: 'default' as const,
  },
  stdio: {
    icon: Server,
    label: 'STDIO',
    variant: 'secondary' as const,
  },
};

export function MCPServerCard({ server, onShowDetails }: MCPServerCardProps) {
  const typeInfo = typeConfig[server.type];
  const TypeIcon = typeInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={onShowDetails}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold line-clamp-1 flex-1">
              {server.name}
            </CardTitle>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant={typeInfo.variant} className="shrink-0">
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeInfo.label}
            </Badge>
            <ServerStatusBadge status={server.status} size="sm" />
          </div>

          <CardDescription className="line-clamp-2 min-h-[2.5rem]">
            {server.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <ExternalLink className="w-4 h-4" />
              <span className="truncate font-mono">{server.endpoint}</span>
            </div>
            
            {server.actualEndpoint && server.actualEndpoint !== server.endpoint && (
              <div className="flex items-center space-x-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                <span>↩️ 리다이렉션:</span>
                <span className="truncate font-mono">{server.actualEndpoint}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {server.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {server.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{server.tags.length - 3}
              </Badge>
            )}
          </div>

          {server.tools && server.tools.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Wrench className="w-3 h-3" />
                <span className="font-medium">{server.tools.length}</span>개 도구 사용 가능
              </div>
              <div className="flex flex-wrap gap-1">
                {server.tools.slice(0, 4).map((tool) => (
                  <Badge key={tool} variant="outline" className="text-xs bg-secondary text-secondary-foreground">
                    {tool}
                  </Badge>
                ))}
                {server.tools.length > 4 && (
                  <Badge variant="outline" className="text-xs bg-secondary text-secondary-foreground">
                    +{server.tools.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
          

        </CardContent>
      </Card>
    </motion.div>
  );
} 